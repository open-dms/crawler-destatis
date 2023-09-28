import { Transform } from "node:stream";
import { Logger } from "pino";
import { logger } from "./logger";

export class FetchStream extends Transform {
  logger: Logger;

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
      this.push(await fetch(request));
      callback();
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
