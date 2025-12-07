'use client';

import { useEffect } from 'react';
import 'intro.js/introjs.css';

const getTourSteps = () => [
  {
    title: 'Welcome to Mental Wealth Academy! 👋',
    intro: 'Welcome to Mental Wealth Academy - a modular learning management framework designed to help you achieve your educational goals. Let\'s take a quick tour to explore all the features and get you started!',
    element: 'body',
  },
  {
    title: 'Create Your Account',
    intro: 'Start by creating your account to access personalized learning paths and track your progress.',
    element: '[data-intro="create-account"]',
  },
  {
    title: 'Sign In With Ethereum',
    intro: 'Connect your Ethereum wallet to sign in securely and access blockchain-powered features.',
    element: '[data-intro="sign-in"]',
  },
  {
    title: 'Explore Quests',
    intro: 'Browse available quests and challenges. Complete them to earn USDC rewards and advance your learning journey.',
    element: '[data-intro="explore-quests"]',
  },
  {
    title: 'IPFS Library',
    intro: 'Browse educational content stored on IPFS. Explore books, resources, and learning materials in our decentralized library.',
    element: '[data-intro="library-card"]',
  },
  {
    title: 'Farcaster Friends',
    intro: 'Connect with friends from Farcaster and build your learning community. See top contributors and engage with the community.',
    element: '[data-intro="farcaster-friends"]',
  },
  {
    title: 'AI Learning Paths',
    intro: 'Discover personalized learning paths recommended by Rubi AI. Click "Daily Faucet" to get AI-powered recommendations tailored to your goals!',
    element: '[data-intro="banner-card"]',
  },
  {
    title: 'Prompt Library & Messageboard',
    intro: 'Access the prompt library and messageboard to connect with the community, share knowledge, and collaborate on learning projects.',
    element: '[data-intro="prompt-library"]',
  },
  {
    title: 'Active Quests',
    intro: 'Complete quests to earn USDC rewards! View all available quests to start your journey and track your progress.',
    element: '[data-intro="quests"]',
  },
  {
    title: 'You\'re All Set! 🎉',
    intro: 'You\'re ready to start your learning journey! You can access this tour again from your profile settings. Happy learning!',
    element: 'body',
  },
];

