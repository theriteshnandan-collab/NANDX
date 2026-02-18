import { calculateSimilarity } from './matcher';

// 🧪 OMEGA-SENSE LABORATORY TEST

const codeA = `
export function add(a, b) {
    return a + b;
}
`;

const codeB = `
export function sum(x, y) {
    // This is a comment
    return x + y;
}
`;

const randomText = "The quick brown fox jumps over the lazy dog";

console.log("=== 🧪 OMEGA-SENSE SIMILARITY TEST ===");

console.log("\n1. Identical Test:");
console.log(calculateSimilarity("HELLO WORLD", "HELLO WORLD"));

console.log("\n2. Code Logic Test (Different names, same structure):");
const codeResult = calculateSimilarity(codeA, codeB);
console.log(codeResult);

console.log("\n3. Extreme Difference Test (Code vs English):");
console.log(calculateSimilarity(codeA, randomText));

console.log("\n4. Minor Modification Test:");
const modResult = calculateSimilarity(randomText, randomText + "!");
console.log(modResult);

console.log("\n======================================");
if (codeResult.score > 0.6) {
    console.log("✅ SUCCESS: Math detected code similarity despite renaming.");
} else {
    console.log("❌ FAILURE: Similarity too low for logical match.");
}
