'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './QuestDetailSidebar.module.css';

// Shard Icon Component
const ShardIcon: React.FC<{ size?: number }> = ({ size = 18.83 }) => {
  return (
    <Image
      src="/icons/shard.svg"
      alt="Shard"
      width={size}
      height={size}
      className={styles.shardIcon}
    />
  );
};

// Close Icon Component
const CloseIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

interface QuestDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  quest: {
    id: string;
    title: string;
    academy: string;
    date: string;
    time: string;
    questName: string;
    usdcBonded: string;
    usdcReward: string;
    imageUrl?: string;
    questType?: 'proof-required' | 'no-proof' | 'follow-and-own';
    description?: string;
  } | null;
}

const QuestDetailSidebar: React.FC<QuestDetailSidebarProps> = ({ isOpen, onClose, quest }) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      setShouldRender(true);
      // Use requestAnimationFrame to ensure DOM is ready before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!quest || !shouldRender) return null;

  return (
    <>
      <div className={`${styles.backdrop} ${isAnimating ? styles.backdropVisible : ''}`} onClick={onClose} />
      <div className={`${styles.sidebar} ${isAnimating ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          {/* Header with close button */}
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>Quest Details</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {/* Top Section */}
          <div className={styles.topSection}>
            {/* Quest Image */}
            <div className={styles.questImageContainer}>
              <Image
                src={quest.imageUrl || "/icons/questbadge.png"}
                alt={quest.title}
                width={120}
                height={120}
                className={styles.questImage}
              />
            </div>

            {/* Quest Title */}
            <h1 className={styles.questTitle}>{quest.title}</h1>

            {/* Quest Details Grid */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date Added</span>
                <span className={styles.detailValue}>{quest.date}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time Added</span>
                <span className={styles.detailValue}>{quest.time}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Resolver</span>
                <span className={styles.detailValue}>Academy Oracle</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Shard Pool Total</span>
                <span className={styles.detailValue}>
                  <ShardIcon size={16} />
                  {quest.usdcBonded}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Completions Per Person</span>
                <span className={styles.detailValue}>1</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Minimum Shards Received</span>
                <span className={styles.detailValue}>
                  <ShardIcon size={16} />
                  {quest.usdcReward}
                </span>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className={styles.spacer} />

          {/* Bottom Section - Conditional based on quest type */}
          <div className={styles.bottomSection}>
            {/* Quest Description */}
            {quest.description && (
              <div className={styles.descriptionBox}>
                <h3 className={styles.sectionTitle}>Quest Description</h3>
                <p className={styles.sectionDescription}>{quest.description}</p>
              </div>
            )}

            {/* Proof Required Quest Type */}
            {quest.questType === 'proof-required' && (
              <>
                <h3 className={styles.sectionTitle}>Provide Proof</h3>
                <p className={styles.sectionDescription}>
                  Upload your marketing video proof into a ZK-Rollup. The rollup will be processed and sent for submission by the Daemon Model and the MWA Team.
                </p>

                {/* Upload Area */}
                <div className={styles.uploadArea}>
                  <div className={styles.uploadContent}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.uploadIcon}>
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className={styles.uploadText}>Click to upload or drag and drop</p>
                    <p className={styles.uploadSubtext}>Upload your CapCut marketing video (video files)</p>
                  </div>
                  <input
                    type="file"
                    id="proof-upload"
                    className={styles.fileInput}
                    accept="video/*"
                    onChange={(e) => {
                      // Handle file upload
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file);
                        // TODO: Implement ZK-Rollup upload logic
                      }
                    }}
                  />
                </div>

                {/* ZK-Rollup Info */}
                <div className={styles.zkInfo}>
                  <div className={styles.zkInfoHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.zkInfoTitle}>ZK-Rollup Processing</span>
                  </div>
                  <p className={styles.zkInfoText}>
                    Your proof will be encrypted and processed through a ZK-Rollup for privacy and verification. Once processed, it will be automatically submitted to the Daemon Model and MWA Team for review.
                  </p>
                </div>

                {/* Submit Button */}
                <button className={styles.submitButton} type="button">
                  Submit Proof
                </button>

                <Link href="/mwa/quests/admin" className={styles.adminVotingButton}>
                  ADMIN VOTING
                </Link>
              </>
            )}

            {/* No Proof Required Quest Type */}
            {quest.questType === 'no-proof' && (
              <>
                <h3 className={styles.sectionTitle}>Complete Quest</h3>
                <p className={styles.sectionDescription}>
                  Register for the event on the homepage. No proof upload is required for this quest.
                </p>

                <div className={styles.actionBox}>
                  <div className={styles.actionIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className={styles.actionText}>
                    Visit the homepage and click &quot;Register&quot; on the event card to complete this quest.
                  </p>
                </div>

                <button 
                  className={styles.submitButton} 
                  type="button"
                  onClick={() => {
                    window.location.href = '/home';
                  }}
                >
                  Go to Homepage
                </button>
              </>
            )}

            {/* Follow and Own Quest Type */}
            {quest.questType === 'follow-and-own' && (
              <>
                <h3 className={styles.sectionTitle}>Complete Quest</h3>
                <p className={styles.sectionDescription}>
                  Follow the Farcaster account @daemonagent and own an Academic Angel to complete this quest.
                </p>

                <div className={styles.requirementsList}>
                  <div className={styles.requirementItem}>
                    <div className={styles.checkIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.requirementContent}>
                      <span className={styles.requirementTitle}>Follow @daemonagent</span>
                      <span className={styles.requirementDescription}>Follow the Farcaster account on Warpcast</span>
                    </div>
                  </div>
                  <div className={styles.requirementItem}>
                    <div className={styles.checkIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.requirementContent}>
                      <span className={styles.requirementTitle}>Own an Academic Angel</span>
                      <span className={styles.requirementDescription}>Verify ownership of an Academic Angel NFT</span>
                    </div>
                  </div>
                </div>

                <div className={styles.zkInfo}>
                  <div className={styles.zkInfoHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.zkInfoTitle}>Verification</span>
                  </div>
                  <p className={styles.zkInfoText}>
                    Your Farcaster follow status and Academic Angel ownership will be automatically verified. No manual proof submission required.
                  </p>
                </div>

                <button className={styles.submitButton} type="button">
                  Verify Completion
                </button>
              </>
            )}

            {/* Default/No Quest Type - Show proof upload */}
            {!quest.questType && (
              <>
                <h3 className={styles.sectionTitle}>Provide Proof</h3>
                <p className={styles.sectionDescription}>
                  Upload your proof into a ZK-Rollup. The rollup will be processed and sent for submission by the Daemon Model and the MWA Team.
                </p>

                {/* Upload Area */}
                <div className={styles.uploadArea}>
                  <div className={styles.uploadContent}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.uploadIcon}>
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className={styles.uploadText}>Click to upload or drag and drop</p>
                    <p className={styles.uploadSubtext}>Your proof will be processed via ZK-Rollup</p>
                  </div>
                  <input
                    type="file"
                    id="proof-upload"
                    className={styles.fileInput}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      // Handle file upload
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file);
                        // TODO: Implement ZK-Rollup upload logic
                      }
                    }}
                  />
                </div>

                {/* ZK-Rollup Info */}
                <div className={styles.zkInfo}>
                  <div className={styles.zkInfoHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.zkInfoTitle}>ZK-Rollup Processing</span>
                  </div>
                  <p className={styles.zkInfoText}>
                    Your proof will be encrypted and processed through a ZK-Rollup for privacy and verification. Once processed, it will be automatically submitted to the Daemon Model and MWA Team for review.
                  </p>
                </div>

                {/* Submit Button */}
                <button className={styles.submitButton} type="button">
                  Submit Proof
                </button>

                <Link href="/mwa/quests/admin" className={styles.adminVotingButton}>
                  ADMIN VOTING
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestDetailSidebar;

