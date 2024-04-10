import _ from "lodash";
import { getClassName } from "./getClassName";
import { solidPaintToHex } from "./utils";

function objectToCSS(selector: string, obj: Record<string, any>) {
	let cssString = selector + " {\n";
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			cssString += "  " + key + ": " + obj[key] + ";\n";
		}
	}
	cssString += "}\n";
	return cssString;
}

const convertToCss = (css: Record<string, Record<string, any>>) => {
	return _.join(
		_.map(css, (value, key) => objectToCSS(`.${key}`, value)),
		" "
	);
};

export const getCssNode = (node: FrameNode | TextNode) => {
	const css: Record<string, string | number> = {};
	if (node.width) {
		switch (node.layoutSizingHorizontal) {
			case "HUG":
				css.width = "100%";
				break;
			case "FIXED":
				css.width = `${node.width}px`;
				break;
			case "FILL":
				css.width = "auto";
				break;
			default:
				break;
		}
	}
	if (node.height) {
		switch (node.layoutSizingHorizontal) {
			case "HUG":
				css.height = "100%";
				break;
			case "FIXED":
				css.height = `${node.height}px`;
				break;
			case "FILL":
				css.height = "auto";
				break;
			default:
				break;
		}
	}
	if (node.opacity !== 1) css.opacity = 1;
	if ((node as FrameNode).itemSpacing)
		css.gap = `${(node as FrameNode).itemSpacing}px`;
	if (node.minWidth) css["min-width"] = `${node.minWidth}px`;
	if (node.minHeight) css["min-height"] = `${node.minHeight}px`;
	if (node.maxWidth) css["max-width"] = `${node.maxWidth}px`;
	if (node.maxHeight) css["max-height"] = `${node.maxHeight}px`;
	if (
		(node as FrameNode).paddingLeft ||
		(node as FrameNode).paddingRight ||
		(node as FrameNode).paddingTop ||
		(node as FrameNode).paddingBottom
	)
		css.padding = `${(node as FrameNode).paddingTop}px ${
			(node as FrameNode).paddingRight
		}px ${(node as FrameNode).paddingBottom}px ${
			(node as FrameNode).paddingLeft
		}px`;

	if (
		(node as FrameNode).cornerRadius &&
		_.isNumber((node as FrameNode).cornerRadius)
	)
		css["border-radius"] = `${(node as FrameNode).cornerRadius}px`;
	if ((node as FrameNode).topLeftRadius)
		css["border-top-left-radius"] = `${(node as FrameNode).topLeftRadius}px`;
	if ((node as FrameNode).topRightRadius)
		css["border-top-right-radius"] = `${(node as FrameNode).topRightRadius}px`;
	if ((node as FrameNode).bottomLeftRadius)
		css["border-bottom-left-radius"] = `${
			(node as FrameNode).bottomLeftRadius
		}px`;
	if ((node as FrameNode).bottomRightRadius)
		css["border-bottom-right-radius"] = `${
			(node as FrameNode).bottomRightRadius
		}px`;

	if (
		(node as FrameNode).layoutMode &&
		(node as FrameNode).layoutMode !== "NONE"
	) {
		css.display = "flex";
		if ((node as FrameNode).layoutMode === "VERTICAL") {
			css["flex-direction"] = "column";
		}
	}
	if ((node as TextNode).fontSize)
		css["font-size"] = `${(node as TextNode).fontSize}px`;
	if ((node as TextNode).fontName)
		css["font-family"] = `${(node as TextNode).fontName.family}, "${
			(node as TextNode).fontName.style
		}"`;
	if ((node as TextNode).fontWeight)
		css["font-weight"] = (node as TextNode).fontWeight;
	if ((node as TextNode).textAlignHorizontal)
		css["text-align"] = _.toLower((node as TextNode).textAlignHorizontal);

	if (!_.isEmpty(node.fills)) {
		if (node.type === "TEXT") {
			css.color = solidPaintToHex(node.fills[0]);
		} else {
			css["background-color"] = solidPaintToHex(node.fills[0]);
		}
	}

	return css;
};

export const generateCss = (selection: readonly SceneNode[]): any => {
	const css = {};
	const generateCssNode = async (
		node: SceneNode,
		level = 0,
		levelParent?: number,
		index?: number
	) => {
		switch (node.type) {
			case "TEXT": {
				_.set(
					css,
					getClassName("text", level, levelParent, index),
					getCssNode(node as TextNode)
				);
				break;
			}

			case "COMPONENT":
			case "COMPONENT_SET":
			case "INSTANCE":
			case "FRAME": {
				_.set(
					css,
					getClassName("container", level, levelParent, index),
					getCssNode(node as FrameNode)
				);
				if (node.children) {
					await Promise.all(
						node.children.map((child, index) =>
							generateCssNode(child, level + 1, level, index)
						)
					);
				}
				break;
			}

			case "GROUP":
				if (node.children) {
					await Promise.all(
						node.children.map((child, index) =>
							generateCssNode(child, level + 1, level, index)
						)
					);
				}
				break;
			default:
				break;
		}
	};

	selection.forEach(async (node) => await generateCssNode(node));

	return convertToCss(css);
};
