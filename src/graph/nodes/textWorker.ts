// textWorker.ts
// 文本处理 Worker 的示例实现
export class TextWorker {
  async process(text: string) {
    // 在此处加入具体的文本处理逻辑
    return { tokens: text.split(/\s+/) };
  }
}
