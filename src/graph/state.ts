import { Annotation } from "@langchain/langgraph";

// 定义贯穿整个 Graph 的数据结构
export const ReviewGraphState = Annotation.Root({
  // 1. 输入数据 (Python 主节点传进来的)
  reviewPayload: Annotation<any>(), 
  
  // 2. 过程数据 (各个 Worker 写回来的推理日志)
  reasoningLogs: Annotation<string[]>({
    reducer: (curr, update) => curr.concat(update), // 每次有新日志就追加进去
    default: () => [],
  }),

  // 3. 最终输出数据 (Supervisor 拍板决定的)
  finalStatus: Annotation<"approved" | "rejected" | "pending_review">(),
  autoFlag: Annotation<string | null>(),
  inferredScore: Annotation<number | null>(),
});