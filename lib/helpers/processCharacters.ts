import { h } from "hastscript";

const lineBreakRegExp = /\r\n|[\n\r\u2028\u2029\u0085]/;

export function processCharacters(characters: string): any {
  const lines = characters.split(lineBreakRegExp);
  const results = [];
  for (let i = 0; i < lines.length; ++i) {
    if (i !== 0) {
      results.push(h("br"));
    }
    results.push({
      type: "text",
      value: lines[i],
    });
  }
  return results;
}