export const startOnboardingTour = async () => {
  // Dynamically import intro.js only on client side
  if (typeof window === 'undefined') return;
  
  const introJs = (await import('intro.js')).default;
  const intro = introJs();
  
  // Track positioning to prevent jumping
  let isPositioning = false;
  
  intro.setOptions({
    steps: getTourSteps(),
    showProgress: true,
    showBullets: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    nextLabel: 'Next →',
    prevLabel: '← Previous',
    skipLabel: 'Skip Tour',
    doneLabel: 'Got it!',
    tooltipClass: 'customTooltip',
    highlightClass: 'customHighlight',
  });

  // Set initial tooltip width to prevent abrupt changes and improve readability
  intro.onbeforechange(() => {
    const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
    if (tooltip) {
      const viewportWidth = window.innerWidth;
      const maxTooltipWidth = Math.min(400, viewportWidth - 80);
      const minTooltipWidth = Math.min(320, viewportWidth - 80);
      
      // Better sizing for readability
      tooltip.style.minWidth = `${Math.max(320, minTooltipWidth)}px`;
      tooltip.style.maxWidth = `${maxTooltipWidth}px`;
      tooltip.style.width = 'auto';
      tooltip.style.boxSizing = 'border-box';
      
      // Improve text readability
      tooltip.style.color = '#ffffff';
      tooltip.style.backgroundColor = '#1a1a1a';
      tooltip.style.border = '2px solid #4a4a4a';
      tooltip.style.borderRadius = '8px';
      tooltip.style.padding = '20px';
      tooltip.style.fontSize = '14px';
      tooltip.style.lineHeight = '1.6';
      tooltip.style.zIndex = '999999';
      
      // Ensure tooltip text is readable
      const titleElement = tooltip.querySelector('.introjs-tooltiptitle') as HTMLElement;
      if (titleElement) {
        titleElement.style.color = '#ffffff';
        titleElement.style.fontSize = '18px';
        titleElement.style.fontWeight = '600';
        titleElement.style.marginBottom = '12px';
      }
      
      const contentElement = tooltip.querySelector('.introjs-tooltipcontent') as HTMLElement;
      if (contentElement) {
        contentElement.style.color = '#e0e0e0';
        contentElement.style.fontSize = '14px';
        contentElement.style.lineHeight = '1.6';
      }
    }
    return true;
  });

  // Set consistent tooltip width and ensure it stays within viewport with improved readability
  intro.onafterchange(() => {
    // Use requestAnimationFrame for better timing with DOM updates
    requestAnimationFrame(() => {
      setTimeout(() => {
      const tooltip = document.querySelector('.introjs-tooltip') as HTMLElement;
      if (tooltip) {
        const currentStep = (intro as any)._currentStep;
        const steps = getTourSteps();
        const step = steps[currentStep];
        
        // Calculate max width based on viewport to prevent overflow
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Better sizing - smaller for individual components, larger for body elements
        let maxTooltipWidth: number;
        let minTooltipWidth: number;
        
        if (step && step.element === 'body') {
          maxTooltipWidth = Math.min(500, viewportWidth - 80);
          minTooltipWidth = Math.min(400, viewportWidth - 80);
        } else {
          maxTooltipWidth = Math.min(400, viewportWidth - 80);
          minTooltipWidth = Math.min(320, viewportWidth - 80);
        }
        
        tooltip.style.minWidth = `${Math.max(320, minTooltipWidth)}px`;
        tooltip.style.maxWidth = `${maxTooltipWidth}px`;
        tooltip.style.width = 'auto';
        tooltip.style.boxSizing = 'border-box';
        
        // Improve readability with better styling
        tooltip.style.color = '#ffffff';
        tooltip.style.backgroundColor = '#1a1a1a';
        tooltip.style.border = '2px solid #4a4a4a';
        tooltip.style.borderRadius = '8px';
        tooltip.style.padding = '20px';
        tooltip.style.fontSize = '14px';
        tooltip.style.lineHeight = '1.6';
        tooltip.style.zIndex = '999999';
        tooltip.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        
        // Position tooltip relative to highlighted element, staying within viewport
        if (step && step.element !== 'body') {
          // Find the highlighted element - try the actual element selector first
          let highlightedElement: HTMLElement | null = null;
          
          if (step.element.startsWith('[')) {
            highlightedElement = document.querySelector(step.element) as HTMLElement;
          }
          
          // Fallback to intro.js's highlighted element
          if (!highlightedElement) {
            highlightedElement = document.querySelector('.introjs-showElement') as HTMLElement;
          }
          if (!highlightedElement) {
            highlightedElement = document.querySelector('.introjs-relativePosition') as HTMLElement;
          }
          
          if (highlightedElement && !isPositioning) {
            isPositioning = true;
            
            // Get element position without scrolling (to avoid jumping)
            const elementRect = highlightedElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Only scroll if element is not visible
            const isElementVisible = 
              elementRect.top >= 0 &&
              elementRect.left >= 0 &&
              elementRect.bottom <= viewportHeight &&
              elementRect.right <= viewportWidth;
            
            // Position tooltip function
            const positionTooltip = () => {
              const currentElementRect = highlightedElement!.getBoundingClientRect();
              const currentTooltipRect = tooltip.getBoundingClientRect();
              
              // Calculate preferred position (right side of element, vertically centered)
              let preferredLeft = currentElementRect.right + 20;
              let preferredTop = currentElementRect.top + (currentElementRect.height / 2) - (currentTooltipRect.height / 2);
              
              // If tooltip would go off right edge, position it on the left side
              if (preferredLeft + currentTooltipRect.width > viewportWidth - 20) {
                preferredLeft = currentElementRect.left - currentTooltipRect.width - 20;
              }
              
              // If tooltip would go off left edge, position it on the right side
              if (preferredLeft < 20) {
                preferredLeft = currentElementRect.right + 20;
                // If still off, center it
                if (preferredLeft + currentTooltipRect.width > viewportWidth - 20) {
                  preferredLeft = (viewportWidth - currentTooltipRect.width) / 2;
                }
              }
              
              // If tooltip would go off bottom, align to bottom of element
              if (preferredTop + currentTooltipRect.height > viewportHeight - 20) {
                preferredTop = currentElementRect.bottom - currentTooltipRect.height - 20;
              }
              
              // If tooltip would go off top, align to top of element
              if (preferredTop < 20) {
                preferredTop = currentElementRect.top;
              }
              
              // Ensure tooltip stays within viewport bounds
              preferredLeft = Math.max(20, Math.min(preferredLeft, viewportWidth - currentTooltipRect.width - 20));
              preferredTop = Math.max(20, Math.min(preferredTop, viewportHeight - currentTooltipRect.height - 20));
              
              // Apply positioning
              tooltip.style.position = 'fixed';
              tooltip.style.left = `${preferredLeft}px`;
              tooltip.style.top = `${preferredTop}px`;
              tooltip.style.margin = '0';
              tooltip.style.transform = 'none';
              
              isPositioning = false;
            };
            
            // Position immediately
            positionTooltip();
            
            // If element not visible, scroll and reposition
            if (!isElementVisible) {
              highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
              setTimeout(positionTooltip, 400);
            }
          }
        } else {
          // For body elements, just ensure it stays within viewport
          const tooltipRect = tooltip.getBoundingClientRect();
          if (tooltipRect.bottom > viewportHeight) {
            tooltip.style.top = `${viewportHeight - tooltipRect.height - 20}px`;
          }
          if (tooltipRect.right > viewportWidth) {
            tooltip.style.left = `${viewportWidth - tooltipRect.width - 20}px`;
          }
          if (tooltipRect.left < 0) {
            tooltip.style.left = '20px';
          }
          if (tooltipRect.top < 0) {
            tooltip.style.top = '20px';
          }
        }
        
        // Ensure tooltip text is readable
        const titleElement = tooltip.querySelector('.introjs-tooltiptitle') as HTMLElement;
        if (titleElement) {
          titleElement.style.color = '#ffffff';
          titleElement.style.fontSize = '18px';
          titleElement.style.fontWeight = '600';
          titleElement.style.marginBottom = '12px';
        }
        
        const contentElement = tooltip.querySelector('.introjs-tooltipcontent') as HTMLElement;
        if (contentElement) {
          contentElement.style.color = '#e0e0e0';
          contentElement.style.fontSize = '14px';
          contentElement.style.lineHeight = '1.6';
        }
        
        // Ensure buttons container doesn't overflow and is readable
        const buttonsContainer = tooltip.querySelector('.introjs-tooltipbuttons') as HTMLElement;
        if (buttonsContainer) {
          buttonsContainer.style.width = '100%';
          buttonsContainer.style.boxSizing = 'border-box';
          buttonsContainer.style.overflow = 'visible';
          buttonsContainer.style.marginTop = '16px';
          buttonsContainer.style.paddingTop = '16px';
          buttonsContainer.style.borderTop = '1px solid #4a4a4a';
          buttonsContainer.style.display = 'flex';
          buttonsContainer.style.justifyContent = 'space-between';
          buttonsContainer.style.alignItems = 'center';
          buttonsContainer.style.position = 'relative';
          buttonsContainer.style.gap = '8px';
          
          // Get buttons
          const prevButton = tooltip.querySelector('.introjs-prevbutton') as HTMLElement;
          const skipButton = tooltip.querySelector('.introjs-skipbutton') as HTMLElement;
          const nextButton = tooltip.querySelector('.introjs-nextbutton') as HTMLElement;
          
          // Position buttons: Previous (left), Skip (absolute center), Next (right)
          if (prevButton) {
            prevButton.style.order = '1';
            prevButton.style.marginRight = 'auto';
          }
          
          if (skipButton) {
            skipButton.style.order = '2';
            skipButton.style.position = 'absolute';
            skipButton.style.left = '50%';
            skipButton.style.transform = 'translateX(-50%)';
            skipButton.style.zIndex = '10';
          }
          
          if (nextButton) {
            nextButton.style.order = '3';
            nextButton.style.marginLeft = 'auto';
          }
        }
        
        // Style buttons for better readability and prevent clipping
        const buttons = tooltip.querySelectorAll('.introjs-button') as NodeListOf<HTMLElement>;
        buttons.forEach((button) => {
          button.style.color = '#ffffff';
          button.style.backgroundColor = '#4a4a4a';
          button.style.border = '1px solid #6a6a6a';
          button.style.borderRadius = '4px';
          button.style.padding = '8px 16px';
          button.style.cursor = 'pointer';
          button.style.transition = 'all 0.2s';
          button.style.whiteSpace = 'nowrap';
          button.style.overflow = 'visible';
          button.style.textOverflow = 'clip';
        });
        
        const prevButton = tooltip.querySelector('.introjs-prevbutton') as HTMLElement;
        if (prevButton) {
          prevButton.style.overflow = 'visible';
        }
        
        const skipButton = tooltip.querySelector('.introjs-skipbutton') as HTMLElement;
        if (skipButton) {
          skipButton.style.overflow = 'visible';
          skipButton.style.whiteSpace = 'nowrap';
        }
        
        const nextButton = tooltip.querySelector('.introjs-nextbutton') as HTMLElement;
        if (nextButton) {
          nextButton.style.backgroundColor = '#0066cc';
          nextButton.style.borderColor = '#0080ff';
          nextButton.style.overflow = 'visible';
        }
        
        // Ensure tooltip itself doesn't clip content
        tooltip.style.overflow = 'visible';
      }
      
      // Improve highlight overlay readability
      const overlay = document.querySelector('.introjs-overlay') as HTMLElement;
      if (overlay) {
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      }
      
      const highlight = document.querySelector('.introjs-helperLayer') as HTMLElement;
      if (highlight) {
        highlight.style.border = '3px solid #0066cc';
        highlight.style.borderRadius = '8px';
        highlight.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.7)';
      }
      }, 50);
    });
  });

  intro.start();
  
  // Mark tour as seen when it's completed or skipped
  intro.oncomplete(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
  
  intro.onexit(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
};

const OnboardingTour: React.FC = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    
    if (!hasSeenTour) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        startOnboardingTour();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};

export default OnboardingTour;

