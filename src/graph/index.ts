import { StateGraph, END, START } from "@langchain/langgraph";
import { ReviewGraphState } from "./state.js";

// 这是一个极其简化的 Dummy Node，仅仅为了演示骨架
const supervisorNode = async (state: typeof ReviewGraphState.State) => {
    console.log("Supervisor: 正在分析输入数据...");
    // 实际逻辑里，这里会去调用 LLM，决定下一步走哪个 Worker
    return { reasoningLogs: ["Supervisor initiated routing."] };
};

const textWorkerNode = async (state: typeof ReviewGraphState.State) => {
    console.log("Text Worker: 正在分析文本...");
    return { 
        reasoningLogs: ["Text Worker: No mismatch found."],
        finalStatus: "approved" 
    };
};

// 1. 初始化 Graph
const workflow = new StateGraph(ReviewGraphState)
    .addNode("supervisor", supervisorNode)
    .addNode("textWorker", textWorkerNode)
    
    // 2. 定义流转边 (Edges)
    .addEdge(START, "supervisor")
    // 这里未来会换成 Conditional Edge (条件分支)，目前先直线流转演示
    .addEdge("supervisor", "textWorker")
    .addEdge("textWorker", END);

// 3. 编译并导出可执行的 Graph
export const reviewModerationGraph = workflow.compile();