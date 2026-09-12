import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for diagnostics
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 font-inter">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
            {/* Calm Alert Icon */}
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-5 border border-blue-100">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              We couldn't load this part of the page correctly. You can try reloading or head back to the Conflux directory.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-sm active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors active:scale-95"
              >
                <Home className="w-4 h-4" />
                Go to Conflux home
              </a>
            </div>

            {/* Development-only error detail */}
            {typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left border-t border-slate-100 pt-4">
                <summary className="text-xs font-mono text-slate-400 cursor-pointer hover:text-slate-600">
                  Diagnostic details
                </summary>
                <p className="mt-2 text-xs font-mono text-red-600 bg-red-50 p-2.5 rounded border border-red-100 break-words whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
