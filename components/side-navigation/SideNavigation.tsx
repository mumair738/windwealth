import React from 'react';
import ProfileButton from '@/components/nav-buttons/ProfileButton';
import FarcasterFriends from '@/components/farcaster-friends/FarcasterFriends';
import ShinyCard from '@/components/shiny-card/ShinyCard';
import styles from './SideNavigation.module.css';

const SideNavigation: React.FC = () => {
  return (
    <div className={styles.sideNavigation}>
      <ShinyCard />
      <ProfileButton />
      <FarcasterFriends />
    </div>
  );
};

export default SideNavigation;

