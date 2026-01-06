'use client';

import React from 'react';
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
      <span className={styles.buttonText}>Create Account</span>
    </button>
  );
};

export default SignInButton;

