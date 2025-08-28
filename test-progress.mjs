// Test the calculateProgress function directly
import { calculateProgress } from "../lib/utils.js";

console.log("Testing calculateProgress function:");

// Test case 1: Your specific example
const result1 = calculateProgress("0.0020", "3.0000");
console.log("Test 1 - 0.0020 ETH / 3.0000 ETH:", result1);

// Test case 2: Simple case
const result2 = calculateProgress("1.0000", "2.0000");
console.log("Test 2 - 1.0000 ETH / 2.0000 ETH:", result2);

// Test case 3: Zero case
const result3 = calculateProgress("0.0000", "3.0000");
console.log("Test 3 - 0.0000 ETH / 3.0000 ETH:", result3);

// Test case 4: Very small case
const result4 = calculateProgress("0.001", "10.000");
console.log("Test 4 - 0.001 ETH / 10.000 ETH:", result4);
