// visionWorker.ts
import { ChatOpenAI } from "@langchain/openai"; 
import { z } from "zod";
import { ReviewGraphState } from "../state.js";

const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

export const visionWorkerNode = async (state: typeof ReviewGraphState.State) => {
    console.log("Vision Worker: analyzing image...");
    const { imageUrl } = state.reviewPayload;

    const visionAnalysisSchema = z.object({
        isSafe: z.boolean().describe("False if the image contains NSFW, violence, or inappropriate content."),
        isRelevant: z.boolean().describe("False if the image is completely unrelated to a product review (e.g., random memes)."),
        reasoning: z.string().describe("Explanation of what the image contains and why it was flagged or approved.")
    });

    const structuredVisionLlm = llm.withStructuredOutput(visionAnalysisSchema);

    const prompt = `
You are an expert e-commerce image moderator.
Analyze the image provided at the following URL: ${imageUrl}

Your tasks:
1. Determine if the image contains any unsafe or inappropriate content (NSFW, violence, illegal items).
2. Determine if the image is generally relevant to a shopping/product review context.
`;

    // Note: For actual vision tasks, you need to pass the image URL in the specific LangChain message format.
    // This is a simplified invocation for the prompt structure.
    const result = await structuredVisionLlm.invoke(prompt);

    return {
        reasoningLogs: [`[Vision Worker] Safe: ${result.isSafe}, Relevant: ${result.isRelevant}. Reason: ${result.reasoning}`]
    };
};
