# X Account Connection & Automatic Quest Completion Implementation

## Overview

This document describes the implementation of X (Twitter) account connection with automatic quest completion and shard reward system. When users connect their X account and follow @MentalWealthDAO, they automatically receive shard rewards with a Duolingo-style celebration animation.

**Date Implemented:** 2024

---

## Architecture Overview

The implementation consists of several key components working together:

1. **X Connecting Modal** - User-facing loading state during OAuth
2. **OAuth Flow** - X API integration for account linking
3. **Automatic Quest Completion** - Checks follow status and rewards shards
4. **Enhanced Shard Animation** - Duolingo-style celebration with progress meter
5. **Integration Points** - Homepage quest and profile settings

---

## Components

### 1. X Connecting Modal (`components/x-connecting/XConnectingModal.tsx`)

A modal component that displays during the X account connection process.

**Features:**
- Animated spinner with X icon
- Progress bar animation
- Loading text with animated dots
- Full-screen backdrop overlay

**Usage:**
```tsx
<XConnectingModal isOpen={showConnectingModal} />
```

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose?: () => void` - Optional close handler

**Location in Flow:**
- Displays when user clicks "Connect X Account" button
- Shows for ~800ms before redirecting to X OAuth
- Automatically closes when OAuth redirect occurs

---

### 2. Enhanced Shard Animation (`components/quests/ShardAnimation.tsx`)

Upgraded celebration animation showing shard rewards with a progress meter.

**Features:**
- Two-phase animation:
  1. **Earned Shards Popup** - Shows "+X Shards Earned!" with spinning shard icon
  2. **Progress Meter** - Animated bar showing total shards increasing from start to finish
- Duolingo-style number count-up animation
- Smooth transitions and visual feedback

**Props:**
- `shards: number` - Number of shards earned
- `startingShards?: number` - Starting shard count (defaults to 0)
- `onComplete?: () => void` - Callback when animation completes

**Usage:**
```tsx
<ShardAnimation 
  shards={10} 
  startingShards={5}
  onComplete={() => setShowAnimation(false)}
