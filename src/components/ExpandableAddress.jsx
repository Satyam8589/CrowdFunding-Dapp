"use client";

import { useState } from "react";
import { truncateAddress, copyToClipboard } from "../lib/utils";

export default function ExpandableAddress({
  address,
  className = "",
  startChars = 6,
  endChars = 4,
  showCopyButton = true,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const displayAddress = isExpanded
    ? address
    : truncateAddress(address, startChars, endChars);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCopy = async (e) => {
    e.stopPropagation(); // Prevent toggle when clicking copy
    const success = await copyToClipboard(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        onClick={handleToggle}
        className="cursor-pointer font-mono text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors select-all"
        title={
          isExpanded ? "Click to minimize" : "Click to expand full address"
        }
      >
        {displayAddress}
      </span>

      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={copied ? "Copied!" : "Copy address"}
        >
          {copied ? (
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
