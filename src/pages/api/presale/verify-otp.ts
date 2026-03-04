export const prerender = false;

import type { APIRoute } from 'astro';
import pool from '../../../lib/db';
import { signPresaleToken } from '../../../lib/presale-auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, code } = body as { email?: string; code?: string };

    if (!email || !code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const whitelistResult = await pool.query(
      'SELECT id FROM presale_whitelist WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (whitelistResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'not_whitelisted' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { confirmSignUp } = await import('aws-amplify/auth');
    const { configureAmplify } = await import('../../../lib/amplify');
    configureAmplify();

    try {
      await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: code.trim(),
      });
    } catch (err: any) {
      if (err.name === 'CodeMismatchException') {
        return new Response(
          JSON.stringify({ success: false, error: 'invalid_otp' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (err.name === 'ExpiredCodeException') {
        return new Response(
          JSON.stringify({ success: false, error: 'expired_otp' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // If already confirmed, that's fine - grant access
      if (err.name !== 'NotAuthorizedException') {
        throw err;
      }
    }

    await pool.query(
      'UPDATE presale_whitelist SET verified = true WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await pool.query(
      'INSERT INTO presale_access_log (method, identifier, ip_address) VALUES ($1, $2, $3)',
      ['whitelist_otp', normalizedEmail, ip]
    );

    const accessToken = signPresaleToken(normalizedEmail, 'whitelist_otp');

    return new Response(
      JSON.stringify({ success: true, accessToken }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('verify-otp error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
