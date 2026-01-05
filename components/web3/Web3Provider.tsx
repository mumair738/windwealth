'use client';

import React, { useMemo } from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { OnchainKitProvider } from '@coinbase/onchainkit';

// Lazy-create config only when Web3Provider is actually rendered
let wagmiConfig: ReturnType<typeof createConfig> | null = null;
let queryClientInstance: QueryClient | null = null;

function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = createConfig(
  getDefaultConfig({
    // Your dApps chains - using Base mainnet
    chains: [base],
    transports: {
      // RPC URL for Base mainnet
      [base.id]: http(
        process.env.NEXT_PUBLIC_ALCHEMY_ID
          ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
          : undefined,
      ),
    },

    // Required API Keys
    // Family wallet explicit configuration:
    // - WalletConnect Project ID: 742bad7153998ca0c2f5f449aedc3eea
    // - Appkit Auth API secret: dbf77d81-4de9-49cf-8fb9-c318986aa5b7
    //   (Set as NEXT_PUBLIC_APPKIT_AUTH_SECRET environment variable if needed)
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '742bad7153998ca0c2f5f449aedc3eea',

    // Required App Info
    appName: "Mental Wealth Academy",
    appDescription: "Mental Wealth Academy is a virtual learning platform for the next generation.",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.mentalwealthacademy.world",
    appIcon: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.mentalwealthacademy.world"}/icons/favicon.png`,
  })
);
  }
  return wagmiConfig;
}

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient();
  }
  return queryClientInstance;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => getWagmiConfig(), []);
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="soft">
          <OnchainKitProvider
            chain={base}
            apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''}
            config={{
              wallet: {
                preference: 'all', // Allow all wallet types including Family wallets
                display: 'modal',
                // Family wallet explicit configuration
                // Appkit Auth API secret: dbf77d81-4de9-49cf-8fb9-c318986aa5b7
                // This may need to be set as NEXT_PUBLIC_APPKIT_AUTH_SECRET environment variable
                // if OnchainKit supports it
              },
            }}
          >
            {children}
          </OnchainKitProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
