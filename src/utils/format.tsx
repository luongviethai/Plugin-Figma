import parserHtml from "prettier/parser-html";
import parserCss from "prettier/parser-postcss"
import prettier from "prettier/standalone";
import type { Options } from "prettier";

const commonOptions: Options = {
};

export function formatHTML(value: string): string {
	return prettier.format(value, {
		...commonOptions,
		parser: "html",
		plugins: [parserHtml],
	});
}


export function formatCSS(value: string): string {
	return prettier.format(value, {
		...commonOptions,
		parser: "css",
		plugins: [parserCss],
	});
}
