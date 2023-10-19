import { pipeline } from "node:stream/promises";
import { logger } from "./logger";
import { request, response } from "./stream/destatis";
import { EntityStream } from "./stream/entity";
import { fetcher } from "./stream/fetcher";
import { TimerStream } from "./stream/timer";
import { extractData, jsonParse, jsonl, split } from "./stream/util";

const entities = new EntityStream();
const timer = new TimerStream({ throttleTime: 300 });

pipeline(
  process.stdin,
  split("\n"),
  jsonParse,
  entities,
  request,
  timer,
  fetcher,
  response,
  extractData,
  jsonl,
  process.stdout
)
  .then(() => logger.info("Pipeline succeeded"))
  .catch((err: Error) => logger.error({ msg: "Pipeline failed", err }));

fetcher.on("data", ({ responseTime }) => {
  logger.info({ msg: "fetching done", responseTime });
  timer.report(responseTime);
});
