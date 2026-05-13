import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info.componentStack); }
  handleReset = () => { this.setState({ hasError: false, error: null }); window.location.href = "/"; };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-10">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-5" style={{ animation: "shake 400ms ease both" }}>💥</div>
          <h1 className="font-display text-2xl font-extrabold mb-2">Something went wrong</h1>
          <p className="text-muted text-sm mb-6">An unexpected error occurred. The issue has been noted.</p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="bg-surface2 border border-border rounded-lg p-3 text-xs text-red text-left overflow-x-auto mb-6 whitespace-pre-wrap break-words font-mono">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={this.handleReset}
              className="px-7 py-2.5 bg-accent text-white rounded-lg font-display font-bold text-sm hover:bg-[var(--color-accent-hl)] transition-colors">
              Go to Homepage
            </button>
            <button onClick={() => window.location.reload()}
              className="px-7 py-2.5 bg-transparent border border-border text-muted rounded-lg font-display font-semibold text-sm hover:border-muted hover:text-text transition-all">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
