// Debug script to test deadline conversion
const { convertDeadlineToTimestamp } = require("./src/lib/utils.js");

console.log("Testing deadline conversion...\n");

// Test cases
const testCases = [
  "2025-09-05T12:00",
  "2025-09-05T14:30",
  "2025-09-06T09:00",
  "2025-09-10T18:45",
];

testCases.forEach((testCase) => {
  try {
    console.log(`Input: ${testCase}`);
    const timestamp = convertDeadlineToTimestamp(testCase);
    const date = new Date(timestamp * 1000);
    console.log(`Output timestamp: ${timestamp}`);
    console.log(`Converted back to date: ${date.toLocaleString()}`);
    console.log(`UTC: ${date.toISOString()}`);
    console.log("---");
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log("---");
  }
});

console.log(`Current timestamp: ${Math.floor(Date.now() / 1000)}`);
console.log(`Current date: ${new Date().toLocaleString()}`);
