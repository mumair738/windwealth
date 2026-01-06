import React from 'react';
import styles from './FarcasterFriends.module.css';

const FarcasterFriends: React.FC = () => {
  const stats = [
    { label: 'Classrooms Available', value: '13' },
    { label: 'Blockchain Actions', value: '542' },
    { label: 'Votes Declares', value: '3542' },
    { label: 'Certificates Earned', value: '34' },
    { label: 'Daemon Distributed', value: '324k' },
  ];

  return (
    <div className={styles.container} data-intro="farcaster-friends">
      <div className={styles.statsContainer}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarcasterFriends;

