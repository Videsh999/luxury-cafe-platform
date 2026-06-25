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
    console.error('🔴 Admin Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-luxury-dark flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center mx-auto mb-8">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h2 className="text-2xl font-serif text-white mb-4">Module Error</h2>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              This admin module encountered an error. Other sections remain operational.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-red-400/70 text-xs text-left bg-red-900/10 border border-red-500/20 rounded-xl p-4 mb-8 overflow-auto">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              className="px-8 py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all"
            >
              Reset Module
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
