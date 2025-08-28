/**
 * Utility functions for handling campaign images
 */

import { uploadImageToPinata } from "./pinataService";

/**
 * Generate a placeholder image URL for campaigns
 * @param {string} title - Campaign title
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Local placeholder image path
 */
export const generatePlaceholderImage = (
  title = "Campaign",
  width = 400,
  height = 300
) => {
  // For now, return local placeholder
  // In the future, this could generate dynamic placeholders or use IPFS
  return "/images/campaign-placeholder.svg";
};

/**
 * Validate and get a safe image URL
 * @param {string} imageUrl - Original image URL
 * @param {string} fallback - Fallback image URL
 * @returns {string} Safe image URL
 */
export const getSafeImageUrl = (
  imageUrl,
  fallback = "/images/campaign-placeholder.svg"
) => {
  if (!imageUrl || imageUrl.trim() === "") {
    return fallback;
  }

  // Block problematic external services that cause infinite loops
  const blockedDomains = [
    "via.placeholder.com",
    "placeholder.com",
    "dummyimage.com",
    "fakeimg.pl",
  ];

  // Check if the URL contains any blocked domains
  const containsBlockedDomain = blockedDomains.some((domain) =>
    imageUrl.toLowerCase().includes(domain)
  );

  if (containsBlockedDomain) {
    console.warn(`Blocked unsafe image URL: ${imageUrl}`);
    return fallback;
  }

  // Check if it's a valid URL (basic validation)
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    // If it's not a valid URL, check if it's a local path
    if (
      imageUrl.startsWith("/") ||
      imageUrl.startsWith("./") ||
      imageUrl.startsWith("../")
    ) {
      return imageUrl;
    }
    return fallback;
  }
};

/**
 * Upload image to IPFS using Pinata service directly
 * @param {File} file - Image file to upload
 * @param {string} name - Optional name for the file
 * @returns {Promise<{success: boolean, url?: string, hash?: string, error?: string}>}
 */
export const uploadToIPFS = async (file, name = null) => {
  try {
    console.log("Uploading to IPFS via Pinata service:", file.name);

    // Use the Pinata service directly
    const result = await uploadImageToPinata(file, name);

    if (result.success) {
      console.log("IPFS upload successful:", result.url);
      return result;
    } else {
      console.error("IPFS upload failed:", result.error);
      return result;
    }
  } catch (error) {
    console.error("IPFS upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload to IPFS",
    };
  }
};

/**
 * Create a preview URL for uploaded files
 * @param {File} file - Image file
 * @returns {string} Object URL for preview
 */
export const createPreviewUrl = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

/**
 * Cleanup preview URL to prevent memory leaks
 * @param {string} url - Object URL to cleanup
 */
export const cleanupPreviewUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};
