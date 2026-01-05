'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useModal } from 'connectkit';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import styles from './WalletAdvancedDemo.module.css';

interface WalletConnectionHandlerProps {
  onWalletConnected?: (address: string) => void;
}

/**
 * Handles wallet connection, user authentication, and account creation.
 * This component manages the full flow from wallet connection to onboarding.
 */
export function WalletConnectionHandler({ onWalletConnected }: WalletConnectionHandlerProps) {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOpen } = useModal();
  
  // Detect if connected wallet is Family wallet for better error handling
  const isFamilyWallet = connector?.id === 'family' || 
                         connector?.name?.toLowerCase().includes('family') ||
                         (typeof window !== 'undefined' && window.location.hostname.includes('family.co'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAddress, setProcessedAddress] = useState<string | null>(null);
  const [hasTriggeredOnboarding, setHasTriggeredOnboarding] = useState(false);
  const [familyWalletError, setFamilyWalletError] = useState<string | null>(null);
  const processingRef = useRef<string | null>(null); // Track which address is currently being processed
  
  // Monitor for Family wallet API errors and handle them gracefully
  useEffect(() => {
    if (!isFamilyWallet) return;
    
    const handleFamilyWalletError = (event: CustomEvent) => {
      const errorMessage = event.detail?.message || '';
      if (errorMessage.includes('The JSON sent is not a valid Request object')) {
        // This is a deserialization error - Family wallet's internal communication issue
        // It doesn't prevent the wallet from working, but we should notify the user
        setFamilyWalletError('Family wallet communication issue detected. The wallet may still work, but if you experience problems, please try disconnecting and reconnecting.');
      } else if (errorMessage.includes('api.app.family.co') || 
                 errorMessage.includes('401') ||
                 errorMessage.includes('Unauthorized')) {
        setFamilyWalletError('Family wallet authentication failed. Please try disconnecting and reconnecting.');
      } else if (errorMessage.includes('InvariantError') ||
                 errorMessage.includes('Session state change')) {
        setFamilyWalletError('Family wallet is experiencing connection issues. Please try disconnecting and reconnecting.');
      }
    };
    
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      if (errorMessage.includes('api.app.family.co') || 
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized')) {
        setFamilyWalletError('Family wallet authentication failed. The wallet may not be properly initialized.');
      }
    };
    
    window.addEventListener('familyWalletError', handleFamilyWalletError as EventListener);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('familyWalletError', handleFamilyWalletError as EventListener);
      window.removeEventListener('error', handleError);
    };
  }, [isFamilyWallet]);

  // NOTE: The "readiness check" was overly complex and always returned true anyway.
  // If we have a valid address from wagmi's useAccount hook, that's sufficient.
  // Family wallet may report isConnected before address is available, but we handle
  // that by waiting for the address to appear, not by checking "readiness".

  // Handle wallet connection and user check/creation
  useEffect(() => {
    // Prevent re-processing if already processing or if address was already processed
    if (!isConnected || isProcessing || !address) {
      return;
    }
    
    // If address is already available and not yet processed, process it
    if (processedAddress !== address && processingRef.current !== address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      // Mark as processing immediately to prevent re-triggering
      processingRef.current = address;
      
      (async () => {
        // Double-check we're not already processing (race condition protection)
        if (isProcessing || processedAddress === address || processingRef.current !== address) {
          console.log('Already processing or processed, skipping');
          processingRef.current = null;
          return;
        }
        
        // For Family wallets, wait a bit longer to ensure initialization
        // For other wallets, a shorter delay is usually sufficient
        const delay = isFamilyWallet ? 800 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Verify wallet is still connected and address is still available
        if (!isConnected || !address || processedAddress === address || processingRef.current !== address) {
          console.log('Wallet disconnected or address already processed during wait');
          processingRef.current = null;
          return;
        }
        
        // If we have a valid address, proceed with connection handling
        if (address && /^0x[a-fA-F0-9]{40}$/.test(address) && processedAddress !== address && !isProcessing) {
          console.log('Wallet address available, processing connection');
          handleWalletConnection(address);
        } else {
          processingRef.current = null;
        }
      })();
      
      return;
    }
    
    // If connected but address not available yet, try to get it directly from connector
    // This is especially important for Family wallet when its API is failing
    if (!address && connector) {
        console.log('Address not available from useAccount, attempting to get from connector...');
        
        let pollInterval: NodeJS.Timeout | null = null;
        let isCleanedUp = false;
        
        // Try to get address directly from connector/provider with exponential backoff
        (async () => {
          const maxAttempts = isFamilyWallet ? 20 : 10; // 10-20 seconds for Family, 5 seconds for others
          let attempt = 0;
          let delay = 250; // Start with 250ms
          
          const tryGetAddress = async (): Promise<string | null> => {
            try {
              if (connector && 'getAccount' in connector) {
                const account = await (connector as any).getAccount();
                if (account?.address && /^0x[a-fA-F0-9]{40}$/.test(account.address)) {
                  console.log('Got address directly from connector:', account.address);
                  return account.address;
                }
              }
              
              // Try getting from provider if available
              if (connector && 'getProvider' in connector) {
                const provider = await (connector as any).getProvider();
                if (provider && 'request' in provider) {
                  const accounts = await provider.request({ method: 'eth_accounts' });
                  if (accounts && accounts[0] && /^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
                    console.log('Got address from provider:', accounts[0]);
                    return accounts[0];
                  }
                }
              }
            } catch (error) {
              console.warn('Failed to get address from connector/provider (attempt', attempt + 1, '):', error);
            }
            return null;
          };
          
          // Try immediate fetch first
          let walletAddress = await tryGetAddress();
          if (walletAddress && !isCleanedUp && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            // If we have a valid address, proceed with connection
            handleWalletConnection(walletAddress);
            return;
          }
          
          // If immediate fetch fails, poll with exponential backoff
          const poll = async () => {
            if (isCleanedUp) return;
            
            attempt++;
            if (attempt >= maxAttempts) {
              console.error('Address not available after polling. Wallet may be in a broken state.');
              if (isFamilyWallet && !isCleanedUp) {
                setFamilyWalletError('Family wallet connection issue detected. Please try:\n\n1. Disconnect your wallet\n2. Refresh the page\n3. Reconnect your wallet\n\nIf the issue persists, try using a different wallet or contact support.');
              } else if (!isCleanedUp) {
                alert('Wallet address not available. Please disconnect and reconnect your wallet.');
              }
              return;
            }
            
            walletAddress = await tryGetAddress();
            if (walletAddress && !isCleanedUp && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
              // If we have a valid address, proceed with connection
              handleWalletConnection(walletAddress);
              return;
            }
            
            // Exponential backoff: increase delay with each attempt (capped at 2 seconds)
            delay = Math.min(delay * 1.5, 2000);
            console.log(`Polling for address... attempt ${attempt}/${maxAttempts} (next check in ${delay}ms)`);
            setTimeout(poll, delay);
          };
          
          // Start polling after initial delay
          setTimeout(poll, delay);
        })();
        
        return () => {
          isCleanedUp = true;
          if (pollInterval) {
            clearInterval(pollInterval);
          }
        };
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isProcessing, processedAddress, connector, isFamilyWallet]);

  // Reset processed address when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setProcessedAddress(null);
      setHasTriggeredOnboarding(false);
      setIsProcessing(false);
      processingRef.current = null;
    }
  }, [isConnected]);

  // Listen for profile updates to re-check if profile is now complete
  useEffect(() => {
    const handleProfileUpdate = async () => {
      // Wait a bit for the profile to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-check if wallet is connected and profile is complete
      if (isConnected && address && !isProcessing) {
        // Reset processed address to allow re-check
        setProcessedAddress(null);
        // Small delay to ensure state is reset, then trigger re-check
        setTimeout(() => {
          if (address) {
            handleWalletConnection(address);
          }
        }, 100);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isProcessing]);

  const handleWalletConnection = async (walletAddress: string) => {
    // Prevent duplicate processing - but allow retry if user doesn't exist
    if (processingRef.current === walletAddress) {
      console.log('Already processing this address, skipping duplicate call');
      return;
    }
    
    // Mark as processing immediately to prevent duplicate calls
    processingRef.current = walletAddress;
    
    // Validate wallet address format before proceeding
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error('Invalid wallet address format:', walletAddress);
      // For Family wallets, this might be a temporary issue - don't show alert immediately
      // Instead, wait a bit and retry if wallet is still connected
      if (isConnected) {
        console.log('Address not available yet, will retry in 1 second...');
        // Use a closure to capture the current address from useAccount
        const currentAddress = address;
        setTimeout(() => {
          // Re-check if address is now available
          if (currentAddress && /^0x[a-fA-F0-9]{40}$/.test(currentAddress) && currentAddress !== processedAddress) {
            handleWalletConnection(currentAddress);
          } else {
            console.warn('Address still not available after retry');
            alert('Wallet address not available. Please disconnect and reconnect your wallet.');
          }
        }, 1000);
      } else {
        alert('Invalid wallet address. Please reconnect your wallet.');
      }
      return;
    }
    
    console.log('handleWalletConnection - Processing wallet connection for:', walletAddress);
    console.log('handleWalletConnection - Is Family wallet:', isFamilyWallet);
    setIsProcessing(true);
    setProcessedAddress(walletAddress);
    
    try {
      // Check if user exists with this wallet address
      console.log('Checking if user exists...');
      const meResponse = await fetch('/api/me', {
        headers: getWalletAuthHeaders(walletAddress),
      });
      
      if (!meResponse.ok) {
        console.error('Failed to check user existence:', meResponse.status, meResponse.statusText);
        const errorText = await meResponse.text().catch(() => '');
        console.error('Error response:', errorText);
      }
      
      const meData = await meResponse.json().catch(async (parseError) => {
        console.error('Failed to parse /api/me response:', parseError);
        const text = await meResponse.text().catch(() => '');
        console.error('Response text:', text);
        return { user: null };
      });
      
      console.log('User check result:', { hasUser: !!meData.user, userId: meData.user?.id });
      
      if (meData.user) {
        // User exists - check if they have complete profile details
        // Check if username is not the temporary one (starts with "user_")
        const hasUsername = meData.user.username && 
          !meData.user.username.startsWith('user_');
        
        // Check profile completeness by fetching full profile
        console.log('User exists, checking profile completeness...');
        const profileResponse = await fetch('/api/profile', {
          headers: getWalletAuthHeaders(walletAddress),
        });
        
        let hasCompleteProfile = hasUsername;
        if (profileResponse.ok) {
          const profileData = await profileResponse.json().catch(() => ({ user: null }));
          // Profile is complete if it has username, gender, and birthday
          // Check user object in the response
          const hasGender = profileData.user?.gender && profileData.user.gender !== null && profileData.user.gender !== '';
          const hasBirthday = profileData.user?.birthday && profileData.user.birthday !== null && profileData.user.birthday !== '';
          hasCompleteProfile = hasUsername && hasGender && hasBirthday;
          
          console.log('Profile completeness check:', {
            hasUsername,
            hasGender,
            hasBirthday,
            hasCompleteProfile,
            profileData: profileData.user
          });
        } else {
          console.warn('Failed to fetch profile:', profileResponse.status, profileResponse.statusText);
        }
        
        if (hasCompleteProfile) {
          // User has complete profile - redirect to home
          console.log('Profile complete, redirecting to home');
          window.location.replace('/home');
        } else {
          // User exists but needs profile details - trigger onboarding
          console.log('User exists but profile incomplete, triggering onboarding');
          if (onWalletConnected && !hasTriggeredOnboarding) {
            setHasTriggeredOnboarding(true);
            onWalletConnected(walletAddress);
          }
        }
      } else {
        // User doesn't exist - create account with wallet address
        console.log('User does not exist, attempting to create account for:', walletAddress);
        const authHeaders = getWalletAuthHeaders(walletAddress);
        console.log('Wallet signup - Auth headers:', Object.keys(authHeaders));
        
        // If we've gotten this far, we have a valid address from wagmi
        // No need for additional "readiness" checks - the address is sufficient
        
        const signupResponse = await fetch('/api/auth/wallet-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });
        
        console.log('Wallet signup - Response status:', signupResponse.status, signupResponse.statusText);
        console.log('Wallet signup - Response headers:', Object.fromEntries(signupResponse.headers.entries()));

        if (signupResponse.ok) {
          // Account created - trigger onboarding for profile details
          console.log('Account created successfully, triggering onboarding');
          const responseData = await signupResponse.json().catch(() => ({}));
          console.log('Signup response data:', responseData);
          
          // Verify account was actually created by checking /api/me
          const verifyResponse = await fetch('/api/me', {
            headers: getWalletAuthHeaders(walletAddress),
          });
          const verifyData = await verifyResponse.json().catch(() => ({ user: null }));
          
          if (verifyData.user) {
            console.log('Account verified in database, triggering onboarding');
            if (onWalletConnected && !hasTriggeredOnboarding) {
              setHasTriggeredOnboarding(true);
              onWalletConnected(walletAddress);
            }
          } else {
            console.error('Account creation reported success but user not found in database');
            // Reset state to allow retry
            setProcessedAddress(null);
            processingRef.current = null;
            alert('Account creation may have failed. Please try disconnecting and reconnecting your wallet.');
          }
        } else {
          // Reset processedAddress to allow retry (user can disconnect/reconnect to retry)
          setProcessedAddress(null);
          processingRef.current = null;
          let errorMessage = 'Failed to create account. Please try again.';
          let errorDetails: any = null;
          try {
            const errorData = await signupResponse.json();
            errorMessage = errorData.error || errorMessage;
            errorDetails = errorData;
            console.error('Wallet signup failed:', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            console.error('Response status:', signupResponse.status, signupResponse.statusText);
            // Try to get response text for debugging
            try {
              const text = await signupResponse.text();
              console.error('Response text:', text);
              errorMessage = `Failed to create account (${signupResponse.status}): ${text.substring(0, 200)}`;
            } catch (e) {
              errorMessage = `Failed to create account (${signupResponse.status} ${signupResponse.statusText})`;
            }
          }
          
          // For Family wallets, provide more helpful error message
          const helpfulMessage = isFamilyWallet 
            ? `${errorMessage}\n\nIf you're using Family wallet, please try:\n1. Disconnect and reconnect your wallet\n2. Refresh the page\n3. Try again\n\nNote: Family wallet may show internal errors, but account creation should still work.`
            : errorMessage;
          
          console.error('Showing error alert to user:', helpfulMessage);
          alert(helpfulMessage);
        }
      }
    } catch (error) {
      // Reset processedAddress to allow retry
      setProcessedAddress(null);
      processingRef.current = null;
      console.error('Error handling wallet connection:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      const errorMessage = isFamilyWallet
        ? `An error occurred while creating your account. This may be due to Family wallet connection issues.\n\nPlease try:\n1. Disconnect and reconnect your wallet\n2. Refresh the page\n3. Try again\n\nError: ${error instanceof Error ? error.message : String(error)}`
        : `An error occurred. Please try again.\n\nError: ${error instanceof Error ? error.message : String(error)}`;
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      processingRef.current = null;
    }
  };

  return (
    <div>
      {familyWalletError && isFamilyWallet && (
        <div style={{
          padding: '12px',
          marginBottom: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Family Wallet Issue Detected:</strong> {familyWalletError}
          <br />
          <button
            onClick={() => {
              setFamilyWalletError(null);
              // Force reconnection attempt
              disconnect();
              setTimeout(() => {
                setOpen(true);
              }, 500);
            }}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}
      <button
        type="button"
        className={styles.connectWallet}
        onClick={() => {
          setFamilyWalletError(null);
          setOpen(true);
        }}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
