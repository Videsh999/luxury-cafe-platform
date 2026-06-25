import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 Aura Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-luxury-dark flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            {/* Gold ring animation */}
            <div className="relative mx-auto w-24 h-24 mb-10">
              <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/60" />
              <div className="w-24 h-24 rounded-full bg-luxury-gold/10 flex items-center justify-center">
                <span className="text-4xl">◈</span>
              </div>
            </div>

            <p className="text-luxury-gold tracking-[0.4em] uppercase text-xs mb-4 font-bold">
              Experience Interrupted
            </p>
            <h1 className="text-4xl font-serif text-white mb-4 leading-tight">
              A Moment of Pause
            </h1>
            <p className="text-white/40 text-sm font-light leading-relaxed mb-10">
              We encountered an unexpected issue. Our team has been notified.
              Please refresh to restore your experience.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-8 bg-red-900/20 border border-red-500/20 rounded-xl p-4">
                <summary className="text-red-400 text-xs uppercase tracking-widest font-bold cursor-pointer mb-2">
                  Debug Information
                </summary>
                <pre className="text-red-300/70 text-xs overflow-auto mt-2 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              className="px-12 py-4 bg-luxury-gold text-black font-bold uppercase tracking-[0.3em] text-xs rounded-full hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(197,160,89,0.3)]"
            >
              Return to Aura
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
