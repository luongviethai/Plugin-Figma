import { h as createEl } from "hastscript";
import { compact } from "lodash";
import { processCharacters } from "./processCharacters";

export const generateHtml = async (node: SceneNode): any => {
	switch (node.type) {
		case "TEXT": {
			return createEl(
				"span",
				{
					className: "text",
				},
				...processCharacters(node.characters)
			);
		}
		case "COMPONENT":
		case "COMPONENT_SET":
		case "INSTANCE":
		case "FRAME":
			return createEl(
				"div",
				{
					className: "container",
				},
				...compact(
					await Promise.all(node.children.map((child) => generateHtml(child)))
				)
			);

		default:
			return undefined;
	}
};
