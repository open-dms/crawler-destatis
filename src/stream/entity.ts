import { randomUUID } from "crypto";
import { Logger } from "pino";
import { Duplex } from "stream";
import { logger } from "../logger";

export enum EntityState {
  Ready = 0,
  Enqueued = 1,
  Done = 2,
}

export interface Entity<T = unknown> {
  id: string;
  data: T;
  state: EntityState;
  lastUpdate?: Date;
}

export type EntitySortFunction<T> = (a: Entity<T>, b: Entity<T>) => -1 | 0 | 1;

export class EntityStream<T> extends Duplex {
  private logger: Logger;
  private sort: EntitySortFunction<T>;
  private buffer: Array<Entity<T>> = [];

  constructor(options?: { sort?: EntitySortFunction<T> }) {
    super({ objectMode: true });
    this.logger = logger.child({ context: this.constructor.name });
    this.sort = options?.sort || ((a, b) => 1);
  }

  async _write(
    data: T,
    _enc: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): Promise<void> {
    this.logger.debug({ msg: "creating entity", data });
    this.buffer.push({
      id: randomUUID(),
      data,
      state: EntityState.Ready,
      lastUpdate: new Date(),
    });
    callback(null);
    this._read();
  }

  _read() {
    const readyEntities = this.buffer
      .filter((e) => e.state === EntityState.Ready)
      .toSorted(this.sort);

    if (!readyEntities.length) {
      const allDone = this.buffer.every((e) => e.state === EntityState.Done);

      if (this.buffer.length > 0 && allDone) {
        this.logger.info("All entities done, ending stream");
        this.push(null);
        return;
      }

      this.logger.debug("No ready entities at the moment");
      return;
    }

    const entity = readyEntities[0];
    entity.state = EntityState.Enqueued;
    this.push(entity);
  }

  update(
    entity: Entity<T>,
    { data, state = EntityState.Ready }: { state?: EntityState; data?: T }
  ) {
    this.logger.debug({ msg: `updating entity ${entity.id}`, entity, state });

    this.buffer = this.buffer.map((item) => {
      if (item.id !== entity.id) {
        return item;
      }
      return {
        ...item,
        data: data || entity.data,
        state: state,
        lastUpdate: new Date(),
      };
    });

    this._read();
  }

  done(entity: Entity<T>) {
    this.update(entity, { state: EntityState.Done });
  }
}
