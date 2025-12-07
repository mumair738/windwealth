'use client';

import Hero from '@/components/hero/Hero';
import Banner from '@/components/banner/Banner';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import BannerCard from '@/components/banner-card/BannerCard';
import PromptLibraryCard from '@/components/prompt-library-card/PromptLibraryCard';
import Quests from '@/components/quests/Quests';
import FarcasterFriends from '@/components/farcaster-friends/FarcasterFriends';
import OnboardingTour from '@/components/onboarding-tour/OnboardingTour';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <OnboardingTour />
      <Navbar />
      <Hero />
      <Banner />
      <div className={styles.content}>
        <div data-intro="side-navigation">
          <SideNavigation />
        </div>
        <div className={styles.middleSection}>
          <div data-intro="banner-card">
            <BannerCard />
          </div>
          <div className={styles.promptSection} data-intro="prompt-library">
            <PromptLibraryCard />
          </div>
          <div data-intro="quests">
            <Quests />
          </div>
          <div data-intro="farcaster-friends">
            <FarcasterFriends />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

