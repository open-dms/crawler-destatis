import { Transform } from "node:stream";

export function split(delimiter: string) {
  const stream = new Transform({
    readableObjectMode: true,
    transform: (chunk: Buffer, _, callback) => {
      chunk
        .toString("utf8")
        .split(delimiter)
        .filter((str) => str.length > 0)
        .map((str) => str.trim())
        .forEach((str) => stream.push(str));
      callback();
    },
  });
  return stream;
}

export const jsonParse = new Transform({
  objectMode: true,
  transform(chunk: string, _, callback) {
    try {
      callback(null, JSON.parse(chunk));
    } catch (err) {
      const error = new Error(`Error parsing chunk '${chunk}'`, {
        cause: {
          chunk,
          err: err instanceof Error ? err : new Error(String(err)),
        },
      });
      callback(error);
    }
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

export function getUpperQuartile(data: Array<number>): number | undefined {
  if (data.length < 4) {
    return data.slice(-1).shift();
  }

  const sortedData = [...data].sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedData.length / 2);

  const upperHalf =
    sortedData.length % 2 === 0
      ? sortedData.slice(medianIndex)
      : sortedData.slice(medianIndex + 1);

  if (upperHalf.length % 2 === 0) {
    const upperMiddle = upperHalf.length / 2;
    return (upperHalf[upperMiddle - 1] + upperHalf[upperMiddle]) / 2;
  } else {
    const upperMedianIndex = Math.floor(upperHalf.length / 2);
    return upperHalf[upperMedianIndex];
  }
}

export function getMedian(data: Array<number>): number | undefined {
  const sortedData = data.toSorted((a, b) => a - b);
  const medianIndex = Math.floor(sortedData.length / 2);
  return sortedData[medianIndex];
}
