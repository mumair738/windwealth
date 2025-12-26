'use client';

import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import styles from './YourAccountsModal.module.css';

interface YourAccountsModalProps {
  onClose: () => void;
}

interface XAccount {
  username: string;
  userId: string;
  connectedAt: string;
}

const YourAccountsModal: React.FC<YourAccountsModalProps> = ({ onClose }) => {
  const { user: privyUser } = usePrivy();
  const [xAccount, setXAccount] = useState<XAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Extract wallet addresses from Privy user
  // Only show wallets that are explicitly linked through our system
  const wallets: string[] = [];
  // TODO: Implement wallet linking system - for now, show no wallets

  // Extract Twitter/X accounts from Privy user
  const privyUserAny = privyUser as any;
  const linkedAccounts = privyUserAny?.linkedAccounts || [];
  const twitterAccounts = linkedAccounts.filter(
    (account: any) => account.type === 'twitter' || account.type === 'x'
  );

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  // Handle wallet disconnect (placeholder)
  const handleWalletDisconnect = (address: string) => {
    // TODO: Implement wallet disconnect functionality
    console.log('Disconnect wallet:', address);
  };

  // Handle social connect
  const handleSocialConnect = async (platform: string) => {
    if (platform === 'twitter' || platform === 'x') {
      setIsConnecting(true);
      try {
        // Initiate X OAuth flow
        const response = await fetch('/api/x-auth/initiate');
        const data = await response.json();
        
        if (data.authUrl) {
          // Redirect to X authorization
          window.location.href = data.authUrl;
        } else {
          console.error('Failed to get auth URL:', data);
          setIsConnecting(false);
        }
      } catch (error) {
        console.error('Failed to connect X account:', error);
        setIsConnecting(false);
      }
    } else {
      // TODO: Implement other social connection functionality
      console.log('Connect:', platform);
    }
  };

  // Handle X account disconnect
  const handleXDisconnect = async () => {
    // TODO: Implement disconnect functionality
    // For now, just remove from UI - would need API endpoint to delete from DB
    setXAccount(null);
  };

  return (
    <div className={styles.modalWrapper} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span>链接</span>Edit Connections
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <div className={styles.animatedButtonTextContainer}>
              <div className={styles.animatedButtonText}>CLOSE</div>
              <div className={`${styles.animatedButtonText} ${styles.animatedButtonTextClone}`}>CLOSE</div>
            </div>
          </button>
        </div>

        <div className={`${styles.modalBody} ${styles.bgPluses} ${styles.connectionsModal}`}>
          <div className={styles.connectionsContainer}>
            {/* Connected Ethereum Accounts Section */}
            <div>
              <p className={`${styles.strokedText} ${styles.large}`}>Connected Ethereum Accounts</p>
              <div className={styles.walletsContainer}>
                {wallets.length > 0 && wallets.map((wallet, index) => (
                  <div key={index} className={`${styles.wallet} ${styles.shadowInnerGlow}`}>
                    <div>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 320 512"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"></path>
                      </svg>
                      <span>{formatAddress(wallet)}</span>
                    </div>
                    <button
                      className={`${styles.animatedButton} ${styles.animatedButtonDisconnect} ${styles.walletDisconnectButton}`}
                      onClick={() => handleWalletDisconnect(wallet)}
                    >
                      <div className={styles.animatedButtonTextContainer}>
                        <div className={styles.animatedButtonText}>UNLINK</div>
                        <div className={`${styles.animatedButtonText} ${styles.animatedButtonTextClone}`}>UNLINK</div>
                      </div>
                    </button>
                  </div>
                ))}
                <button className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton}`}>
                  <div className={styles.socialConnectTextContainer}>
                    <div className={styles.socialConnectText}>Link Ethereum Wallet</div>
                    <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>Link Ethereum Wallet</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Accounts Section */}
            <div>
              <p className={`${styles.strokedText} ${styles.large}`}>Social Accounts</p>
              
              {/* Connected X Account */}
              {!isLoading && xAccount && (
                <div className={styles.walletsContainer} style={{ marginBottom: '16px' }}>
                  <div className={`${styles.wallet} ${styles.shadowInnerGlow}`}>
                    <div>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                      <span>@{xAccount.username}</span>
                    </div>
                    <button
                      className={`${styles.animatedButton} ${styles.animatedButtonDisconnect} ${styles.walletDisconnectButton}`}
                      onClick={handleXDisconnect}
                    >
                      <div className={styles.animatedButtonTextContainer}>
                        <div className={styles.animatedButtonText}>UNLINK</div>
                        <div className={`${styles.animatedButtonText} ${styles.animatedButtonTextClone}`}>UNLINK</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.socialsContainer}>
                {/* Connect X Account Button */}
                {!isLoading && !xAccount && (
                  <button
                    className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton}`}
                    onClick={() => handleSocialConnect('twitter')}
                    disabled={isConnecting}
                  >
                    <div className={styles.socialConnectTextContainer}>
                      <div className={styles.socialConnectText}>
                        {isConnecting ? 'Connecting...' : 'Connect X Account'}
                      </div>
                      <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>
                        {isConnecting ? 'Connecting...' : 'Connect X Account'}
                      </div>
                    </div>
                  </button>
                )}
                <button
                  className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton} ${styles.linkedinButton}`}
                  onClick={() => handleSocialConnect('linkedin')}
                >
                  <div className={styles.socialConnectTextContainer}>
                    <div className={styles.socialConnectText}>Connect LinkedIn</div>
                    <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>Connect LinkedIn</div>
                  </div>
                </button>
                <button
                  className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton} ${styles.whatsappButton}`}
                  onClick={() => handleSocialConnect('whatsapp')}
                >
                  <div className={styles.socialConnectTextContainer}>
                    <div className={styles.socialConnectText}>Connect WhatsApp</div>
                    <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>Connect WhatsApp</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2FA Authenticators Section */}
            <div>
              <p className={`${styles.strokedText} ${styles.large}`}>2FA Authenticators</p>
              <div className={`${styles.emptyContainer} ${styles.tall} ${styles.gap}`}>
                <span>No 2FA setup yet</span>
                <span>Add 2FA to protect your account</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourAccountsModal;

