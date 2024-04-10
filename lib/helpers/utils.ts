import { Buffer } from "buffer";
import { h } from "hastscript";

const lineBreakRegExp = /\r\n|[\n\r\u2028\u2029\u0085]/;

export function imageToDataURL(data: Uint8Array): string | undefined {
	if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e) {
		const base64 = Buffer.from(data).toString("base64");
		return "data:image/png;base64," + base64;
	} else if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
		const base64 = Buffer.from(data).toString("base64");
		return "data:image/jpeg;base64," + base64;
	} else {
		return undefined;
	}
}

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
