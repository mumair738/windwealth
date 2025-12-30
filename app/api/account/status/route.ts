import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { getPrivyUserFromRequest } from '@/lib/privy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/account/status
 * Checks if the current user has a linked blockchain account
 */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured on the server.' },
      { status: 503 }
    );
  }
  await ensureForumSchema();

  // Verify Privy authentication
  const privyUser = await getPrivyUserFromRequest();
  if (!privyUser) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  // Get our internal user record
  const user = await getCurrentUserFromRequestCookie();
  if (!user) {
    return NextResponse.json({ error: 'User account not found. Please complete signup.' }, { status: 404 });
  }

  try {
    const privyUserId = (privyUser as any).id || (privyUser as any).userId;
    const hasLinkedAccount = !!user.walletAddress;

    return NextResponse.json({
      hasLinkedAccount,
      walletAddress: user.walletAddress || undefined,
      privyUserId: privyUserId || undefined,
    });
  } catch (err: any) {
    console.error('Error checking account status:', err);
    return NextResponse.json(
      { error: 'Failed to check account status.' },
      { status: 500 }
    );
  }
}

