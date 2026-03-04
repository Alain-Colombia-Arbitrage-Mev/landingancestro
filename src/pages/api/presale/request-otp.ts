export const prerender = false;

import type { APIRoute } from 'astro';
import pool from '../../../lib/db';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: import.meta.env.PUBLIC_COGNITO_REGION || 'us-east-1',
});

const USER_POOL_ID = import.meta.env.PUBLIC_COGNITO_USER_POOL_ID || '';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 16; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd + '!1Aa';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const whitelistResult = await pool.query(
      'SELECT id, email, cognito_username FROM presale_whitelist WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (whitelistResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'not_whitelisted' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = whitelistResult.rows[0];
    let cognitoUsername = row.cognito_username;

    if (!cognitoUsername) {
      const tempPassword = generateTempPassword();
      const username = `presale_${normalizedEmail.replace(/[@.]/g, '_')}`;

      try {
        await cognitoClient.send(new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          UserAttributes: [
            { Name: 'email', Value: normalizedEmail },
            { Name: 'email_verified', Value: 'false' },
          ],
          TemporaryPassword: tempPassword,
          MessageAction: 'SUPPRESS',
          DesiredDeliveryMediums: [],
        }));

        await cognitoClient.send(new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          Password: tempPassword,
          Permanent: true,
        }));
      } catch (err: any) {
        if (err.name !== 'UsernameExistsException') throw err;
      }

      cognitoUsername = username;
      await pool.query(
        'UPDATE presale_whitelist SET cognito_username = $1 WHERE id = $2',
        [cognitoUsername, row.id]
      );
    }

    // Use Cognito signUp + confirmSignUp flow for OTP
    // Since we already have the user, we trigger a verification code via resend
    const { signUp, resendSignUpConfirmationCode } = await import('aws-amplify/auth');
    const { configureAmplify } = await import('../../../lib/amplify');
    configureAmplify();

    try {
      await resendSignUpConfirmationCode({ username: normalizedEmail });
    } catch (resendErr: any) {
      // If user doesn't exist in Amplify context, create via signUp
      if (resendErr.name === 'UserNotFoundException') {
        const tempPwd = generateTempPassword();
        await signUp({
          username: normalizedEmail,
          password: tempPwd,
          options: {
            userAttributes: { email: normalizedEmail },
          },
        });
      } else if (resendErr.name === 'InvalidParameterException' && resendErr.message?.includes('confirmed')) {
        // User already confirmed - we need a different approach
        // Delete and recreate to get a new code
        return new Response(
          JSON.stringify({ success: false, error: 'already_verified' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        throw resendErr;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('request-otp error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
