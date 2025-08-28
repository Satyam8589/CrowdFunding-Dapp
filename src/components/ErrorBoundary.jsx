import React from "react";
import ContractDebugger from "./ContractDebugger";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDebugger: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  toggleDebugger = () => {
    this.setState((prevState) => ({
      showDebugger: !prevState.showDebugger,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                There was an error loading the application. This might be a
                contract connectivity issue.
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">
                  Error Details:
                </h3>
                <p className="text-red-700 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Reload Page
              </button>
              <button
                onClick={this.toggleDebugger}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                {this.state.showDebugger ? "Hide" : "Show"} Contract Debugger
              </button>
            </div>

            {this.state.showDebugger && (
              <div className="mt-6">
                <ContractDebugger />
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Common Solutions:
              </h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Make sure you're connected to the Sepolia network</li>
                <li>• Check that your wallet is properly connected</li>
                <li>• Try refreshing the page</li>
                <li>
                  • Ensure the contract is deployed at the correct address
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
