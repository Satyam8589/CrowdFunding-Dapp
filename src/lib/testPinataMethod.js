// Quick test for Pinata SDK v2.5.0
import { PinataSDK } from "pinata";

// Test the correct method for v2.5.0
export async function testPinataMethod() {
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  });

  // Create a simple test file
  const testContent = "Hello IPFS from Pinata v2.5.0!";
  const blob = new Blob([testContent], { type: "text/plain" });
  const file = new File([blob], "test.txt", { type: "text/plain" });

  try {
    console.log("Testing pinata.upload.file method...");
    const result = await pinata.upload.file(file);
    console.log("Upload result:", result);
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    console.log(
      "Available methods on pinata.upload:",
      Object.keys(pinata.upload)
    );
    return null;
  }
}

// Export for browser console testing
if (typeof window !== "undefined") {
  window.testPinataMethod = testPinataMethod;
}
