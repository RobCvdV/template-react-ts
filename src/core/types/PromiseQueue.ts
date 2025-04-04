export class PromiseQueue {
  constructor(private logger?: (...args: any) => unknown) {}
  private queue: ((v: void) => void)[] = [];
  public turn = () =>
    new Promise<void>(resolve => {
      this.queue.push(resolve);
      if (this.logger) {
        this.logger(`PromiseQueue turn, queue length: ${this.queue.length}`);
      }
      if (this.queue.length === 1) {
        resolve();
      }
    });

  public advance = () => {
    this.queue.shift();
    if (this.logger) {
      this.logger(`PromiseQueue advance, remaining: ${this.queue.length}`);
    }
    const next = this.queue[0];
    if (next) {
      next();
    }
  };
  public advanceAfter = (delayMs: number) => {
    if (this.logger) {
      this.logger(`PromiseQueue advanceAfter: ${delayMs} ms`);
    }
    setTimeout(() => this.advance(), delayMs);
  };
}
