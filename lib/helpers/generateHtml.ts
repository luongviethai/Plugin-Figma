import { h as createEl } from "hastscript";
import _ from "lodash";
import { processCharacters, imageToDataURL } from "./utils";
import { getClassName } from "./getClassName";
import * as svgParser from "svg-parser";
import { VectorLikeNodeChecker } from "../VectorLikeNodeChecker";

export const generateHtml = async (
	node: SceneNode,
	level = 0,
	levelParent?: number,
	index?: number
): any => {
	const vectorLikeNodeChecker = new VectorLikeNodeChecker();

	if (!node.visible) {
		// TODO: support visibility
		return undefined;
	}

	// ignore mask layers
	if ("isMask" in node && node.isMask) {
		return undefined;
	}

	// Image like node
	if (
		node.type == "RECTANGLE" &&
		node.fills !== figma.mixed &&
		node.fills.length
	) {
		const fill = node.fills[0];
		if (fill.type === "IMAGE" && fill.imageHash) {
			const image = figma.getImageByHash(fill.imageHash);
			const dataURL = image
				? imageToDataURL(await image.getBytesAsync())
				: undefined;

			return createEl("img", {
				src: dataURL,
			});
		}
	}

	if (vectorLikeNodeChecker.check(node)) {
		try {
			const svg = await node.exportAsync({ format: "SVG" });
			const svgText = String.fromCharCode(...svg);

			const root = svgParser.parse(svgText);
			const svgElem = root.children[0];
			if (svgElem.type !== "element") {
				throw new Error("Expected element type");
			}

			const properties = _.cloneDeep(svgElem.properties);
			_.omit(properties, ["xmlns"]);
			const cloneSvgElem = _.cloneDeep(svgElem);
			_.set(cloneSvgElem, "properties", properties);

			return cloneSvgElem;
		} catch (error) {
			console.error(`error exporting ${node.name} to SVG`);
			console.error(String(error));
		}
	}
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
				..._.compact(
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
