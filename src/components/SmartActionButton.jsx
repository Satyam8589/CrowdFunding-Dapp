import React, { useState } from "react";
import { useNetwork } from "../contexts/NetworkContext";

const SmartActionButton = ({
  action,
  onClick,
  children,
  className = "",
  disabled = false,
  requiresInteraction = true,
}) => {
  const {
    isWalletConnected,
    needsNetworkSwitch,
    canInteract,
    switchNetwork,
    connectWallet,
    switchToInteractMode,
    networkMode,
  } = useNetwork();

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled) return;

    // If this action doesn't require interaction (like browsing), just execute it
    if (!requiresInteraction) {
      onClick?.();
      return;
    }

    setIsLoading(true);

    try {
      // Switch to interact mode if we're in browse mode
      if (networkMode === "browse") {
        switchToInteractMode();
      }

      // If wallet not connected, connect it first
      if (!isWalletConnected) {
        await connectWallet();
        // After connection, we might need to check network again
        return; // Let the state update and user click again
      }

      // If wrong network, switch it
      if (needsNetworkSwitch) {
        await switchNetwork();
        // After network switch, let user click again
        return;
      }

      // If all requirements are met, execute the action
      if (canInteract) {
        await onClick?.();
      }
    } catch (error) {
      console.error("Smart action failed:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Loading...";

    if (!requiresInteraction) {
      return children;
    }

    if (!isWalletConnected) {
      return "Connect Wallet";
    }

    if (needsNetworkSwitch) {
      return "Switch Network";
    }

    return children;
  };

  const getButtonStyle = () => {
    if (!requiresInteraction) {
      return className;
    }

    let baseClasses =
      "transition-all duration-200 font-semibold py-2 px-4 rounded-lg";

    if (!isWalletConnected) {
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white ${className}`;
    }

    if (needsNetworkSwitch) {
      return `${baseClasses} bg-orange-600 hover:bg-orange-700 text-white ${className}`;
    }

    return `${baseClasses} ${className}`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={getButtonStyle()}
    >
      {getButtonText()}
    </button>
  );
};

export default SmartActionButton;
