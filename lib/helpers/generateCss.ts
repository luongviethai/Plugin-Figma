import _ from "lodash";


function objectToCSS(selector, obj) {
	let cssString = selector + " {\n";
	for (const key in obj) {
	  if (obj.hasOwnProperty(key)) {
		cssString += "  " + key + ": " + obj[key] + ";\n";
	  }
	}
	cssString += "}\n";
	return cssString;
  }

export const convertToCss = (css: Record<string, Record<string, any>>) => {
  const abc = _.map(css, (value, key) => objectToCSS(`.${key}`, value));

  return _.join(abc, " ");
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
      case "TEXT":
        const cssText = {
          fontSize: `${node.fontSize}px`,
          fontFamily: `${node.fontName.family}, "${node.fontName.style}"`,
          fontWeight: node.fontWeight,
        };
        _.set(
          css,
          `${_.trim(
            `text-${_.isNumber(levelParent) ? levelParent : ""}-${
              _.isNumber(level) ? level : ""
            }-${_.isNumber(index) ? index : ""}`
          )}`,
          cssText
        );
        break;
      case "COMPONENT":
      case "COMPONENT_SET":
      case "INSTANCE":
      case "FRAME":
      case "GROUP":
        _.set(
          css,
          `${_.trim(
            `container-${_.isNumber(levelParent) ? levelParent : ""}-${
              _.isNumber(level) ? level : ""
            }-${_.isNumber(index) ? index : ""}`
          )}`,
          { display: "block" }
        );

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
