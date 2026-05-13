"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            The application encountered an error. Please try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2 rounded-btn text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
