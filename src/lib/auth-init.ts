/**
 * Auth initialization script.
 * Call initAuth() once on app load to:
 * 1. Configure Amplify
 * 2. Handle OAuth redirect callbacks (Google sign-in)
 * 3. Restore existing sessions
 * 4. Set up automatic token refresh
 */

import { configureAmplify } from './amplify';
import { getCognitoToken, getCognitoUser, syncWithBackend, handleOAuthCallback } from './auth';
import { currentUser, setUser, setAuthToken, clearAuth } from '../stores/user';
import { Hub } from 'aws-amplify/utils';

let initialized = false;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export async function initAuth(): Promise<void> {
  if (initialized) return;
  initialized = true;

  configureAmplify();

  // Listen for Amplify auth events (OAuth redirects, sign-out, etc.)
  Hub.listen('auth', async ({ payload }) => {
    switch (payload.event) {
      case 'signInWithRedirect':
        // Google OAuth completed successfully
        await handlePostOAuth();
        break;
      case 'signInWithRedirect_failure':
        // OAuth redirect failed - silent
        break;
      case 'signedOut':
        clearAuth();
        break;
      case 'tokenRefresh':
        // Token was refreshed automatically by Amplify
        await refreshBackendToken();
        break;
      case 'tokenRefresh_failure':
        // Token refresh failed
        clearAuth();
        break;
    }
  });

  // Check if we have a stored user but need to validate the session
  const storedUser = currentUser.get();
  if (storedUser) {
    await validateSession();
  } else {
    // Might be returning from OAuth redirect
    await checkOAuthReturn();
  }

  // Schedule token refresh
  scheduleTokenRefresh();
}

async function handlePostOAuth(): Promise<void> {
  try {
    const result = await handleOAuthCallback();
    if (result) {
      setUser(result.user);
      if (result.token) setAuthToken(result.token);
      // Redirect to dashboard if on login/register page
      const path = window.location.pathname;
      if (path === '/' || path.includes('/login') || path.includes('/register')) {
        window.location.href = '/dashboard';
      }
    }
  } catch (error) {
    // Post-OAuth handling failed - silent
  }
}

async function checkOAuthReturn(): Promise<void> {
  // Check if URL has auth-related params (code, state) indicating OAuth return
  const params = new URLSearchParams(window.location.search);
  if (params.has('code') && params.has('state')) {
    // Amplify Hub will handle this via 'signInWithRedirect' event
    // Just wait briefly for it to process
    return;
  }

  // Also try to see if there's a valid Cognito session from a previous OAuth
  try {
    const cognitoUser = await getCognitoUser();
    if (cognitoUser) {
      await handlePostOAuth();
    }
  } catch {
    // No valid session - that's fine
  }
}

async function validateSession(): Promise<void> {
  try {
    const token = await getCognitoToken();
    if (!token) {
      // Cognito session expired/invalid but we have stored user
      clearAuth();
      return;
    }

    // Optionally refresh backend token
    await refreshBackendToken();
  } catch {
    clearAuth();
  }
}

async function refreshBackendToken(): Promise<void> {
  try {
    const token = await getCognitoToken();
    if (!token) return;

    const backendResult = await syncWithBackend(token);
    if (backendResult) {
      setUser(backendResult.user);
      setAuthToken(backendResult.token);
    }
  } catch {
    // Silent fail - keep existing session data
  }
}

function scheduleTokenRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer);

  // Refresh every 45 minutes (Cognito tokens last 1 hour by default)
  refreshTimer = setTimeout(async () => {
    const user = currentUser.get();
    if (user) {
      await refreshBackendToken();
    }
    scheduleTokenRefresh(); // Reschedule
  }, 45 * 60 * 1000);
}
