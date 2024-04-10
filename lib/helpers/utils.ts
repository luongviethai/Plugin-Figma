import { Buffer } from "buffer";
import { h } from "hastscript";
import _ from "lodash";

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

export function solidPaintToHex(solidPaint: SolidPaint): string {
	const cloneSolidPaint:RGB | RGBA = _.cloneDeep(solidPaint.color);
	_.set(cloneSolidPaint, ["a"], solidPaint.opacity || 1);
	return rgbaToHex(cloneSolidPaint as RGBA);
}

export function rgbaToHex(rgba: RGBA): string {
	const { r, g, b, a } = rgba;
	return (
		"#" +
		(a === 1 ? [r, g, b] : [r, g, b, a])
			.map((c) => {
				const str = Math.round(c * 255)
					.toString(16)
					.toUpperCase();
				return str.length === 1 ? "0" + str : str;
			})
			.join("")
	);
}
