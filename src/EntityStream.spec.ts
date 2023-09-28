import { EntityStream, Entity } from "./EntityStream";

describe("EntityEmitter", () => {
  it("should emit new entities", async () => {
    const criteria = (entity: Entity<string>) => true;
    const stream = new EntityStream<string>({ criteria });

    stream.write("mock-entity-1");
    stream.write("mock-entity-2");

    const result: Array<Entity<string>> = [];
    stream.on("data", (data) => result.push(data));

    await new Promise<void>((resolve) => stream.on("end", resolve));

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          data: "mock-entity-1",
        }),
        expect.objectContaining({
          id: expect.any(String),
          data: "mock-entity-2",
        }),
      ])
    );
  });
});
