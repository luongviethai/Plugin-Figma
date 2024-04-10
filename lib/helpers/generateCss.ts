import _ from "lodash";
import { getClassName } from "./getClassName";
import { solidPaintToHex } from "./utils";

function objectToCSS(selector: string, obj: Record<string, string | number>) {
	let cssString = selector + " {\n";
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cssString += "  " + key + ": " + obj[key] + ";\n";
		}
	}
	cssString += "}\n";
	return cssString;
}

const convertToCss = (css: Record<string, Record<string, string | number>>) => {
	return _.join(
		_.map(css, (value, key) => objectToCSS(`.${key}`, value)),
		" "
	);
};

const convertBoxShadowCss = (effects: readonly Effect[]): string => {
	const getValidEffects = _.filter(_.cloneDeep(effects), effect => effect.visible && (effect.type === 'INNER_SHADOW' || effect.type === "DROP_SHADOW"));

	const boxShadowResult = _.reduce<Effect[], string[]>(getValidEffects, ((result, effect) => {
		result.push(`${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread} ${solidPaintToHex(effect)}`);
		return result;
	}), []);

	return _.join(boxShadowResult, ", "); 
}

export const getGeneralCssNode = (
	node: FrameNode | TextNode | ComponentSetNode | ComponentNode | InstanceNode
) => {
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
	if (!_.isEmpty(node.fills)) {
		if (node.type === "TEXT") {
			css.color = solidPaintToHex(node.fills[0]);
		} else {
			css["background-color"] = solidPaintToHex(node.fills[0]);
		}
	}
	if (node.minWidth) css["min-width"] = `${node.minWidth}px`;
	if (node.minHeight) css["min-height"] = `${node.minHeight}px`;
	if (node.maxWidth) css["max-width"] = `${node.maxWidth}px`;
	if (node.maxHeight) css["max-height"] = `${node.maxHeight}px`;
	if(node.strokes) {
		css['border-width'] = `${node.strokeWeight as number}px`;
		css['border-style'] = _.toLower(node.strokes[0].type);
		css['border-color'] = solidPaintToHex(node.strokes[0]);

	}
	if(node.effects) {
		const cloneEffects = _.cloneDeep(node.effects);
		const blurEffect = _.find(cloneEffects, effect => effect.type ==="LAYER_BLUR" && effect.visible);
		const backgroundBlurEffect = _.find(cloneEffects, effect => effect.type ==="BACKGROUND_BLUR" && effect.visible);


		if(convertBoxShadowCss(node.effects)) {
			css['box-shadow'] = convertBoxShadowCss(node.effects);
		}
		if(blurEffect) 
			css.filter = `blur(${blurEffect.radius}px)`;
		if(backgroundBlurEffect) 
			css['backdrop-filter'] = `blur(${backgroundBlurEffect.radius}px)`;
	}

	return css;
};

const getCssFrameNode = (
	node: FrameNode | ComponentSetNode | ComponentNode | InstanceNode
) => {
	const cloneGeneralCss = _.cloneDeep(getGeneralCssNode(node));
	if (node.cornerRadius && _.isNumber(node.cornerRadius))
		cloneGeneralCss["border-radius"] = `${node.cornerRadius}px`;

	if (node.itemSpacing) cloneGeneralCss.gap = `${node.itemSpacing}px`;

	if (node.layoutMode && node.layoutMode !== "NONE") {
		cloneGeneralCss.display = "flex";
		if (node.layoutMode === "VERTICAL") {
			cloneGeneralCss["flex-direction"] = "column";
		}
	}
	if (
		node.paddingLeft ||
		node.paddingRight ||
		node.paddingTop ||
		node.paddingBottom
	)
		cloneGeneralCss.padding = `${node.paddingTop}px ${node.paddingRight}px ${node.paddingBottom}px ${node.paddingLeft}px`;

	if (node.topLeftRadius)
		cloneGeneralCss["border-top-left-radius"] = `${node.topLeftRadius}px`;
	if (node.topRightRadius)
		cloneGeneralCss["border-top-right-radius"] = `${node.topRightRadius}px`;
	if (node.bottomLeftRadius)
		cloneGeneralCss["border-bottom-left-radius"] = `${node.bottomLeftRadius}px`;
	if (node.bottomRightRadius)
		cloneGeneralCss[
			"border-bottom-right-radius"
		] = `${node.bottomRightRadius}px`;

	return cloneGeneralCss;
};

const getCssTextNode = (node: TextNode) => {
	const cloneGeneralCss = _.cloneDeep(getGeneralCssNode(node));
	if (node.fontSize)
		cloneGeneralCss["font-size"] = `${node.fontSize as number}px`;
	if (node.fontName)
		cloneGeneralCss[
			"font-family"
		] = `${node.fontName.family}, "${node.fontName.style}"`;
	if (node.fontWeight)
		cloneGeneralCss["font-weight"] = node.fontWeight as number;
	if (node.textAlignHorizontal)
		cloneGeneralCss["text-align"] = _.toLower(node.textAlignHorizontal);
	if (node.textAlignVertical)
		cloneGeneralCss["vertical-align"] = _.toLower(node.textAlignVertical);

	return cloneGeneralCss;
};

export const generateCss = (selection: readonly SceneNode[]): string => {
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
					getCssTextNode(node)
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
					getCssFrameNode(node)
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
