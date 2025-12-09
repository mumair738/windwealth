import React from 'react';
import styles from './Banner.module.css';

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <p className={styles.bannerText}>
        The Learning Management Software made for the Next Gen of Education.
      </p>
    </div>
  );
};

export default Banner;

