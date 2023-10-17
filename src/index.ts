import { pipeline } from "node:stream/promises";
import { request, response } from "./stream/destatis";
import { EntityStream } from "./stream/entity";
import { FetchStream } from "./stream/fetch";
import { extractData, jsonl, split } from "./stream/util";
import { TimerStream } from "./stream/timer";
import { logger } from "./logger";

const entities = new EntityStream();
const timer = new TimerStream({ throttleTime: 1500 });
const fetcher = new FetchStream();

pipeline(
  process.stdin,
  split,
  entities,
  request,
  timer,
  fetcher,
  response,
  extractData,
  jsonl,
  process.stdout
);

fetcher.on("data", ({ responseTime }) => {
  logger.info({ msg: "fetching done", responseTime });
  timer.report(responseTime);
});
