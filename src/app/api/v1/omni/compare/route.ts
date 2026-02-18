import { NextResponse } from "next/server";
import { calculateSimilarity } from "@/lib/omni/matcher";
import { z } from "zod";
import { UsageService, TOOL_CONFIG } from "@/lib/services/usage";
import { withAuth } from "@/lib/api/handler";

const compareSchema = z.object({
    targetA: z.string().min(1, "Payload A is required"),
    targetB: z.string().min(1, "Payload B is required"),
    type: z.enum(["text", "base64"]).optional().default("text"),
});

export const POST = withAuth(async (req, { user_id }) => {
    try {
        const body = await req.json();
        const { targetA, targetB } = compareSchema.parse(body);

        // Deduct credits for "Universal Comparison" 
        await UsageService.deductCredits(user_id, "omni");

        const result = calculateSimilarity(targetA, targetB);

        return NextResponse.json({
            success: true,
            data: {
                ...result,
                interpretation: getInterpretation(result.score),
            },
        });
    } catch (error) {
        console.error("OMEGA-SENSE Error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 400 }
        );
    }
});

function getInterpretation(score: number): string {
    if (score > 0.95) return "Near Identical (High Information Overlap)";
    if (score > 0.70) return "High Similarity (Derived or Heavily Related)";
    if (score > 0.40) return "Partial Similarity (Shared Structure or Context)";
    if (score > 0.15) return "Low Similarity (Minor Information Overlap)";
    return "No Meaningful Similarity (Independent Data)";
}
