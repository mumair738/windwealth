# Privy Authentication Setup

This application uses Privy for blockchain-based authentication. Follow these steps to set up Privy:

## 1. Create a Privy Application

1. Visit [https://privy.io](https://privy.io) and sign up for an account
2. Create a new application in the Privy dashboard
3. Note your **App ID** and **App Secret** from the application settings

## 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file (or your deployment environment):

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
```

**Important:**
- `NEXT_PUBLIC_PRIVY_APP_ID` is public and safe to expose in client-side code
- `PRIVY_APP_SECRET` is sensitive and must only be used server-side. Never commit it to version control.

## 3. Configure Privy Dashboard Settings

In your Privy dashboard, configure the following:

1. **Login Methods**: Enable at least:
   - Email
   - Wallet (Ethereum)

2. **Embedded Wallets**: 
   - Set to "Create on login for users without wallets" or "Create for all users"
   - This ensures every user has a blockchain wallet

3. **Allowed Origins**: 
   - Add your development URL (e.g., `http://localhost:3000`)
   - Add your production URL when deploying

## 4. Database Schema

The application requires the following fields in the `users` table:
- `privy_user_id` (VARCHAR(255), UNIQUE, NOT NULL) - Links to Privy user ID
- `email` (VARCHAR(255), UNIQUE, NULL) - User's email from Privy
- `wallet_address` (VARCHAR(255), NOT NULL) - User's blockchain wallet address

The schema is automatically created/updated when the application runs via `ensureForumSchema()`.

## 5. Testing

1. Start your development server: `npm run dev`
2. Click "Sign In With Ethereum" to test Privy authentication
3. After authenticating, you can create/update your profile

## Troubleshooting

- **"NEXT_PUBLIC_PRIVY_APP_ID is not set"**: Make sure your environment variables are configured
- **"Authentication required"**: Ensure you're signed in with Privy before accessing protected endpoints
- **"Wallet address is required"**: Make sure Privy is configured to create embedded wallets

## Features Implemented

✅ Step 1: User Registration
- Privy-based authentication
- Email and wallet address storage
- Unique email validation
- Wallet address validation
- Account creation timestamp

✅ Step 2: Authentication (Login / Logout)
- Privy token-based authentication
- Session management for backward compatibility
- Secure logout

## Next Steps

After completing Steps 1 and 2, you can proceed with:
- Step 2.1: Unique Username System
- Step 2.2: Profile Image (Avatar)
- Step 2.3: Profile Editing
- Step 3: Wallet Association


