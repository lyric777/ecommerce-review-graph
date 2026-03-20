// supervisor.ts
// 各个 Worker 的主管（示例实现）
export class Supervisor {
  start() {
    console.log('Supervisor started');
  }
  stop() {
    console.log('Supervisor stopped');
  }
}
