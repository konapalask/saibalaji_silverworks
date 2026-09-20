import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-6 text-center text-[#202020]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#E5E0D8] space-y-6">
            <div className="flex justify-center">
              <img
                src="/logo.webp"
                alt="Sai Balaji Silverworks"
                className="h-16 w-auto object-contain"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                SAI BALAJI SILVERWORKS
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1A1918]">
                Something Went Wrong
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                We encountered an unexpected display issue. Please reload the page to continue exploring our silver collections.
              </p>

              {this.state.error && (
                <details className="text-left bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs font-mono mt-3">
                  <summary className="cursor-pointer font-bold select-none text-[11px] text-red-800">
                    Technical Details ({this.state.error.name})
                  </summary>
                  <div className="mt-2 text-[10px] whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
                    {this.state.error.message}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-[#1A1918] hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-[#1A1918] border border-[#E5E0D8] text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
