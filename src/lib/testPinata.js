// Test file for Pinata IPFS integration
// This can be run in the browser console to test upload functionality

export async function testPinataUpload() {
  try {
    console.log("Testing Pinata IPFS upload...");

    // Create a test file from a canvas
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    // Draw a simple test image
    ctx.fillStyle = "#4F46E5";
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Test Image", 100, 100);
    ctx.fillText(new Date().toLocaleString(), 100, 130);

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    // Create a File object
    const testFile = new File([blob], "test-image.png", { type: "image/png" });

    console.log("Created test file:", testFile);

    // Upload via our API
    const formData = new FormData();
    formData.append("file", testFile);
    formData.append("name", "test-campaign-image");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Upload successful!");
      console.log("IPFS URL:", result.url);
      console.log("IPFS Hash:", result.hash);
      console.log("Result:", result);
      return result;
    } else {
      console.error("❌ Upload failed:", result.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    return null;
  }
}

// Expose to global scope for testing
window.testPinataUpload = testPinataUpload;
