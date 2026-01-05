'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import styles from './WalletAdvancedDemo.module.css';

interface WalletAdvancedDemoProps {
  onWalletConnected?: (address: string) => void;
}

export function WalletAdvancedDemo({ onWalletConnected }: WalletAdvancedDemoProps) {
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAddress, setProcessedAddress] = useState<string | null>(null);
  const [hasTriggeredOnboarding, setHasTriggeredOnboarding] = useState(false);

  // Handle wallet connection and user check/creation
  useEffect(() => {
    if (isConnected && address && !isProcessing && processedAddress !== address) {
      handleWalletConnection(address);
    }
  }, [isConnected, address, isProcessing, processedAddress]);

  // Reset processed address when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setProcessedAddress(null);
      setHasTriggeredOnboarding(false);
      setIsProcessing(false);
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
  }, [isConnected, address, isProcessing]);

  const handleWalletConnection = async (walletAddress: string) => {
    // Prevent processing the same address twice
    if (processedAddress === walletAddress) {
      return;
    }
    
    setIsProcessing(true);
    setProcessedAddress(walletAddress);
    try {
      // Check if user exists with this wallet address
      const meResponse = await fetch('/api/me', {
        headers: getWalletAuthHeaders(walletAddress),
      });
      
      const meData = await meResponse.json();
      
      if (meData.user) {
        // User exists - check if they have complete profile details
        // Check if username is not the temporary one (starts with "user_")
        const hasUsername = meData.user.username && 
          !meData.user.username.startsWith('user_');
        
        // Check profile completeness by fetching full profile
        const profileResponse = await fetch('/api/profile', {
          headers: getWalletAuthHeaders(walletAddress),
        });
        
        let hasCompleteProfile = hasUsername;
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
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
        }
        
        if (hasCompleteProfile) {
          // User has complete profile - redirect to home
          console.log('Profile complete, redirecting to home');
          window.location.replace('/home');
        } else {
          // User exists but needs profile details - trigger onboarding
          if (onWalletConnected && !hasTriggeredOnboarding) {
            setHasTriggeredOnboarding(true);
            onWalletConnected(walletAddress);
          }
        }
      } else {
        // User doesn't exist - create account with wallet address
        const signupResponse = await fetch('/api/auth/wallet-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getWalletAuthHeaders(walletAddress),
          },
        });

        if (signupResponse.ok) {
          // Account created - trigger onboarding for profile details
          if (onWalletConnected && !hasTriggeredOnboarding) {
            setHasTriggeredOnboarding(true);
            onWalletConnected(walletAddress);
          }
        } else {
          const errorData = await signupResponse.json();
          console.error('Wallet signup failed:', errorData);
          alert(errorData.error || 'Failed to create account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      className={styles.connectWallet}
      onClick={() => setOpen(true)}
      disabled={isProcessing}
    >
      {isProcessing ? 'Processing...' : 'Connect Wallet'}
    </button>
  );
}
