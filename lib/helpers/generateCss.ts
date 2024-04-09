import _ from "lodash";
import { getClassName } from "./getClassName";

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

export const generateCssFrame = (node: FrameNode) => {
	const cssFrame: Record<string, string | number> = {
		width: `${node.width}px`,
		height: `${node.height}px`,
		gap: `${node.itemSpacing}px`,
		opacity: node.opacity,
	};

	if (node.minWidth) cssFrame["min-width"] = `${node.minWidth}px`;
	if (node.minHeight) cssFrame["min-height"] = `${node.minHeight}px`;
	if (node.maxWidth) cssFrame["max-width"] = `${node.maxWidth}px`;
	if (node.maxHeight) cssFrame["max-height"] = `${node.maxHeight}px`;
	if (node.paddingLeft) cssFrame["padding-left"] = `${node.paddingLeft}px`;
	if (node.paddingRight) cssFrame["padding-right"] = `${node.paddingRight}px`;
	if (node.paddingTop) cssFrame["padding-top"] = `${node.paddingTop}px`;
	if (node.paddingBottom)
		cssFrame["padding-bottom"] = `${node.paddingBottom}px`;
	if (node.cornerRadius && _.isNumber(node.cornerRadius))
		cssFrame["border-radius"] = `${node.cornerRadius}px`;
	if (node.topLeftRadius)
		cssFrame["border-top-left-radius"] = `${node.topLeftRadius}px`;
	if (node.topRightRadius)
		cssFrame["border-top-right-radius"] = `${node.topRightRadius}px`;
	if (node.bottomLeftRadius)
		cssFrame["border-bottom-left-radius"] = `${node.bottomLeftRadius}px`;
	if (node.bottomRightRadius)
		cssFrame["border-bottom-right-radius"] = `${node.bottomRightRadius}px`;

	if (node.layoutMode !== "NONE") {
		cssFrame.display = "flex";
		if (node.layoutMode === "VERTICAL") {
			cssFrame["flex-direction"] = "column";
		}
	}

	return cssFrame;
};

export const generateCss = (selection: readonly SceneNode[]): any => {
	const css = {};
	const getCssNode = async (
		node: SceneNode,
		level = 0,
		levelParent?: number,
		index?: number
	) => {
		switch (node.type) {
			case "TEXT": {
				const cssText = {
					["font-size"]: `${node.fontSize}px`,
					["font-family"]: `${node.fontName.family}, "${node.fontName.style}"`,
					["font-weight"]: node.fontWeight,
				};
				_.set(css, getClassName("text", level, levelParent, index), cssText);
				break;
			}

			case "COMPONENT":
			case "COMPONENT_SET":
			case "INSTANCE":
			case "FRAME": {
				_.set(
					css,
					getClassName("container", level, levelParent, index),
					generateCssFrame(node as FrameNode)
				);
				if (node.children) {
					await Promise.all(
						node.children.map((child, index) =>
							getCssNode(child, level + 1, level, index)
						)
					);
				}
				break;
			}

			case "GROUP":
				if (node.children) {
					await Promise.all(
						node.children.map((child, index) =>
							getCssNode(child, level + 1, level, index)
						)
					);
				}
				break;
			default:
				break;
		}
	};

	selection.forEach(async (node) => await getCssNode(node));

	return convertToCss(css);
};
