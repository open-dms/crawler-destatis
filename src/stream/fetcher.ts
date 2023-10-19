import { Transform } from "node:stream";
import { Entity } from "./entity";

export const fetcher = new Transform({
  objectMode: true,
  async transform(
    { entity, request }: { entity: Entity; request: Request },
    _,
    callback
  ) {
    const start = Date.now();

    let error;
    let data;

    try {
      const response = await fetch(request);
      data = { entity, response, responseTime: Date.now() - start };
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }

    callback(error, data);
  },
});
