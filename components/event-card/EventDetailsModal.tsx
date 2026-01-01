'use client';

import React, { useEffect } from 'react';
import styles from './EventDetailsModal.module.css';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    date: string;
    time: string;
    description: string;
  };
  onDownloadResources?: () => void;
  onReserveSeat?: () => void;
  isReserved?: boolean;
  isReserving?: boolean;
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onDownloadResources,
  onReserveSeat,
  isReserved = false,
  isReserving = false,
}: EventDetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>{event.title}</h2>

          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Date:</span>
              <span className={styles.detailValue}>{event.date}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Time:</span>
              <span className={styles.detailValue}>{event.time}</span>
            </div>
          </div>

          <div className={styles.description}>
            <p>{event.description}</p>
          </div>

          <div className={styles.actions}>
            {onDownloadResources && (
              <button
                className={styles.downloadButton}
                onClick={onDownloadResources}
              >
                Download Resources
              </button>
            )}
            {onReserveSeat && (
              <button
                className={styles.reserveButton}
                onClick={onReserveSeat}
                disabled={isReserved || isReserving}
              >
                {isReserving ? 'Reserving...' : isReserved ? 'Reserved' : 'Reserve Your Seat'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
