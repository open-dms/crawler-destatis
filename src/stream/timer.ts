import { Transform } from "node:stream";
import { TransformCallback } from "stream";
import { getMedian } from "./util";

export class TimerStream extends Transform {
  private timeout?: NodeJS.Timeout;
  private pushImmediate = true;
  private baseThrottleTime: number;
  private reportedTimes: Array<number> = [];

  constructor(options?: { throttleTime?: number }) {
    super({ objectMode: true });
    this.baseThrottleTime = options?.throttleTime || 1000;
  }

  public get throttleTime() {
    return Math.max(this.baseThrottleTime, getMedian(this.reportedTimes) || 0);
  }

  public report(time: number) {
    this.reportedTimes = this.reportedTimes.concat(time).slice(-10);
  }

  async _transform(
    data: any,
    _: BufferEncoding,
    callback: TransformCallback
  ): Promise<void> {
    if (this.pushImmediate) {
      this.pushImmediate = false;
      callback(null, data);
      return;
    }

    this.timeout = setTimeout(() => {
      clearTimeout(this.timeout);
      delete this.timeout;
      callback(null, data);
    }, this.throttleTime);
  }
}
