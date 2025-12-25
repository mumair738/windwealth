import { headers, cookies } from 'next/headers';
import { getPrivyClient } from '@privy-io/server-auth';

/**
 * Gets the Privy user from the request.
 * Checks Authorization header first, then falls back to Privy cookies.
 * Returns null if no valid Privy token is found.
 */
export async function getPrivyUserFromRequest() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    return null;
  }

  try {
    const privyClient = getPrivyClient(appId, appSecret);
    const headersList = await headers();
    
    // Try Authorization header first (for API calls)
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      const user = await privyClient.verifyAuthToken(accessToken);
      return user;
    }

    // Fall back to Privy cookies (for server-side rendering)
    const cookieStore = await cookies();
    const privyAccessToken = cookieStore.get('privy:access_token')?.value;
    if (privyAccessToken) {
      const user = await privyClient.verifyAuthToken(privyAccessToken);
      return user;
    }

    return null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

