import zlib from 'zlib';

/**
 * 🌌 OMEGA-SENSE: Universal Similarity Engine
 * Based on Kolmogorov Complexity & Normalized Compression Distance (NCD)
 * 
 * Formula: NCD(x, y) = (C(xy) - min(C(x), C(y))) / max(C(x), C(y))
 * where C(x) is the compressed length of x.
 */

interface SimilarityResult {
    score: number;      // 0 to 1 (1 = Identical)
    confidence: number; // Stability of the metric
    distance: number;   // Raw NCD value
}

/**
 * Computes the compressed length of a string using Zlib deflate.
 * Higher compression levels provide better approximations of Kolmogorov Complexity.
 */
function getCompressedLength(data: string | Buffer): number {
    const compressed = zlib.deflateSync(data, { level: 9 });
    return compressed.length;
}

/**
 * The Universal Matcher
 * Compares any two pieces of information (Code, Text, Data) mathematically.
 */
export function calculateSimilarity(targetA: string, targetB: string): SimilarityResult {
    if (targetA === targetB) return { score: 1, confidence: 1, distance: 0 };
    if (!targetA || !targetB) return { score: 0, confidence: 1, distance: 1 };

    const cA = getCompressedLength(targetA);
    const cB = getCompressedLength(targetB);
    const cAB = getCompressedLength(targetA + targetB);

    // NCD Formula
    const minC = Math.min(cA, cB);
    const maxC = Math.max(cA, cB);

    // NCD value (0 to ~1.1, lower is better)
    const distance = (cAB - minC) / maxC;

    // Similarity Score (1 - Distance, clamped to 0-1)
    const score = Math.max(0, Math.min(1, 1 - distance));

    return {
        score: parseFloat(score.toFixed(4)),
        distance: parseFloat(distance.toFixed(4)),
        confidence: 0.95, // Constant for basic Zlib NCD
    };
}

/**
 * Batch Comparison / Deduplication Utility
 */
export function findBestMatch(target: string, candidates: string[]): { index: number; score: number } {
    let bestScore = -1;
    let bestIndex = -1;

    candidates.forEach((candidate, index) => {
        const { score } = calculateSimilarity(target, candidate);
        if (score > bestScore) {
            bestScore = score;
            bestIndex = index;
        }
    });

    return { index: bestIndex, score: bestScore };
}
