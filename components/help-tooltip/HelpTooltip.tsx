'use client';

import React, { useState } from 'react';
import styles from './HelpTooltip.module.css';

interface HelpTooltipProps {
  content: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  position = 'top-right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={`${styles.helpTooltip} ${styles[position]}`}>
      <button
        type="button"
        className={styles.helpIcon}
        onClick={handleToggle}
        aria-label="Need help?"
        aria-expanded={isOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 14.1667V10M10 5.83333H10.0083"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={handleClose} />
          <div className={styles.tooltipContent}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close help"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className={styles.tooltipText}>
              {content}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
