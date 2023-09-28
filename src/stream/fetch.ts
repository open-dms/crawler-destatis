import { Transform } from "node:stream";
import { Logger } from "pino";
import { logger } from "../logger";

export class FetchStream extends Transform {
  logger: Logger;
  fetchCount = 0;

  constructor() {
    super({ objectMode: true });
    this.logger = logger.child({ context: this.constructor.name });
  }

  async _transform(
    request: Request,
    _enc: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ) {
    try {
      const start = Date.now();
      this.fetchCount++;
      this.push(await fetch(request));
      this.fetchCount--;
      const responseTime = Date.now() - start;
      callback();
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
