import { h as createEl } from "hastscript";
import { compact, isNumber, trim } from "lodash";
import { processCharacters } from "./processCharacters";

export const generateHtml = async (node: SceneNode, level = 0, levelParent?: number, index?: number): any => {
	switch (node.type) {
		case "TEXT": {
			return createEl(
				"div",
				{
					className: `text ${trim(`text-${isNumber(levelParent) ? levelParent : ''}-${isNumber(level) ? level : ''}-${isNumber(index) ? index : ''}`)}`,
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
					className: `container ${trim(`container-${isNumber(levelParent) ? levelParent : ''}-${isNumber(level) ? level : ''}-${isNumber(index) ? index : ''}`)}`,
				},
				...compact(
					await Promise.all(node.children.map((child, index) => generateHtml(child, level + 1, level, index)))
				)
			);

		default:
			return undefined;
	}
};
