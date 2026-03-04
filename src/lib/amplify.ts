import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.PUBLIC_COGNITO_USER_POOL_ID || '';
const userPoolClientId = import.meta.env.PUBLIC_COGNITO_CLIENT_ID || '';
const region = import.meta.env.PUBLIC_COGNITO_REGION || 'us-east-1';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: 'code',
        loginWith: {
          oauth: {
            domain: `ancestro.auth.${region}.amazoncognito.com`,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:4321/'],
            redirectSignOut: [typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:4321/'],
            responseType: 'code',
            providers: ['Google'],
          },
        },
      },
    },
  });
}
