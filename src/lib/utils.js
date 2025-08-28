import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI } from "./constants";

export const formatEther = (value) => {
  try {
    return ethers.formatEther(value);
  } catch (error) {
    console.error("Error formatting ether:", error);
    return "0";
  }
};

export const parseEther = (value) => {
  try {
    return ethers.parseEther(value.toString());
  } catch (error) {
    console.error("Error parsing ether:", error);
    return ethers.parseEther("0");
  }
};

export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateProgress = (collected, target) => {
  if (!target || target === "0") return 0;
  const progress = (parseFloat(collected) / parseFloat(target)) * 100;
  return Math.min(progress, 100);
};

export const isValidEthereumAddress = (address) => {
  return ethers.isAddress(address);
};

export const getDaysLeft = (deadline) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = deadline - now;
  return Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60)));
};

export const getCampaignStatus = (deadline, withdrawn, target, collected) => {
  const now = Math.floor(Date.now() / 1000);

  if (withdrawn) return "withdrawn";
  if (deadline < now) return "expired";
  if (parseFloat(collected) >= parseFloat(target)) return "completed";
  return "active";
};

export const validateImageFile = (file) => {
  const supportedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Image size should be less than 5MB" };
  }

  return { valid: true };
};

// Convert datetime-local input to Unix timestamp with proper timezone handling
export const convertDeadlineToTimestamp = (datetimeLocalString) => {
  console.log(
    "🔍 DEBUG: convertDeadlineToTimestamp called with:",
    datetimeLocalString
  );

  if (!datetimeLocalString) {
    throw new Error("Deadline is required");
  }

  // datetime-local format: "YYYY-MM-DDTHH:MM"
  // We need to treat this as local time, not UTC
  const date = new Date(datetimeLocalString);

  console.log("🔍 DEBUG: Parsed date object:", date);
  console.log("🔍 DEBUG: Date.getTime():", date.getTime());
  console.log("🔍 DEBUG: Date is valid:", !isNaN(date.getTime()));

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid deadline format");
  }

  const currentDate = new Date();
  const deadlineTimestamp = Math.floor(date.getTime() / 1000);
  const currentTimestamp = Math.floor(currentDate.getTime() / 1000);

  console.log("Deadline conversion:", {
    input: datetimeLocalString,
    parsedDate: date.toISOString(),
    currentDate: currentDate.toISOString(),
    deadlineTimestamp,
    currentTimestamp,
    isInFuture: deadlineTimestamp > currentTimestamp,
    timeDifferenceHours: (deadlineTimestamp - currentTimestamp) / 3600,
  });

  if (deadlineTimestamp <= currentTimestamp) {
    throw new Error(
      `Deadline must be in the future. Selected time: ${date.toLocaleString()}, Current time: ${currentDate.toLocaleString()}`
    );
  }

  console.log("🔍 DEBUG: Returning timestamp:", deadlineTimestamp);
  return deadlineTimestamp;
};
