# Quest Rewards & Blockchain Account Linking Implementation

This document tracks the implementation of crypto rewards for quests and the blockchain account linking flow. The goal is to make quests easy, accessible, and seamlessly prompt users to link accounts when needed.

---

## 🎯 Core Principles

1. **User-Friendly Language**: Always use "account" instead of "wallet"
2. **Progressive Disclosure**: Only show blockchain complexity when necessary
3. **Non-Blocking UX**: Users can browse and participate in quests without an account, but need one to receive rewards
4. **Clear Communication**: Explain *why* an account is needed, not just *what* to do

---

## 📋 Quest System Requirements

### What Quests Should Do

**Current State:**
- ✅ Quest UI exists (QuestDetailSidebar, QuestPage components)
- ✅ Quest completion tracking (database)
- ✅ Database-only "shards" rewards
- ✅ Basic validation (idempotency checks)

**Target State:**
- ✅ Maintain database shards as display/backup
- 🎯 Add blockchain rewards (Native token 0x715389db05be6279bb69012242ba8380d2439b07 on Base)
- 🎯 Account linking required for crypto rewards (optional for quest participation)
- 🎯 Clear progress indicators and completion states
- 🎯 Reward confirmation with on-chain verification

### Quest Flow (Easy & Accessible)

1. **Discovery** → User sees quest in UI
2. **Requirements Check** → System checks if account is linked (notifies user account sync required for rewards)
3. **Completion** → User completes quest actions
4. **Validation** → Azura AI (powered by ElizaOS) verifies completion, and applies her voting points towards the outcome.
5. **Reward Distribution**:
   - Database shards: Immediate (always, & updates to users profile in navbar)
   - Crypto rewards: After account linking confirmed and admins finalize decision
6. **Confirmation** → Visual feedback and reward message (no blockchain/crypto information)

---

## 🔗 Blockchain Account Linking Flow

### When to Prompt Users

**Trigger Conditions:**
1. ✅ User completes a quest with crypto rewards
2. ✅ User attempts to claim/view on-chain rewards
3. ✅ User views quest rewards breakdown (shows "Link account to receive crypto rewards")
4. ⚠️ NOT during initial signup (defer until needed)

### Account Linking Modal Flow

#### Step 1: Contextual Prompt Modal
**Appears when:** User completes quest OR tries to claim rewards without linked account

**Content:**
- **Title**: "Link an Account to Receive Rewards"
- **Message**: 
  - "You've earned [X] shards! To receive your crypto rewards, sync an eligible account."
- **Benefits List**:
  - Receive quest rewards directly to your account
  - Participate in governance and voting
  - Earn your digital items
- **Action Button**: "Link an Account" (primary)
- **Dismissal**: "Maybe Later" (secondary, non-blocking)

**Design Notes:**
- Non-intimidating language (no "wallet", "crypto", "blockchain" terminology at all)
- Focus on benefits, not technical details
- Can be dismissed without penalty

#### Step 2: Privy Account Connection
**When:** User clicks "Link an Account"

**Flow:**
1. Check if Privy user has wallet
2. If has wallet → Connect existing wallet via Privy
3. Store wallet address in database (`users.wallet_address`)
4. Update user profile state

**Privy Integration:**
- Use `usePrivy()` hook: `connectWallet()` or `createWallet()`
- Handle embedded wallets (created automatically on first login)
- Support external wallet connections (MetaMask, Coinbase Wallet, etc.)
- Network: Base (Base Sepolia for testing, Base Mainnet for production)

#### Step 3: Success & Reward Distribution
**When:** Account successfully linked

**Flow:**
1. Show success confirmation
2. Automatically trigger reward distribution if quest was just completed
3. Display transaction status (pending → confirmed)
4. Update UI to show linked account status

---

## 🎨 UI Components to Build

