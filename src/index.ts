import { pipeline } from "node:stream/promises";
import { EntityStream } from "./EntityStream";
import { request, response } from "./destatis";
import { FetchStream } from "./fetch";
import { jsonl, split } from "./util";

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
