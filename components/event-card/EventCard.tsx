import React from 'react';
import Image from 'next/image';
import styles from './EventCard.module.css';

interface EventCardProps {
  imageUrl?: string;
  heading?: string;
  badge1Text?: string;
  badge2Text?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  description?: string;
  secondaryText?: string;
  onRegister?: () => void;
  onSecondaryAction?: () => void;
  secondaryButtonText?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  imageUrl = 'https://i.pinimg.com/originals/f4/7a/82/f47a82a4efc8091a7026305e31b9dc54.gif',
  heading = 'Event Title',
  badge1Text = 'Category',
  badge2Text = 'Date',
  authorName = 'Author Name',
  authorRole = 'Event Curator',
  description = 'Join us for an exciting event filled with learning and networking opportunities.',
  secondaryText,
  onRegister,
  onSecondaryAction,
  secondaryButtonText = 'Learn More',
}) => {
  // Use secondaryText if provided, otherwise combine badge1Text and badge2Text
  const displaySecondaryText = secondaryText || `${badge1Text} • ${badge2Text}`;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Image Space */}
        <div className={styles.imageBox}>
          <Image
            src={imageUrl}
            alt={heading}
            fill
            className={styles.image}
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>

        {/* Content Box */}
        <div className={styles.contentBox}>
          {/* Card Title */}
          <h2 className={styles.heading}>{heading}</h2>

          {/* Secondary Text */}
          <div className={styles.secondaryText}>{displaySecondaryText}</div>

          {/* Description */}
          <p className={styles.description}>{description}</p>

          {/* Action Buttons */}
          <div className={styles.actionsContainer}>
            <button className={styles.secondaryButton} onClick={onSecondaryAction}>
              {secondaryButtonText}
            </button>
            <button className={styles.registerButton} onClick={onRegister}>
              <svg
                className={styles.eventIcon}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 4.99999V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V4.99999C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.3333 1.66666V4.99999M6.66667 1.66666V4.99999M2.5 8.33333H17.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.33333 12.5H11.6667M8.33333 15H13.3333"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

