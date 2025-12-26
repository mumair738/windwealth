'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './ShardAnimation.module.css';

interface ShardAnimationProps {
  shards: number;
  onComplete?: () => void;
}

export const ShardAnimation: React.FC<ShardAnimationProps> = ({ shards, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayShards, setDisplayShards] = useState(0);

  useEffect(() => {
    setIsAnimating(true);
    
    // Animate shard count from 0 to target
    const duration = 1500;
    const steps = 30;
    const increment = shards / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(shards, current + increment);
      setDisplayShards(Math.floor(current));

      if (step >= steps) {
        setDisplayShards(shards);
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimating(false);
          onComplete?.();
        }, 500);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [shards, onComplete]);

  if (!isAnimating) return null;

  return (
    <div className={styles.shardAnimation}>
      <div className={styles.shardBubble}>
        <Image
          src="/icons/shard.svg"
          alt="Shard"
          width={32}
          height={32}
          className={styles.shardIcon}
        />
        <div className={styles.shardText}>
          <div className={styles.shardLabel}>+{displayShards}</div>
          <div className={styles.shardSubtext}>Shards Earned!</div>
        </div>
      </div>
    </div>
  );
};