/>
```

**Animation Sequence:**
1. Shard icon appears with bounce and spin animation
2. Number counts up from 0 to earned amount (1.5s)
3. Progress meter slides up (0.5s delay)
4. Meter fills from starting to final total (1.2s)
5. Total count animates during fill
6. Animation fades out (0.8s delay)

---

### 3. Quest Detail Sidebar Updates (`components/quests/QuestDetailSidebar.tsx`)

Enhanced the quest sidebar to support automatic X connection and follow verification.

**New Features:**
- Shows connecting modal when initiating X OAuth
- Automatically checks follow status after connection
- Auto-completes quest if user is already following
- Displays enhanced shard animation with starting count

**Key Functions:**

#### `handleConnectTwitter()`
- Shows connecting modal
- Fetches OAuth URL from `/api/x-auth/initiate`
- Redirects to X authorization after 800ms delay

#### Auto-Follow Check (useEffect)
- Monitors for `auto_check` URL parameter
- Checks X account connection status
- Automatically verifies follow status if just connected
- Triggers quest completion if following

#### `handleCompleteQuest()`
- Fetches starting shard count before completion
- Completes quest via `/api/quests/complete`
- Shows confetti and shard animation
- Updates navbar shard count

---

### 4. Your Accounts Modal Updates (`components/nav-buttons/YourAccountsModal.tsx`)

Updated profile settings modal to use the new connecting flow.

**Changes:**
- Integrated `XConnectingModal` component
- Shows connecting state during OAuth initiation
- Same UX as quest sidebar for consistency

---

## API Endpoints

### 1. X OAuth Initiation (`/api/x-auth/initiate`)

**Method:** GET  
**Auth:** Required (Privy)

**Response:**
```json
{
  "authUrl": "https://api.twitter.com/oauth/authorize?...",
  "stateToken": "uuid-state-token"
}
```

**Flow:**
1. Generates OAuth request token
2. Stores state in database (10min expiry)
3. Returns authorization URL
4. User redirected to X for approval

---

### 2. X OAuth Callback (`/api/x-auth/callback`)

**Method:** GET  
**Auth:** Via OAuth callback

**Query Parameters:**
- `oauth_token` - X OAuth token
- `oauth_verifier` - X OAuth verifier
- `state` - State token for verification
- `denied` - Optional, if user denied

**Flow:**
1. Verifies state token (prevents CSRF)
2. Exchanges request token for access token
3. Stores X account credentials in database
4. Redirects to `/home?x_auth=success&auto_check=true`

**Database Updates:**
- Stores in `x_accounts` table:
  - `user_id` - Links to internal user
  - `x_user_id` - X/Twitter user ID
  - `x_username` - X/Twitter username
  - `access_token` - OAuth access token
  - `access_token_secret` - OAuth token secret

---

### 3. X Account Status (`/api/x-auth/status`)

**Method:** GET  
**Auth:** Required (Privy)

**Response:**
```json
{
  "connected": true,
  "xAccount": {
    "username": "username",
    "userId": "123456",
    "connectedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Usage:**
- Checks if user has connected X account
- Used by UI to show connection status
- Updates step completion in quest flow

---

### 4. Check Follow Status (`/api/x-auth/check-follow`)

**Method:** POST  
**Auth:** Required (Privy)

**Response:**
```json
{
  "isFollowing": true,
  "hasTwitterLinked": true,
  "xUsername": "username",
  "message": "You are following @MentalWealthDAO!"
}
```

**Flow:**
1. Verifies X account is connected
2. Fetches @MentalWealthDAO user ID via Twitter API v2
3. Checks follow relationship via Twitter API v1.1
4. Returns follow status

**Error Handling:**
- Returns `requiresManualVerification: true` if API fails
- Allows manual verification for edge cases

---

### 5. Auto-Complete Twitter Quest (`/api/quests/auto-complete-twitter-quest`)

**Method:** POST  
**Auth:** Required (Privy)

**Response (Success):**
```json
{
  "ok": true,
  "shardsAwarded": 10,
  "startingShards": 5,
  "newShardCount": 15,
  "isFollowing": true,
  "message": "Congratulations! You're following @MentalWealthDAO and have earned 10 shards!"
}
```

**Response (Already Completed):**
```json
{
  "ok": true,
  "alreadyCompleted": true,
  "shardsAwarded": 0,
  "newShardCount": 15
}
```

**Response (Not Following):**
```json
{
  "ok": false,
  "error": "Not following",
  "message": "Please follow @MentalWealthDAO to complete the quest.",
  "isFollowing": false
}
```

**Flow:**
1. Checks if quest already completed (prevents duplicate rewards)
2. Verifies X account is connected
3. Checks follow status via Twitter API
4. If following:
   - Awards 10 shards (configurable via `SHARD_REWARD`)
   - Records quest completion in `quest_completions` table
   - Updates user's `shard_count` in `users` table
   - Returns starting and new shard counts for animation

**Constants:**
- `TWITTER_FOLLOW_QUEST_ID = 'twitter-follow-quest'`
- `TARGET_USERNAME = 'MentalWealthDAO'`
- `SHARD_REWARD = 10`

---

## Integration Points

### Homepage Quest Flow (`app/home/page.tsx`)

**Automatic Quest Completion on Return:**
- Monitors `auto_check` URL parameter
- Fetches current shard count before check
- Calls auto-complete endpoint
- Shows confetti and shard animation if rewards granted
- Updates navbar shard count via event

**Code Flow:**
```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const autoCheck = params.get('auto_check');
  
  if (autoCheck === 'true') {
    // Get starting shards
    const meResponse = await fetch('/api/me');
    const startingShards = meResponse.user.shardCount;
    
    // Auto-complete quest
    const response = await fetch('/api/quests/auto-complete-twitter-quest', {
      method: 'POST'
    });
    
    if (response.ok && response.shardsAwarded > 0) {
      // Show reward animation
      setRewardData({
        shards: response.shardsAwarded,
        startingShards: response.startingShards
      });
      setShowRewardAnimation(true);
    }
  }
}, []);
```

---

## Database Schema

### `x_accounts` Table

Stores connected X/Twitter accounts linked to users.

```sql
CREATE TABLE x_accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  x_user_id VARCHAR(255) NOT NULL,
  x_username VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  access_token_secret TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_x (user_id)
);
```

### `x_oauth_states` Table

Temporary storage for OAuth state tokens (CSRF protection).

```sql
CREATE TABLE x_oauth_states (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  state_token VARCHAR(36) NOT NULL,
  oauth_token VARCHAR(255) NOT NULL,
  oauth_token_secret VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_state_token (state_token),
  INDEX idx_expires (expires_at)
);
```

### `quest_completions` Table

Tracks completed quests and rewards (already existed).

```sql
-- Relevant columns for this feature
quest_id VARCHAR(255) NOT NULL,
user_id VARCHAR(36) NOT NULL,
shards_awarded INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## User Flow

### Complete Flow Diagram

```
1. User clicks "Connect X Account" (Quest or Profile)
   ↓
2. XConnectingModal appears with animation
   ↓
3. Redirect to X OAuth authorization page
   ↓
4. User authorizes connection
   ↓
5. Redirect to /home?x_auth=success&auto_check=true
   ↓
6. System checks follow status automatically
   ↓
7a. If following:
    - Awards 10 shards
    - Shows confetti animation
    - Shows shard animation with meter
    - Updates navbar count
    - Quest marked complete
   ↓
7b. If not following:
    - Shows connection success
    - Quest step 1 marked complete
    - User can manually verify follow later
```

---

## Environment Variables

Required environment variables for X API integration:

```env
# X/Twitter API Credentials
X_API_KEY=your_consumer_key
X_SECRET=your_consumer_secret
X_BEARER_TOKEN=your_bearer_token

# App URL for OAuth callback
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Note:** OAuth 1.0a requires all three credentials:
- `X_API_KEY` - Consumer key (API key)
- `X_SECRET` - Consumer secret (API secret)
- `X_BEARER_TOKEN` - Bearer token for v2 API calls (username lookup)

---

## Security Considerations

### OAuth State Tokens
- State tokens are UUIDs stored in database
- 10-minute expiry prevents replay attacks
- Tokens are deleted after successful OAuth flow
- CSRF protection via state verification

### Access Token Storage
- Tokens stored encrypted in database
- Never exposed to client-side JavaScript
- Used only for server-side API calls
- Revocable via X/Twitter settings

### Quest Completion Protection
- Checks `quest_completions` table to prevent duplicates
- One completion per user per quest
- Server-side validation only
- Idempotent rewards system

---

## Error Handling

### Connection Failures
- **Database not configured:** Returns 503, shows service unavailable
- **OAuth initiation fails:** Error logged, user sees connection failed message
- **OAuth callback fails:** Redirects to error page with message

### Follow Verification Failures
- **API rate limits:** Falls back to manual verification
- **Invalid credentials:** Logs error, allows retry
- **User not found:** Handles gracefully, suggests retry

### Quest Completion Failures
- **Already completed:** Returns success with current shard count
- **Not following:** Returns error, allows manual verification
- **Database errors:** Logged, user sees generic error message

---

## Testing Checklist

### Connection Flow
- [ ] Connecting modal appears when clicking button
- [ ] Modal shows proper animations
- [ ] Redirects to X OAuth page
- [ ] Returns to app after authorization
- [ ] X account appears in profile settings

### Quest Completion
- [ ] Automatically checks follow status after connection
- [ ] Rewards shards if following
- [ ] Shows confetti animation
- [ ] Shows shard meter animation
- [ ] Updates navbar shard count
- [ ] Marks quest as complete in database

### Edge Cases
- [ ] Already connected account (no duplicate)
- [ ] Already completed quest (no duplicate rewards)
- [ ] Not following (shows appropriate message)
- [ ] API failures (falls back gracefully)
- [ ] Network errors (user can retry)

---

## Future Enhancements

### Potential Improvements
1. **Multiple Quest Types** - Extend auto-completion to other quest types
2. **Push Notifications** - Notify users when quests auto-complete
3. **Quest History** - Show completion timeline in user profile
4. **Shard Analytics** - Dashboard showing shard earnings over time
5. **Quest Sharing** - Share quest completion on social media
6. **Batch Verification** - Check multiple follow relationships at once

### API Optimizations
- Cache follow status (15min TTL)
- Batch API calls where possible
- Implement exponential backoff for retries
- Add webhook support for real-time updates

---

## Troubleshooting

### Common Issues

**Issue:** Connecting modal doesn't appear
- **Solution:** Check if `XConnectingModal` is imported and state is managed correctly

**Issue:** OAuth redirect fails
- **Solution:** Verify `NEXT_PUBLIC_APP_URL` matches production URL, check X app callback URL settings

**Issue:** Follow check always fails
- **Solution:** Verify X API credentials, check rate limits, ensure user has granted proper permissions

**Issue:** Shard animation doesn't show
- **Solution:** Verify `startingShards` prop is passed correctly, check animation CSS classes

**Issue:** Quest completes but shards not awarded
- **Solution:** Check database transaction logs, verify `quest_completions` table updates

---

## Related Files

### Components
- `components/x-connecting/XConnectingModal.tsx`
- `components/x-connecting/XConnectingModal.module.css`
- `components/quests/ShardAnimation.tsx`
- `components/quests/ShardAnimation.module.css`
- `components/quests/QuestDetailSidebar.tsx`
- `components/nav-buttons/YourAccountsModal.tsx`

### API Routes
- `app/api/x-auth/initiate/route.ts`
- `app/api/x-auth/callback/route.ts`
- `app/api/x-auth/status/route.ts`
- `app/api/x-auth/check-follow/route.ts`
- `app/api/quests/auto-complete-twitter-quest/route.ts`
- `app/api/quests/complete/route.ts`

### Pages
- `app/home/page.tsx`

---

## References

- [Twitter OAuth 1.0a Documentation](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Development Team
