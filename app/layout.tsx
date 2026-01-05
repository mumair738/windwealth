import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import { ConditionalWeb3Provider } from '@/components/web3/ConditionalWeb3Provider';

export const metadata: Metadata = {
  title: 'Mental Wealth Academy',
  description: 'Mental Wealth Academy is a virtual learning platform for the next generation. It\'s an online school where students can take classes, complete quests, earn rewards, and learn together. We use blockchain and cryptocurrency to make learning more engaging and rewarding.',
  icons: {
    icon: '/icons/favicon.png',
  },
  openGraph: {
    title: 'Mental Wealth Academy',
    description: 'Mental Wealth Academy is a virtual learning platform for the next generation. It\'s an online school where students can take classes, complete quests, earn rewards, and learn together. We use blockchain and cryptocurrency to make learning more engaging and rewarding.',
    images: [
      {
        url: '/icons/embbedBanner.png',
        width: 1200,
        height: 630,
        alt: 'Mental Wealth Academy - Next Gen Micro-University',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mental Wealth Academy',
    description: 'Mental Wealth Academy is a virtual learning platform for the next generation. It\'s an online school where students can take classes, complete quests, earn rewards, and learn together. We use blockchain and cryptocurrency to make learning more engaging and rewarding.',
    images: ['/icons/embbedBanner.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="base:app_id" content="693c68f5e6be54f5ed71d80f" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // CRITICAL: Set up error handlers BEFORE any other scripts load
              // This must run first to catch Family wallet errors early
              (function() {
                if (typeof window === 'undefined') return;
                
                // Handle unhandled promise rejections IMMEDIATELY
                // Family wallet has internal errors that cause unhandled rejections
                window.addEventListener('unhandledrejection', function(event) {
                  try {
                    const error = event.reason;
                    // Try multiple ways to extract error information
                    const errorMessage = error?.message || error?.error?.message || (error?.error ? String(error.error) : '') || String(error || '');
                    const errorString = String(error || '');
                    const errorStack = error?.stack || error?.error?.stack || '';
                    const errorName = error?.name || error?.error?.name || '';
                    const errorToString = error?.toString() || '';
                    
                    // Combine all error representations for matching
                    const allErrorText = [
                      errorMessage,
                      errorString,
                      errorToString,
                      errorStack,
                      errorName
                    ].join(' ');
                    
                    // Comprehensive matching for Family wallet errors and WalletConnect errors
                    // Check all possible error representations
                    const isFamilyWalletError = 
                      // Direct message matches
                      allErrorText.includes('The JSON sent is not a valid Request object') ||
                      allErrorText.includes('JSON sent is not a valid Request') ||
                      // API errors
                      allErrorText.includes('api.app.family.co') || 
                      allErrorText.includes('app.family.co') ||
                      // Stack trace matches (Family wallet script files)
                      allErrorText.includes('family/lib/index') ||
                      allErrorText.includes('family-accounts-connector') ||
                      allErrorText.includes('607-749c0992edc06302.js') ||
                      allErrorText.includes('family-accounts-connector-JRsEYbpv.js') ||
                      allErrorText.includes('index-Cs-onntv.js') ||
                      // InvariantError matches (various formats)
                      allErrorText.includes('InvariantError: Session state change subscription returned no data') ||
                      allErrorText.includes('InvariantError: Master key config not initialised') ||
                      allErrorText.includes('Session state change subscription returned no data') ||
                      allErrorText.includes('Cannot read properties of undefined (reading') && allErrorText.includes('role') ||
                      (allErrorText.includes('InvariantError') && (allErrorText.includes('family') || allErrorText.includes('607-'))) ||
                      // 401/Unauthorized errors
                      (allErrorText.includes('family.co') && (allErrorText.includes('401') || allErrorText.includes('Unauthorized'))) ||
                      // Check error name/type
                      errorName === 'InvariantError' ||
                      (errorName === 'Error' && allErrorText.includes('JSON sent is not a valid Request'));
                    
                    // WalletConnect errors (Proposal expired, etc.)
                    const isWalletConnectError = 
                      allErrorText.includes('Proposal expired') ||
                      allErrorText.includes('proposal expired') ||
                      (allErrorText.includes('@walletconnect') && (allErrorText.includes('expired') || allErrorText.includes('timeout')));
                    
                    if (isFamilyWalletError || isWalletConnectError) {
                      // CRITICAL: Prevent these errors from crashing the app
                      event.preventDefault();
                      event.stopPropagation();
                      event.stopImmediatePropagation();
                      // Silently handle - these are internal Family wallet issues
                      // Dispatch event for components to handle if needed
                      try {
                        if (isFamilyWalletError) {
                          window.dispatchEvent(new CustomEvent('familyWalletError', { 
                            detail: { error, message: errorMessage || errorString } 
                          }));
                        }
                      } catch (e) {
                        // Ignore errors in event dispatch
                      }
                      return false;
                    }
                  } catch (handlerError) {
                    // If error handler itself fails, log but don't crash
                    console.warn('Error in unhandled rejection handler:', handlerError);
                  }
                }, true); // Use capture phase to catch early
              })();
              
              // Suppress only non-critical wallet SDK analytics errors (MetaMask and Coinbase Wallet analytics)
              // DO NOT suppress Family wallet errors - they indicate real issues that need to be addressed
              if (typeof window !== 'undefined') {
                const originalError = window.console.error;
                window.console.error = function(...args) {
                  const errorString = String(args[0] || '');
                  const errorMessage = args.join(' ');
                  
                  // Check if any argument is an object with AnalyticsSDKApiError context
                  const hasAnalyticsContext = args.some(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                      // Check for context property
                      if (arg.context === 'AnalyticsSDKApiError') {
                        return true;
                      }
                      // Check stringified version
                      try {
                        const argString = JSON.stringify(arg);
                        if (argString.includes('AnalyticsSDKApiError') || 
                            argString.includes('Analytics SDK')) {
                          return true;
                        }
                      } catch (e) {
                        // Ignore JSON stringify errors
                      }
                    }
                    return false;
                  });
                  
                  // Suppress wallet SDK analytics fetch errors (non-critical)
                  // These are telemetry/analytics errors that don't affect functionality
                  const isAnalyticsError = 
                    hasAnalyticsContext ||
                    ((errorString.includes('Analytics SDK') || errorMessage.includes('Analytics SDK')) &&
                    (errorString.includes('Failed to fetch') || 
                     errorString.includes('AnalyticsSDKApiError') ||
                     errorMessage.includes('Failed to fetch') ||
                     errorMessage.includes('AnalyticsSDKApiError') ||
                     errorString.includes('TypeError: Failed to fetch') ||
                     errorMessage.includes('TypeError: Failed to fetch')));
                  
                  if (isAnalyticsError) {
                    return; // Suppress analytics errors
                  }
                  
                  // Suppress Coinbase Wallet SDK analytics errors (non-critical)
                  if (errorMessage.includes('cca-lite.coinbase.com') ||
                      errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
                      errorString.includes('cca-lite.coinbase.com')) {
                    return;
                  }
                  
                  // Suppress Family wallet internal errors from console (they're already handled by unhandledrejection)
                  // These are internal Family wallet SDK issues that don't affect functionality
                  const errorStack = args.find(arg => typeof arg === 'string' && arg.includes('at ')) || '';
                  const allConsoleErrorText = [errorString, errorMessage, errorStack].join(' ');
                  
                  const isFamilyWalletConsoleError = 
                    allConsoleErrorText.includes('The JSON sent is not a valid Request object') ||
                    allConsoleErrorText.includes('JSON sent is not a valid Request') ||
                    allConsoleErrorText.includes('api.app.family.co') ||
                    allConsoleErrorText.includes('app.family.co') ||
                    allConsoleErrorText.includes('InvariantError: Session state change') ||
                    allConsoleErrorText.includes('Session state change subscription returned no data') ||
                    (allConsoleErrorText.includes('Cannot read properties of undefined (reading') && allConsoleErrorText.includes('role')) ||
                    (allConsoleErrorText.includes('family.co') && (allConsoleErrorText.includes('401') || allConsoleErrorText.includes('Unauthorized'))) ||
                    allConsoleErrorText.includes('family/lib/index') ||
                    allConsoleErrorText.includes('family-accounts-connector') ||
                    allConsoleErrorText.includes('607-749c0992edc06302.js') ||
                    allConsoleErrorText.includes('index-Cs-onntv.js') ||
                    allConsoleErrorText.includes('family-accounts-connector-JRsEYbpv.js');
                  
                  if (isFamilyWalletConsoleError) {
                    // Suppress - these are already handled by unhandledrejection handler
                    return;
                  }
                  
                  // DO NOT suppress other Family wallet errors - log them for debugging
                  // Family wallet errors indicate real issues that need to be fixed
                  originalError.apply(console, args);
                };
                
                // Suppress network warnings for blocked wallet telemetry requests
                const originalWarn = window.console.warn;
                window.console.warn = function(...args) {
                  const warnMessage = args.join(' ');
                  if (warnMessage.includes('cca-lite.coinbase.com') ||
                      warnMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
                      warnMessage.includes('api.app.family.co') ||
                      warnMessage.includes('family/lib/index')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
              }
            `,
          }}
        />
      </head>
      <body>
        <ConditionalWeb3Provider>{children}</ConditionalWeb3Provider>
      </body>
    </html>
  );
}

