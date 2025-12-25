'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import styles from './ProfileButton.module.css';

const ProfileButton: React.FC = () => {
  const { authenticated } = usePrivy();

  // Don't show button if not authenticated
  if (!authenticated) {
    return null;
  }

  return (
    <Link 
      href="/profile" 
      className={styles.profileButton} 
      data-intro="profile"
    >
      <Image 
        src="/icons/ethlogo.svg" 
        alt="Profile" 
        width={24}
        height={24}
        className={styles.profileIcon}
      />
      <span className={styles.buttonText}>Profile</span>
    </Link>
  );
};

export default ProfileButton;

