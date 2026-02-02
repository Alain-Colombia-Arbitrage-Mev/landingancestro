import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// ===== USER INTERFACE =====
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
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

export function logout() {
  currentUser.set(null);
  authToken.set(null);
}

export async function login(email: string, password: string): Promise<boolean> {
  isAuthLoading.set(true);
  
  try {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password }),
    // });
    // const data = await response.json();
    
    // Simulated login for development
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    
    setUser(mockUser);
    setAuthToken('mock-token-' + Date.now());
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  } finally {
    isAuthLoading.set(false);
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