### 1. AccountLinkingModal Component
**Location:** `components/account-linking/AccountLinkingModal.tsx`

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  questId?: string; // Optional: if triggered by quest completion
  shardsEarned?: number; // Display rewards earned
  onAccountLinked?: () => void; // Callback after successful linking
}
```

**Features:**
- Non-blocking modal (can dismiss)
- Clear explanation of why account is needed
- Privy wallet connection integration
- Loading states during connection
- Success/error handling

### 2. Quest Reward Status Indicator
**Location:** `components/quests/QuestRewardStatus.tsx` (or integrate into QuestDetailSidebar)

**Shows:**
- Database shards earned (always visible)
- Crypto rewards available (shows "Link account" if not linked)
- Account status (linked/not linked)
- Transaction status (if reward pending/confirmed)

### 3. Account Status Badge
**Location:** Profile/Navbar (shows if account is linked)

**Displays:**
- ✅ "Account Linked" indicator
- Account address (truncated: `0x1234...5678`)
- Quick access to view full address or unlink

---

## 🔧 Backend Implementation

### API Endpoints

#### 1. POST `/api/account/link`
**Purpose:** Link blockchain account to user profile

**Request:**
```typescript
{
  walletAddress: string; // From Privy user.wallet.address
  privyUserId: string; // From Privy user.id
}
```

**Response:**
```typescript
{
  ok: true;
  walletAddress: string;
  message?: string;
}
```

**Logic:**
- Verify Privy authentication
- Validate wallet address format
- Update `users.wallet_address` in database
- Update `users.privy_user_id` if not set
- Log account linking event

#### 2. GET `/api/account/status`
**Purpose:** Check if user has linked account

**Response:**
```typescript
{
  hasLinkedAccount: boolean;
  walletAddress?: string;
  privyUserId?: string;
}
```

#### 3. POST `/api/quests/complete` (Enhanced)
**Current:** Awards database shards only
**Enhanced:** 
- Check if account linked
- If linked → trigger crypto reward distribution
- If not linked → award shards, flag for account linking prompt
- Return account linking status in response

**Response (Enhanced):**
```typescript
{
  ok: true;
  shardsAwarded: number;
  newShardCount: number;
  requiresAccountLinking: boolean; // New field
  cryptoRewardAmount?: string; // If account linked
  transactionHash?: string; // If reward distributed on-chain
}
```

#### 4. POST `/api/quests/distribute-reward`
**Purpose:** Distribute crypto reward to linked account

**Request:**
```typescript
{
  questId: string;
  userId: string;
  rewardAmount: string; // In wei or token units
}
```

**Logic:**
- Verify user has linked account
- Verify quest completion
- Verify quest not already rewarded on-chain
- Execute on-chain transaction (via agent wallet or smart contract)
- Log transaction hash
- Return transaction status

---

## 📊 Database Schema Updates

### Current Schema (users table)
```sql
wallet_address VARCHAR(255) NULL,
privy_user_id VARCHAR(255) NULL UNIQUE,
shard_count INTEGER NOT NULL DEFAULT 0,
```

### New Tables Needed

#### quest_crypto_rewards
```sql
CREATE TABLE quest_crypto_rewards (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quest_completion_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  quest_id VARCHAR(255) NOT NULL,
  reward_amount_wei VARCHAR(255) NOT NULL, -- Store as string for precision
  token_address VARCHAR(255) NULL, -- NULL for native token (ETH/Base)
  transaction_hash VARCHAR(255) NULL, -- NULL until distributed
  transaction_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, failed
  distributed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quest_completion_id) REFERENCES quest_completions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (quest_completion_id)
);

