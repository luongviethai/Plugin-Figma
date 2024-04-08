import { h as createEl } from "hastscript";
import { compact, isNumber } from "lodash";
import { processCharacters } from "./processCharacters";

export const generateHtml = async (node: SceneNode, level = 0, index?: number): any => {
	switch (node.type) {
		case "TEXT": {
			return createEl(
				"div",
				{
					className: `text text-${level} ${isNumber(index) ? `text-idx-${index}` : '' }`,
				},
				...processCharacters(node.characters)
			);
		}
		case "COMPONENT":
		case "COMPONENT_SET":
		case "INSTANCE":
		case "FRAME":
		case "GROUP":
			return createEl(
				"div",
				{
					className: `container container-${level} ${isNumber(index) ? `container-idx-${index}` : '' }`,
				},
				...compact(
					await Promise.all(node.children.map((child, index) => generateHtml(child, level + 1, index)))
				)
			);

		default:
			return undefined;
	}
};
