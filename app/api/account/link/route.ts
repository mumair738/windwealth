import { NextResponse } from 'next/server';
import { ensureForumSchema } from '@/lib/ensureForumSchema';
import { getCurrentUserFromRequestCookie } from '@/lib/auth';
import { isDbConfigured, sqlQuery } from '@/lib/db';
import { getPrivyUserFromRequest } from '@/lib/privy-auth';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/link
 * Links a blockchain account (wallet) to the user's profile
 * 
 * Request body is optional - wallet address and privy user ID are extracted from Privy auth
 */
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
    // Extract wallet address from Privy user
    // Privy user object structure: user.wallet.address or user.linkedAccounts
    const privyUserId = (privyUser as any).id || (privyUser as any).userId;
    
    // Get wallet address from Privy user
    // Check multiple possible locations for wallet address
    let walletAddress: string | null = null;
    
    // Method 1: Check wallet.address (embedded wallet)
    if ((privyUser as any).wallet?.address) {
      walletAddress = (privyUser as any).wallet.address;
    }
    
    // Method 2: Check linkedAccounts array (all wallet types)
    if (!walletAddress && (privyUser as any).linkedAccounts) {
      // Find any wallet account (embedded or external)
      const walletAccount = (privyUser as any).linkedAccounts.find(
        (account: any) => account.type === 'wallet'
      );
      if (walletAccount?.address) {
        walletAddress = walletAccount.address;
      }
    }
    
    // Method 3: Check wallet array (if multiple wallets)
    if (!walletAddress && Array.isArray((privyUser as any).wallet)) {
      const firstWallet = (privyUser as any).wallet[0];
      if (firstWallet?.address) {
        walletAddress = firstWallet.address;
      }
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'No wallet address found. Please connect or create a wallet first using the "Link an Account" button.' },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic Ethereum address validation)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format.' },
        { status: 400 }
      );
    }

    // Check if this wallet is already linked to another user
    const existingWallet = await sqlQuery<Array<{ id: string; username: string }>>(
      `SELECT id, username FROM users 
       WHERE wallet_address = :walletAddress AND id != :userId 
       LIMIT 1`,
      { walletAddress, userId: user.id }
    );

    if (existingWallet.length > 0) {
      return NextResponse.json(
        { error: 'This account is already linked to another user.' },
        { status: 409 }
      );
    }

    // Update user record with wallet address and privy user ID
    await sqlQuery(
      `UPDATE users 
       SET wallet_address = :walletAddress,
           privy_user_id = COALESCE(privy_user_id, :privyUserId),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = :userId`,
      { 
        walletAddress, 
        privyUserId,
        userId: user.id 
      }
    );

    // Log account linking event
    const eventId = uuidv4();
    await sqlQuery(
      `INSERT INTO account_linking_events (id, user_id, wallet_address, action)
       VALUES (:id, :userId, :walletAddress, 'linked')`,
      { 
        id: eventId, 
        userId: user.id, 
        walletAddress 
      }
    );

    return NextResponse.json({
      ok: true,
      walletAddress,
      message: 'Account linked successfully.',
    });
  } catch (err: any) {
    console.error('Error linking account:', err);
    return NextResponse.json(
      { error: 'Failed to link account.' },
      { status: 500 }
    );
  }
}

