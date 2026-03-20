import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { reviewModerationGraph } from "../graph/index.js";

// 创建 MCP Server 实例
const server = new Server(
  { name: "ecommerce-review-graph", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 1. 告诉外界（比如 Python 主节点），我这里提供一个叫 "moderate_review" 的工具
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "moderate_review",
    description: "Orchestrates a multi-agent workflow to moderate e-commerce reviews.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string" },
        rating: { type: "number" },
        imageUrl: { type: "string" }
      },
      required: ["text"]
    }
  }]
}));

// 2. 处理外界的调用请求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "moderate_review") {
    const payload = request.params.arguments;
    console.log("接收到来自主节点的审查任务:", payload);

    // 调用你写好的 LangGraph
    const finalState = await reviewModerationGraph.invoke({
        reviewPayload: payload
    });

    // 将 Graph 的最终状态作为工具的返回值，丢回给 Python 端
    return {
      content: [{ 
          type: "text", 
          text: JSON.stringify({
              status: finalState.finalStatus,
              flag: finalState.autoFlag,
              logs: finalState.reasoningLogs
          }, null, 2) 
      }]
    };
  }
  throw new Error("Tool not found");
});

// 3. 启动基于标准输入输出的传输层 (跨语言通信利器)
export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server running on stdio");
}