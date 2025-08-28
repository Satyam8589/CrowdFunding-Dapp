/**
 * Pinata IPFS Service for uploading and managing images
 * Using direct API calls instead of SDK to avoid method issues
 */

/**
 * Upload image file to Pinata IPFS using direct API
 * @param {File} file - Image file to upload
 * @param {string} name - Optional name for the file
 * @returns {Promise<{success: boolean, url?: string, hash?: string, error?: string}>}
 */
export const uploadImageToPinata = async (file, name = null) => {
  try {
    console.log("Starting Pinata upload for:", file.name);

    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
      );
    }

    // Prepare form data for direct API call
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    const metadata = JSON.stringify({
      name: name || file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size.toString(),
        uploadedFrom: "CrowdFunding-DApp",
      },
    });
    formData.append("pinataMetadata", metadata);

    // Upload using direct Pinata API with API key authentication
    console.log("API Key available:", !!process.env.NEXT_PUBLIC_PINATA_API_KEY);
    console.log(
      "API Secret available:",
      !!process.env.NEXT_PUBLIC_PINATA_API_SECRET
    );

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Pinata API error: ${response.status} - ${errorData}`);
    }

    const upload = await response.json();
    console.log("Pinata upload successful:", upload);

    // Generate the public gateway URL - handle different response formats
    const hash = upload.IpfsHash || upload.cid || upload.hash;
    const size = upload.PinSize || upload.size;

    if (!hash) {
      throw new Error("No IPFS hash returned from upload");
    }

    const gatewayUrl = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${hash}`;

    return {
      success: true,
      url: gatewayUrl,
      hash: hash,
      ipfsUrl: `ipfs://${hash}`,
      size: size,
    };
  } catch (error) {
    console.error("Pinata upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload image to IPFS",
    };
  }
};

/**
 * Get image URL from IPFS hash
 * @param {string} hash - IPFS hash
 * @returns {string} Gateway URL
 */
export const getImageUrlFromHash = (hash) => {
  if (!hash) return null;

  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace(/^ipfs:\/\//, "");

  return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cleanHash}`;
};

/**
 * Delete image from Pinata (optional - requires API key)
 * @param {string} hash - IPFS hash to unpin
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImageFromPinata = async (hash) => {
  try {
    await pinata.unpin([hash]);
    return { success: true };
  } catch (error) {
    console.error("Failed to unpin from Pinata:", error);
    return {
      success: false,
      error: error.message || "Failed to delete image",
    };
  }
};

/**
 * Test Pinata connection
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const testPinataConnection = async () => {
  try {
    const data = await pinata.testAuthentication();
    console.log("Pinata connection test:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Pinata connection test failed:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to Pinata",
    };
  }
};
