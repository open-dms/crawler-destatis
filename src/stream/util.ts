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

export const extractData = new Transform({
  objectMode: true,
  transform({ data }, _, callback) {
    callback(null, data);
  },
});

export const jsonl = new Transform({
  writableObjectMode: true,
  transform(line, _, callback) {
    callback(null, JSON.stringify(line) + "\n");
  },
});

export function getMedian(data: Array<number>): number | undefined {
  const sortedData = data.toSorted((a, b) => a - b);
  const medianIndex = Math.floor(sortedData.length / 2);
  return sortedData[medianIndex];
}
