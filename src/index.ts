import { pipeline } from "node:stream/promises";
import { request, response } from "./stream/destatis";
import { EntityStream } from "./stream/entity";
import { FetchStream } from "./stream/fetch";
import { jsonl, split } from "./stream/util";

pipeline(
  process.stdin,
  split,
  new EntityStream(),
  request,
  new FetchStream(),
  response,
  jsonl,
  process.stdout
);
