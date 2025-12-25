import { headers, cookies } from 'next/headers';
import { PrivyClient } from '@privy-io/server-auth';

/**
 * Gets the Privy user from the request.
 * Checks Authorization header first, then falls back to Privy cookies.
 * Returns the full User object with linked accounts, or null if no valid Privy token is found.
 */
export async function getPrivyUserFromRequest() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    return null;
  }

  try {
    const privyClient = new PrivyClient(appId, appSecret);
    const headersList = await headers();
    
    let tokenClaims = null;
    let idToken: string | null = null;
    
    // Try Authorization header first (for API calls)
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      tokenClaims = await privyClient.verifyAuthToken(accessToken);
    } else {
      // Fall back to Privy cookies (for server-side rendering)
      const cookieStore = await cookies();
      const privyAccessToken = cookieStore.get('privy:access_token')?.value;
      if (privyAccessToken) {
        tokenClaims = await privyClient.verifyAuthToken(privyAccessToken);
      }
      // Try to get idToken from cookies for full user data
      idToken = cookieStore.get('privy:id_token')?.value || null;
    }

    if (!tokenClaims) {
      return null;
    }

    // If we have an idToken, use it to get the full user object
    if (idToken) {
      try {
        const user = await privyClient.getUser({ idToken });
        return user;
      } catch (error) {
        // If getUser fails, fall back to getUserById (deprecated but works)
        console.warn('getUser with idToken failed, falling back to getUserById:', error);
      }
    }

    // Fall back to getUserById if idToken is not available
    // Note: This is deprecated and rate-limited, but necessary for backward compatibility
    try {
      const user = await privyClient.getUserById(tokenClaims.userId);
      return user;
    } catch (error) {
      // If getUserById also fails, return the token claims as a minimal user object
      console.warn('getUserById failed, returning token claims only:', error);
      return tokenClaims as any;
    }
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

