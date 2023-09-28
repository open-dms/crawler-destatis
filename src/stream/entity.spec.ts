import {
  EntityStream,
  Entity,
  EntityState,
  EntitySortFunction,
} from "./entity";

jest.useFakeTimers();
jest.setSystemTime(1);

describe("EntityEmitter", () => {
  it("should emit entities", async () => {
    const sort: EntitySortFunction<string> = (a, b) => 1;
    const stream = new EntityStream<string>({ sort });

    const result: Array<Entity<string>> = [];
    stream.on("data", (entity) => {
      result.push(entity);
      stream.done(entity);
    });

    stream.write("mock-entity-1");
    stream.write("mock-entity-2");

    await new Promise<void>((resolve) => stream.on("end", resolve));

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          data: "mock-entity-1",
          state: EntityState.Enqueued,
          lastUpdate: new Date(1),
        }),
        expect.objectContaining({
          id: expect.any(String),
          data: "mock-entity-2",
          state: EntityState.Enqueued,
          lastUpdate: new Date(1),
        }),
      ])
    );
  });

  it("should emit entity again", async () => {
    const sort: EntitySortFunction<string> = (a, b) => 1;
    const stream = new EntityStream<string>({ sort });

    const result: Array<Entity<string>> = [];

    stream.on("data", (entity) => {
      result.push(entity);
      jest.setSystemTime(2);
      const state = result.length === 1 ? EntityState.Ready : EntityState.Done;
      stream.update(entity, { state });
    });

    stream.write("mock-entity-1");

    await new Promise<void>((resolve) => stream.on("end", resolve));

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: "mock-entity-1",
          lastUpdate: new Date(1),
        }),
        expect.objectContaining({
          data: "mock-entity-1",
          lastUpdate: new Date(2),
        }),
      ])
    );
  });
});
