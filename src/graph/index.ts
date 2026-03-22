import { StateGraph, END, START } from "@langchain/langgraph";
import { ReviewGraphState } from "./state.js";
import { textWorkerNode } from "./nodes/textWorker.js";
import { visionWorkerNode } from "./nodes/visionWorker.js";
import { imputationWorkerNode } from "./nodes/imputationWorker.js";
//import { supervisorNode } from "./nodes/supervisor.js";
//import { finalDecisionNode } from "./nodes/finalDecision.js";

// This is a highly simplified dummy node used only to demonstrate the skeleton
const supervisorNode = async (state: typeof ReviewGraphState.State) => {
    console.log("Supervisor: analyzing input...");
    // In a real implementation this would call an LLM and choose which worker to run next
    return { reasoningLogs: ["Supervisor initiated routing."] };
};

const finalDecisionNode = async (state: typeof ReviewGraphState.State) => {
    console.log("Final Decision: aggregating all worker results...");
    return { finalStatus: "approved" };
};

const routeAfterSupervisor = (state: typeof ReviewGraphState.State): string[] => {
    const payload = state.reviewPayload;
    // Text worker is ALWAYS required
    const nextNodes = ["textWorker"]; 
    // Conditionally add other workers based on payload
    if (payload?.imageUrl) {
        nextNodes.push("visionWorker");
    }
    if (payload?.rating === undefined || payload?.rating === null) {
        nextNodes.push("imputationWorker");
    }
    console.log(`Supervisor routing to: [${nextNodes.join(", ")}]`);
    return nextNodes;
};

const workflow = new StateGraph(ReviewGraphState)
    .addNode("supervisor", supervisorNode)
    .addNode("textWorker", textWorkerNode)
    .addNode("visionWorker", visionWorkerNode)
    .addNode("imputationWorker", imputationWorkerNode)
    .addNode("finalDecision", finalDecisionNode)
    
    // 4. Define edges (transitions)
    .addEdge(START, "supervisor")
    
    // Dynamic parallel branching
    .addConditionalEdges("supervisor", routeAfterSupervisor)
    
    // Fan-in: All executed workers must converge to the final decision node
    .addEdge("textWorker", "finalDecision")
    .addEdge("visionWorker", "finalDecision")
    .addEdge("imputationWorker", "finalDecision")
    
    .addEdge("finalDecision", END)

export const reviewModerationGraph = workflow.compile();