CREATE INDEX idx_quest_crypto_rewards_user_id ON quest_crypto_rewards(user_id);
CREATE INDEX idx_quest_crypto_rewards_quest_id ON quest_crypto_rewards(quest_id);
CREATE INDEX idx_quest_crypto_rewards_transaction_hash ON quest_crypto_rewards(transaction_hash);
```

#### account_linking_events (Audit Log)
```sql
CREATE TABLE account_linking_events (
  id CHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id CHAR(36) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- linked, unlinked
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_account_linking_events_user_id ON account_linking_events(user_id);
CREATE INDEX idx_account_linking_events_created_at ON account_linking_events(created_at);
```

---

## 🚀 Implementation Phases

### Phase 1: Account Linking Foundation ✅
- [x] Database schema (wallet_address field exists)
- [x] Account linking modal component
- [x] Backend account linking endpoint
- [x] Account status check endpoint
- [x] Privy wallet connection integration
- [x] Database tables for crypto rewards and account linking events
- [x] Enhanced quest completion endpoint with account status check

### Phase 2: Quest Reward Integration
- [ ] Enhanced quest completion endpoint (check account status)
- [ ] Quest reward status UI component
- [ ] Account linking prompt in quest flow
- [ ] Database crypto rewards tracking table

### Phase 3: On-Chain Reward Distribution
- [ ] Smart contract or agent wallet integration
- [ ] Reward distribution endpoint
- [ ] Transaction status tracking
- [ ] Error handling and retry logic

### Phase 4: Polish & Testing
- [ ] Transaction confirmation UI
- [ ] Error states and user messaging
- [ ] Account unlinking functionality
- [ ] Comprehensive testing (happy path + edge cases)

---

## 🎯 User Experience Examples

### Scenario 1: Quest Completion Without Linked Account
1. User completes quest → sees "Quest Complete!" ✅
2. Database shards awarded immediately
3. Modal appears: "Link an Account to Receive Crypto Rewards"
4. User clicks "Maybe Later" → modal dismisses, quest marked complete
5. User can link account later → crypto reward distributed automatically

### Scenario 2: Quest Completion With Linked Account
1. User completes quest → sees "Quest Complete!" ✅
2. Database shards awarded immediately
3. Crypto reward transaction initiated automatically
4. UI shows: "Distributing rewards..." → "Rewards sent! ✅"
5. Transaction hash displayed (clickable to view on BaseScan)

### Scenario 3: User Links Account After Quest Completion
1. User views completed quest
2. Sees indicator: "Link account to claim crypto rewards"
3. Clicks to link account → AccountLinkingModal opens
4. Completes Privy connection
5. System checks for pending rewards → distributes automatically
6. Success confirmation shown

---

## 🔒 Security & Safety

### Key Principles
- **No Private Key Storage**: Platform never sees or stores private keys
- **Privy Handles Security**: All wallet operations via Privy SDK
- **Idempotency**: Rewards cannot be issued twice
- **Validation**: All transactions verified before execution
- **Audit Logging**: All account linking and reward events logged

### Error Handling
- Connection failures → Clear error message + retry option
- Transaction failures → Retry mechanism + fallback to manual distribution
- Network issues → Graceful degradation (shards still awarded)
- User cancellation → No penalty, can retry later

---

## 📝 Technical Notes

### Privy Integration
- Use `@privy-io/react-auth` for client-side wallet connection
- Use `@privy-io/server-auth` for server-side verification
- Embedded wallets created automatically (`createOnLogin: 'users-without-wallets'`)
- Support Base network (configure in Privy dashboard)

### Network Configuration
- **Testnet**: Base Sepolia (for development/testing)
- **Mainnet**: Base (for production)
- Contract addresses stored as environment variables

### Reward Amounts
- Store in database as strings (avoid precision loss)
- Convert to wei/units for on-chain transactions
- Display in human-readable format in UI (with decimals)

---

## ✅ Definition of Done

**Account Linking:**
- [ ] Users can link blockchain accounts via Privy
- [ ] Account status visible in profile/UI
- [ ] Clear, non-intimidating modal with proper messaging
- [ ] Graceful error handling and retry paths

**Quest Rewards:**
- [ ] Quest completion works with or without linked account
- [ ] Database shards always awarded
- [ ] Crypto rewards distributed when account linked
- [ ] Transaction status tracking and display
- [ ] Clear visual feedback for all states

**Code Quality:**
- [ ] TypeScript types for all new components/endpoints
- [ ] Error handling for all async operations
- [ ] Logging for audit trail
- [ ] Tests for critical paths

---

## 🔄 Future Enhancements (Post-MVP)

- Multi-account linking (one primary, others optional)
- Reward history page (view all past transactions)
- Batch reward distribution (for efficiency)
- Governance integration (voting with linked accounts)
- Cross-quest reward aggregation
- Reward notifications (push/email)

---

**Last Updated:** [Date]
**Status:** Planning Phase → Ready for Implementation

