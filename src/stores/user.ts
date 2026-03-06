import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// ===== USER INTERFACE =====
export interface User {
  id: string;
  cognitoId?: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  country?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

// ===== AUTH STATE =====
export const currentUser = persistentAtom<User | null>('ancestro:user', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const authToken = persistentAtom<string | null>('ancestro:token', null);

export const isAuthenticated = computed(currentUser, (user) => user !== null);

export const isAuthLoading = atom<boolean>(false);

// ===== AUTH ACTIONS =====
export function setUser(user: User) {
  currentUser.set(user);
}

export function setAuthToken(token: string) {
  authToken.set(token);
}

export function clearAuth() {
  currentUser.set(null);
  authToken.set(null);
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('CognitoIdentityServiceProvider') || key.startsWith('amplify'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; needsVerification?: boolean; needsNewPassword?: boolean; error?: any }> {
  isAuthLoading.set(true);

  try {
    const { configureAmplify } = await import('../lib/amplify');
    configureAmplify();

    const { cognitoSignIn, getCognitoToken, getCognitoUser, syncWithBackend } = await import('../lib/auth');

    const signInResult = await cognitoSignIn(email, password);

    if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      return { success: false, needsVerification: true };
    }

    if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return { success: false, needsNewPassword: true };
    }

    if (signInResult.isSignedIn) {
      const cognitoToken = await getCognitoToken();
      if (cognitoToken) {
        const backendResult = await syncWithBackend(cognitoToken);
        if (backendResult) {
          setUser(backendResult.user);
          setAuthToken(backendResult.token);
          return { success: true };
        }
      }
      // Fallback: set user from Cognito info
      const cognitoUser = await getCognitoUser();
      setUser({
        id: cognitoUser?.userId || 'cognito',
        email,
        name: cognitoUser?.name || email.split('@')[0],
        phone: cognitoUser?.phone,
        isVerified: true,
        createdAt: new Date().toISOString(),
      });
      setAuthToken(cognitoToken || 'cognito-session');
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    throw error;
  } finally {
    isAuthLoading.set(false);
  }
}

export async function logout() {
  try {
    const { configureAmplify } = await import('../lib/amplify');
    configureAmplify();
    const { cognitoSignOut } = await import('../lib/auth');
    await cognitoSignOut();
  } catch (error) {
    // Logout error - silent
  } finally {
    clearAuth();
  }
}

export async function loginWithGoogle(): Promise<void> {
  const { configureAmplify } = await import('../lib/amplify');
  configureAmplify();
  const { cognitoSignInWithGoogle } = await import('../lib/auth');
  await cognitoSignInWithGoogle();
}

export async function checkSession(): Promise<boolean> {
  try {
    const { configureAmplify } = await import('../lib/amplify');
    configureAmplify();
    const { getCognitoToken, getCognitoUser, syncWithBackend } = await import('../lib/auth');

    const cognitoToken = await getCognitoToken();
    if (!cognitoToken) {
      clearAuth();
      return false;
    }

    // Try to sync with backend for fresh user data
    const backendResult = await syncWithBackend(cognitoToken);
    if (backendResult) {
      setUser(backendResult.user);
      setAuthToken(backendResult.token);
    } else {
      // Fallback: ensure user data from Cognito
      const cognitoUser = await getCognitoUser();
      if (cognitoUser && !currentUser.get()) {
        setUser({
          id: cognitoUser.userId,
          email: cognitoUser.email,
          name: cognitoUser.name || cognitoUser.email.split('@')[0],
          phone: cognitoUser.phone,
          isVerified: cognitoUser.emailVerified,
          createdAt: new Date().toISOString(),
        });
        setAuthToken(cognitoToken);
      }
    }

    return true;
  } catch {
    clearAuth();
    return false;
  }
}

// ===== WAITLIST STATE =====
export const isOnWaitlist = persistentAtom<boolean>('ancestro:waitlist', false, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const waitlistPosition = persistentAtom<number | null>('ancestro:waitlist-pos', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function joinWaitlist(position: number) {
  isOnWaitlist.set(true);
  waitlistPosition.set(position);
}

// ===== PREFERENCES =====
export interface UserPreferences {
  newsletter: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const userPreferences = persistentAtom<UserPreferences>(
  'ancestro:preferences',
  {
    newsletter: false,
    notifications: true,
    theme: 'dark',
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export function updatePreferences(prefs: Partial<UserPreferences>) {
  userPreferences.set({ ...userPreferences.get(), ...prefs });
}
