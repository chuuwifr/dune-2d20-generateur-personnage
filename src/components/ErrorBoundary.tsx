import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Dune 2d20 App:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0c10] text-[#e0d6c3] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#14151c] border border-[#a83232] rounded-xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl font-bold">
              !
            </div>
            <h1 className="font-cinzel text-xl font-bold text-[#f5ebd9] mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-sm text-[#a89885] mb-6">
              L'application a rencontré une anomalie inattendue.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-[#0b0c10] p-4 rounded border border-[#2a2319] text-red-300 font-mono overflow-auto max-h-40 mb-6">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch (e) {
                  // ignore
                }
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4a34b] to-[#8c4e1a] text-black font-semibold rounded-lg hover:brightness-110 transition shadow-lg text-sm"
            >
              Réinitialiser et recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
