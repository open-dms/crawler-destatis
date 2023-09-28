import { Transform } from "node:stream";

export const split = new Transform({
  objectMode: true,
  transform: (chunk: Buffer, _, callback) => {
    chunk
      .toString("utf8")
      .split(",")
      .map((str) => str.trim())
      .forEach((str) => split.push(str));
    callback(null);
  },
});

export const jsonl = new Transform({
  writableObjectMode: true,
  transform(line, _, callback) {
    callback(null, JSON.stringify(line) + "\n");
  },
});
