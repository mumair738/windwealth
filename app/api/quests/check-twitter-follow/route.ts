import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { getPrivyUserFromRequest } from '@/lib/privy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TWITTER_HANDLE = 'MentalWealthDAO';

export async function POST(request: Request) {
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
    // Check if user has Twitter/X account linked in Privy
    const privyUserAny = privyUser as any;
    const linkedAccounts = privyUserAny.linkedAccounts || [];
    const twitterAccount = linkedAccounts.find(
      (account: any) => account.type === 'twitter' || account.type === 'x'
    );

    if (!twitterAccount) {
      return NextResponse.json({ 
        isFollowing: false, 
        hasTwitterLinked: false,
        message: 'Please connect your X/Twitter account first.' 
      });
    }

    // TODO: Implement actual Twitter API check
    // For now, we'll use a mock check that requires the user to verify manually
    // In production, you would use Twitter API v2 to check if user follows @MentalWealthDAO
    // This requires Twitter API credentials and proper OAuth setup
    
    // Mock implementation - in production, replace with actual Twitter API call:
    // const isFollowing = await checkTwitterFollow(twitterAccount.subject, TWITTER_HANDLE);
    
    // For now, return a response that indicates we need manual verification
    // The frontend will handle showing a button to manually verify
    return NextResponse.json({ 
      isFollowing: false, // Will be set to true after manual verification
      hasTwitterLinked: true,
      twitterUsername: twitterAccount.username || twitterAccount.subject,
      message: 'Twitter account connected. Please verify you are following @MentalWealthDAO.',
      requiresManualVerification: true
    });
  } catch (err: any) {
    console.error('Error checking Twitter follow:', err);
    return NextResponse.json({ error: 'Failed to check Twitter follow status.' }, { status: 500 });
  }
}

