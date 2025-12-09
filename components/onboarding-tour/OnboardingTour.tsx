'use client';

import { useEffect } from 'react';
import 'intro.js/introjs.css';

const getTourSteps = () => [
  {
    title: 'Welcome to Mental Wealth Academy!',
    intro: 'Welcome to Mental Wealth Academy - a modular learning management framework designed to help you achieve your educational goals. Let\'s take a quick tour to explore all the features and get you started!',
    element: 'body',
  },
  {
    title: 'Active Quests',
    intro: 'Complete quests to earn shards! View all available quests to start your journey and track your progress.',
    element: '[data-intro="quests"]',
  },
  {
    title: 'Discover Your Learning Path',
    intro: 'Find personalized learning paths and hand-picked digital classes tailored to your goals. Click "Daily Faucet" to get started!',
    element: '[data-intro="banner-card"]',
  },
  {
    title: 'Events',
    intro: 'Join workshops and events to expand your knowledge and connect with like-minded learners. Register for upcoming sessions to continue your growth journey.',
    element: '[data-intro="events"] h1',
  },
  {
    title: 'Messageboard',
    intro: 'Connect with the community through the messageboard to share ideas, ask questions, and collaborate on learning projects with fellow members.',
    element: '[data-intro="messageboard-card"]',
  },
  {
    title: 'You\'re All Set!',
    intro: 'You\'re ready to start your learning journey! You can access this tour again from your profile settings. Happy learning!',
    element: 'body',
  },
];

const applyStyles = () => {
  const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
  if (!tooltip) return;

  // Inject style tag to override intro.js defaults
  let styleTag = document.getElementById('introjs-custom-styles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'introjs-custom-styles';
    document.head.appendChild(styleTag);
    styleTag.textContent = `
      .introjs-overlay {
        background-color: rgba(0, 0, 0, 0.5) !important;
      }
      .introjs-tooltip {
        background-color: rgb(244, 245, 254) !important;
        border: 2px solid white !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        padding: 32px !important;
        overflow: hidden !important;
        min-width: 700px !important;
        max-width: 900px !important;
        width: auto !important;
        position: fixed !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
      .introjs-tooltiptitle {
        font-family: var(--font-primary), Poppins, sans-serif !important;
        font-weight: var(--font-weight-bold) !important;
        font-size: 2.5rem !important;
        color: var(--color-text-dark) !important;
        margin-bottom: 20px !important;
        line-height: 1.2 !important;
      }
      .introjs-tooltipcontent {
        font-family: var(--font-secondary), "Space Grotesk", sans-serif !important;
        font-weight: var(--font-weight-regular) !important;
        font-size: 1.25rem !important;
        color: var(--color-text-dark) !important;
        line-height: 1.7 !important;
      }
      .introjs-tooltipbuttons {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 8px !important;
        border-top: 1px solid rgba(81, 104, 255, 0.2) !important;
        padding-top: 16px !important;
        margin-top: 16px !important;
      }
      .introjs-button {
        font-family: var(--font-button), "IBM Plex Mono", monospace !important;
        font-weight: var(--font-weight-semibold) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 12px 24px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        font-size: 0.875rem !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        border: 2px solid !important;
      }
      .introjs-prevbutton {
        background-color: transparent !important;
        color: var(--color-text-dark) !important;
        border-color: var(--color-text-dark) !important;
        margin-right: auto !important;
        margin-left: 0 !important;
      }
      .introjs-prevbutton:hover {
        background-color: var(--color-text-dark) !important;
        color: var(--color-text-light) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
      }
      .introjs-nextbutton {
        background-color: var(--color-primary) !important;
        color: var(--color-text-light) !important;
        border-color: var(--color-primary) !important;
        margin-left: auto !important;
        margin-right: 0 !important;
      }
      .introjs-nextbutton:hover {
        background-color: #3d52e6 !important;
        border-color: #3d52e6 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(81, 104, 255, 0.4) !important;
      }
      .introjs-donebutton {
        background-color: var(--color-secondary) !important;
        color: var(--color-text-light) !important;
        border-color: var(--color-secondary) !important;
      }
      .introjs-donebutton:hover {
        background-color: #4fa87a !important;
        border-color: #4fa87a !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(98, 190, 143, 0.4) !important;
      }
      .introjs-skipbutton {
        white-space: nowrap !important;
        font-family: var(--font-button), "IBM Plex Mono", monospace !important;
        font-size: 0.875rem !important;
        background: transparent !important;
        border: none !important;
        text-decoration: underline !important;
        cursor: pointer !important;
        color: var(--color-text-dark) !important;
        position: absolute !important;
        right: 24px !important;
        top: 24px !important;
        margin: 0 !important;
      }
      .introjs-skipbutton:hover {
        color: var(--color-primary) !important;
      }
      .introjs-bullets {
        display: none !important;
      }
      .introjs-progress {
        background-color: rgba(81, 104, 255, 0.2) !important;
        border-radius: 10px !important;
        height: 6px !important;
        margin-bottom: 16px !important;
      }
      .introjs-progressbar {
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)) !important;
        height: 100% !important;
        border-radius: 10px !important;
        transition: width 0.3s ease !important;
      }
    `;
  }

  // Hide bullets to fix duplicate progress bars
  const bullets = tooltip.querySelector('.introjs-bullets') as HTMLElement;
  if (bullets) {
    bullets.style.display = 'none';
  }
};

export const startOnboardingTour = async () => {
  if (typeof window === 'undefined') return;
  
  const introJs = (await import('intro.js')).default;
  const intro = introJs.tour();
  
  intro.setOptions({
    steps: getTourSteps(),
    showProgress: true,
    showBullets: false,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    nextLabel: 'Next →',
    prevLabel: '← Previous',
    skipLabel: 'Skip Tour',
    doneLabel: 'Got it!',
    overlayOpacity: 0.5,
  });

  intro.onbeforechange(() => {
    setTimeout(applyStyles, 10);
    return true;
  });

  intro.onafterchange(() => {
    setTimeout(applyStyles, 10);
    setTimeout(applyStyles, 100);
    
    // Ensure overlay is visible
    const overlay = document.querySelector('.introjs-overlay') as HTMLElement;
    if (overlay) {
      overlay.style.display = 'block';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    }
  });

  intro.start();
  
  intro.oncomplete(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
  
  intro.onexit(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
};

const OnboardingTour: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startOnboardingTour();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

export default OnboardingTour;
