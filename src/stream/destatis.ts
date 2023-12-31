import HTMLParser from "node-html-parser";
import { Transform } from "node:stream";
import { Entity } from "./entity";
import { endpoint } from "../config";

const localityFields = [
  "Bundesland",
  "Region",
  "Kreis",
  "Amtl. Gemeindeschlüssel",
  "Gemeindetyp",
  "Postleitzahl",
  "Anschrift der Gemeinde",
  "Straße",
  "Ort",
  "Fläche in km²",
  "Einwohner",
];

function parseLocalityData(data: string) {
  const root = HTMLParser.parse(data).removeWhitespace();
  return root.querySelectorAll(".list-group").map((group) =>
    group
      .querySelectorAll(".list-group-item .row")
      .map((node) => [node.firstChild.textContent, node.lastChild.textContent])
      .map((row) => row.map((col) => col.replace(/\s+/g, " ").trim()))
  );
}

function filterLocalityFields(localityFields: Array<string>) {
  return (group: Array<Array<string>>) =>
    group.filter(([key, value]) => localityFields.includes(key));
}

export const request = new Transform({
  objectMode: true,
  transform(entity: Entity<string>, _, callback) {
    const url = new URL(endpoint);
    const body = new URLSearchParams();
    body.append("mi_search", String(entity.data));
    body.append("form_id", "municipality_index_search");
    this.push({
      entity,
      request: new Request(url, {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        body,
      }),
    });
    callback(null);
  },
});

export const response = new Transform({
  objectMode: true,
  transform: async (
    { entity, response }: { entity: Entity; response: Response },
    _,
    callback
  ) => {
    let data;
    let error;
    try {
      data = JSON.parse(await response.text())[0].data;
    } catch (err) {
      error = new Error(
        `Error parsing response for this entity: ${JSON.stringify(entity)}`,
        {
          cause: {
            err: err instanceof Error ? err : new Error(String(err)),
            entity,
          },
        }
      );
    }
    callback(error, {
      entity,
      data: parseLocalityData(data)
        .flatMap(filterLocalityFields(localityFields))
        .reduce((line, [key, value]) => ({ ...line, [key]: value }), {}),
    });
  },
});
