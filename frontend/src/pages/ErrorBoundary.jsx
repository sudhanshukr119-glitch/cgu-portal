import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: "var(--text3)", marginBottom: 20 }}>{this.state.error.message}</p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
