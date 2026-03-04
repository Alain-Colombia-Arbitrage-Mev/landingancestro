import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
  signInWithRedirect,
  getCurrentUser,
  fetchUserAttributes,
  updatePassword,
  updateUserAttributes,
  resendSignUpCode,
} from 'aws-amplify/auth';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

// ===== ERROR MAPPING =====
const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  es: {
    UserNotConfirmedException: 'Tu cuenta no ha sido verificada. Revisa tu correo.',
    NotAuthorizedException: 'Correo o contraseña incorrectos.',
    UsernameExistsException: 'Ya existe una cuenta con este correo.',
    UserNotFoundException: 'No existe una cuenta con este correo.',
    CodeMismatchException: 'El código ingresado no es válido.',
    ExpiredCodeException: 'El código ha expirado. Solicita uno nuevo.',
    InvalidPasswordException: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
    LimitExceededException: 'Demasiados intentos. Intenta de nuevo más tarde.',
    TooManyRequestsException: 'Demasiadas solicitudes. Espera un momento.',
    InvalidParameterException: 'Los datos ingresados no son válidos.',
    UserAlreadyAuthenticatedException: 'Ya tienes una sesión activa.',
    default: 'Ocurrió un error. Intenta de nuevo.',
  },
  en: {
    UserNotConfirmedException: 'Your account has not been verified. Check your email.',
    NotAuthorizedException: 'Incorrect email or password.',
    UsernameExistsException: 'An account with this email already exists.',
    UserNotFoundException: 'No account found with this email.',
    CodeMismatchException: 'The code entered is not valid.',
    ExpiredCodeException: 'The code has expired. Request a new one.',
    InvalidPasswordException: 'Password must have at least 8 characters, one uppercase, one lowercase and one number.',
    LimitExceededException: 'Too many attempts. Try again later.',
    TooManyRequestsException: 'Too many requests. Please wait.',
    InvalidParameterException: 'The data entered is not valid.',
    UserAlreadyAuthenticatedException: 'You already have an active session.',
    default: 'An error occurred. Please try again.',
  },
};

export function getAuthErrorMessage(error: any, lang: string = 'es'): string {
  const messages = ERROR_MESSAGES[lang] || ERROR_MESSAGES['en'];
  const errorName = error?.name || error?.code || '';

  // Handle Amplify v6 error format
  if (errorName && messages[errorName]) {
    return messages[errorName];
  }

  // Try to match by message content
  const msg = error?.message || '';
  if (msg.includes('not confirmed')) return messages['UserNotConfirmedException'];
  if (msg.includes('Incorrect username or password')) return messages['NotAuthorizedException'];
  if (msg.includes('User already exists')) return messages['UsernameExistsException'];
  if (msg.includes('User does not exist')) return messages['UserNotFoundException'];
  if (msg.includes('Invalid verification code')) return messages['CodeMismatchException'];
  if (msg.includes('expired')) return messages['ExpiredCodeException'];
  if (msg.includes('Password did not conform')) return messages['InvalidPasswordException'];
  if (msg.includes('Attempt limit exceeded')) return messages['LimitExceededException'];

  return messages['default'];
}

// ===== SIGN UP =====
export async function cognitoSignUp(
  email: string,
  password: string,
  name: string,
  phone?: string
) {
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
        ...(phone ? { phone_number: phone } : {}),
      },
    },
  });
  return result;
}

// ===== CONFIRM SIGN UP =====
export async function cognitoConfirmSignUp(email: string, code: string) {
  const result = await confirmSignUp({
    username: email,
    confirmationCode: code,
  });
  return result;
}

// ===== SIGN IN =====
export async function cognitoSignIn(email: string, password: string) {
  const result = await signIn({
    username: email,
    password,
  });
  return result;
}

// ===== GOOGLE SIGN IN =====
export async function cognitoSignInWithGoogle() {
  await signInWithRedirect({ provider: 'Google' });
}

// ===== SIGN OUT =====
export async function cognitoSignOut() {
  await signOut();
}

// ===== FORGOT PASSWORD =====
export async function cognitoForgotPassword(email: string) {
  const result = await resetPassword({ username: email });
  return result;
}

// ===== CONFIRM RESET PASSWORD =====
export async function cognitoConfirmResetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  await confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
}

// ===== GET COGNITO TOKEN =====
export async function getCognitoToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

// ===== RESEND SIGN UP CODE =====
export async function cognitoResendCode(email: string) {
  await resendSignUpCode({ username: email });
}

// ===== GET CURRENT COGNITO USER =====
export async function getCognitoUser() {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    return {
      userId: user.userId,
      email: attributes.email || '',
      name: attributes.name || '',
      phone: attributes.phone_number || '',
      emailVerified: attributes.email_verified === 'true',
    };
  } catch {
    return null;
  }
}

// ===== UPDATE PASSWORD =====
export async function cognitoChangePassword(oldPassword: string, newPassword: string) {
  await updatePassword({ previousPassword: oldPassword, proposedPassword: newPassword });
}

// ===== UPDATE USER ATTRIBUTES =====
export async function cognitoUpdateProfile(attributes: { name?: string; phone_number?: string }) {
  const userAttributes: Record<string, string> = {};
  if (attributes.name) userAttributes.name = attributes.name;
  if (attributes.phone_number) userAttributes.phone_number = attributes.phone_number;
  await updateUserAttributes({ userAttributes });
}

// ===== SYNC WITH BACKEND =====
export async function syncWithBackend(cognitoToken: string): Promise<{ user: any; token: string } | null> {
  try {
    const response = await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cognitoToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend sync failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Backend sync error:', error);
    return null;
  }
}

// ===== CHECK & RESTORE SESSION =====
export async function checkAndRestoreSession(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens?.idToken) return false;

    // Session is valid - try to get user info
    const cognitoUser = await getCognitoUser();
    if (!cognitoUser) return false;

    return true;
  } catch {
    return false;
  }
}

// ===== HANDLE OAUTH CALLBACK =====
export async function handleOAuthCallback(): Promise<{ user: any; token: string | null } | null> {
  try {
    const cognitoUser = await getCognitoUser();
    if (!cognitoUser) return null;

    const idToken = await getCognitoToken();

    // Sync with backend
    if (idToken) {
      const backendResult = await syncWithBackend(idToken);
      if (backendResult) {
        return backendResult;
      }
    }

    // Fallback: return Cognito data
    return {
      user: {
        id: cognitoUser.userId,
        email: cognitoUser.email,
        name: cognitoUser.name || cognitoUser.email.split('@')[0],
        phone: cognitoUser.phone,
        isVerified: cognitoUser.emailVerified,
        createdAt: new Date().toISOString(),
      },
      token: idToken,
    };
  } catch {
    return null;
  }
}
