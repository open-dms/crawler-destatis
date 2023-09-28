import { pipeline } from "node:stream/promises";
import { request, response } from "./destatis";
import { EntityStream } from "./entity";
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
