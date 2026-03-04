import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.PUBLIC_COGNITO_USER_POOL_ID || '';
const userPoolClientId = import.meta.env.PUBLIC_COGNITO_CLIENT_ID || '';
const cognitoDomain = import.meta.env.PUBLIC_COGNITO_DOMAIN || '';

function getRedirectUri(): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/`;
  return import.meta.env.PUBLIC_REDIRECT_URI ? `${import.meta.env.PUBLIC_REDIRECT_URI}/` : 'http://localhost:4321/';
}

export function configureAmplify() {
  const redirectUri = getRedirectUri();

  const config: any = {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: 'code',
      },
    },
  };

  if (cognitoDomain) {
    config.Auth.Cognito.loginWith = {
      oauth: {
        domain: cognitoDomain.replace('https://', ''),
        scopes: ['openid', 'email', 'profile'],
        redirectSignIn: [redirectUri],
        redirectSignOut: [redirectUri],
        responseType: 'code',
        providers: ['Google'],
      },
    };
  }

  Amplify.configure(config);
}
