import { Transform } from "node:stream";
import { Logger } from "pino";
import { logger } from "../logger";
import { Entity } from "./entity";

export class FetchStream extends Transform {
  logger: Logger;

  constructor() {
    super({ objectMode: true });
    this.logger = logger.child({ context: this.constructor.name });
  }

  async _transform(
    { entity, request }: { entity: Entity; request: Request },
    _enc: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ) {
    const start = Date.now();

    let error = null;
    try {
      const response = await fetch(request);
      this.push({ entity, response, responseTime: Date.now() - start });
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }

    callback(error);
  }
}
