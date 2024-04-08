import _ from "lodash";

export const generateCss = async (
	node: SceneNode,
	level = 0,
	index?: number
): any => {
	// const css = {};
	switch (node.type) {
		case "TEXT":
			// _.set(css, "text", { ["align-items"]: "center" });
			return { text: { ["align-items"]: "flex-start" } };
		case "COMPONENT":
		case "COMPONENT_SET":
		case "INSTANCE":
		case "FRAME":
		case "GROUP":
			if (node.children) {
				await Promise.all(
					node.children.map((child, index) =>
						generateCss(child, level + 1, index)
					)
				);
			}

			return { container: { ["align-items"]: "flex-start" } };

		default:
			return undefined;
	}
};
