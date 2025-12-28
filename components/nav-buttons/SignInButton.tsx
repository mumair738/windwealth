'use client';

import React from 'react';
import Image from 'next/image';
import styles from './SignInButton.module.css';

interface SignInButtonProps {
  onClick?: () => void;
}

const SignInButton: React.FC<SignInButtonProps> = ({ onClick }) => {
  return (
    <button 
      className={styles.signInButton} 
      data-intro="sign-in"
      onClick={onClick}
      type="button"
    >
      <Image 
        src="/icons/ethlogo.svg" 
        alt="Ethereum logo" 
        width={20}
        height={20}
        className={styles.ethLogo}
      />
      <span className={styles.buttonText}>Create Account</span>
    </button>
  );
};

export default SignInButton;

