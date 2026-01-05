'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a Family wallet error
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    
    const isFamilyWalletError = 
      errorMessage.includes('The JSON sent is not a valid Request object') ||
      errorMessage.includes('api.app.family.co') ||
      errorStack.includes('family/lib/index') ||
      errorStack.includes('family-accounts-connector') ||
      errorMessage.includes('InvariantError');
    
    if (isFamilyWalletError) {
      // Don't show error boundary for Family wallet errors - they're non-critical
      // Just log and continue
      console.warn('Family wallet error caught by error boundary (non-critical):', errorMessage);
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('Error caught by WalletErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Only show error UI for non-Family wallet errors
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
