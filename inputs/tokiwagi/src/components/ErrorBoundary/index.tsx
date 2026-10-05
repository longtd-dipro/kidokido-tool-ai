import React from "react";

import ErrorPage from "pages/error";
import { reportError } from "services/api-client/error-report.service";
import { ERROR_MESSAGES } from "constants/errors";
import { isCookieEnabled } from "utils/client/cookie";

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    reportError({
      stack: error.stack,
      message: error.message
    });
    console.log({ error, errorInfo });

    if (!isCookieEnabled()) {
      this.setState({
        ...this.setState,
        message: ERROR_MESSAGES.COOKIE_IS_NOT_ALLOWED
      });
    }
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      return <ErrorPage message={this.state.message} />;
    }

    // Return children components in case of no error
    return this.props.children;
  }
}

export default ErrorBoundary;
