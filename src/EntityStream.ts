import { randomUUID } from "crypto";
import { Logger } from "pino";
import { Transform, TransformOptions } from "stream";
import { logger } from "./logger";

export enum EntityState {
  New = 0,
  Enqueued = 1,
  Done = 2,
  Failed = 3,
  Retrying = 4,
}

export interface Entity<T> {
  id: string;
  data: T;
  state: EntityState;
  lastUpdate?: Date;
}

export class EntityStream<T> extends Transform {
  logger: Logger;
  buffer: Array<Entity<T>> = [];
  criteria: (entity: Entity<T>) => boolean;

  constructor({
    criteria,
    ...options
  }: TransformOptions & {
    criteria: (entity: Entity<T>) => boolean;
  }) {
    super({ ...options, objectMode: true });
    this.logger = logger.child({ context: this.constructor.name });
    this.buffer = [];
    this.criteria = criteria;
  }

  async _write(
    data: T,
    _enc: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): Promise<void> {
    this.buffer.push({
      id: randomUUID(),
      data,
      state: EntityState.New,
    });
    callback();
  }

  _read() {
    const entity = this.next();

    if (!entity) {
      this.logger.warn("No entity found, ending stream");
      return this.push(null);
    }

    this.push(entity);
  }

  private next(): Entity<T> | undefined {
    const entity = this.buffer
      .filter(
        (entity) =>
          ![EntityState.Enqueued, EntityState.Retrying].includes(entity.state)
      )
      .find(this.criteria);

    if (!entity) {
      return;
    }

    entity.state =
      entity.state === EntityState.New
        ? EntityState.Enqueued
        : EntityState.Retrying;

    return entity;
  }
}
