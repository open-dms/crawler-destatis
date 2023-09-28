import HTMLParser from "node-html-parser";
import { Transform } from "node:stream";
import { Entity } from "./EntityStream";
import { endpoint } from "./config";

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

export const request = new Transform({
  objectMode: true,
  transform(entity: Entity<string>, _, callback) {
    const url = new URL(endpoint);
    const body = new URLSearchParams();
    body.append("mi_search", String(entity.data));
    body.append("form_id", "municipality_index_search");
    this.push(
      new Request(url, {
        method: "post",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        body,
      })
    );
    callback(null);
  },
});

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

export const response = new Transform({
  objectMode: true,
  transform: async (response: Response, _, callback) => {
    const { data } = JSON.parse(await response.text())[0];
    callback(
      null,
      parseLocalityData(data)
        .flatMap(filterLocalityFields(localityFields))
        .reduce((line, [key, value]) => ({ ...line, [key]: value }), {})
    );
  },
});
