import { h as createEl } from "hastscript";
import { compact } from "lodash";
import { processCharacters } from "./processCharacters";
import { getClassName } from "./getClassName";

export const generateHtml = async (
	node: SceneNode,
	level = 0,
	levelParent?: number,
	index?: number
): any => {
	switch (node.type) {
		case "TEXT": {
			return createEl(
				"div",
				{
					className: getClassName("text", level, levelParent, index),
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
					className: getClassName("container", level, levelParent, index),
				},
				...compact(
					await Promise.all(
						node.children.map((child, index) =>
							generateHtml(child, level + 1, level, index)
						)
					)
				)
			);

		default:
			return undefined;
	}
};
