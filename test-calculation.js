// Direct test of the progress calculation
console.log("=== PROGRESS CALCULATION TEST ===");

// Copy the exact function from utils.js
const calculateProgress = (collected, target) => {
  // Simple, bulletproof calculation
  const collectedFloat = parseFloat(collected) || 0;
  const targetFloat = parseFloat(target) || 0;

  if (targetFloat === 0) return 0;

  const progress = (collectedFloat / targetFloat) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// Test cases
const testCases = [
  { collected: "0.0070", target: "3.0000", expected: "0.2%" },
  { collected: "0.0020", target: "3.0000", expected: "0.1%" },
  { collected: "1.5000", target: "3.0000", expected: "50.0%" },
  { collected: "3.0000", target: "3.0000", expected: "100.0%" },
];

testCases.forEach((test, index) => {
  const result = calculateProgress(test.collected, test.target);
  const formatted = result === 0 ? "0%" : `${result.toFixed(1)}%`;

  console.log(`Test ${index + 1}:`);
  console.log(`  Input: ${test.collected} ETH / ${test.target} ETH`);
  console.log(`  Raw result: ${result}`);
  console.log(`  Formatted: ${formatted}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  ✓ Correct: ${formatted === test.expected ? "YES" : "NO"}`);
  console.log("");
});

console.log("=== END TEST ===");
