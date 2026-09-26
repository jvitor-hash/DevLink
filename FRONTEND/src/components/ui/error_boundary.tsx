import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorPage from "@/pages/error";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

function asError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === "string" ? value : "Unexpected application error");
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error: asError(error) };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled application error", error, errorInfo);
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({ hasError: true, error: asError(event.error ?? event.message) });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState({ hasError: true, error: asError(event.reason) });
  };

  render() {
    if (this.state.hasError) return <ErrorPage error={this.state.error} />;
    return this.props.children;
  }
}
