import { compact } from "lodash";
import { generateHtml, generateCss } from "./helpers";

figma.showUI(__html__, { width: 640, height: 480 });

async function getSection() {
	const selection = figma.currentPage.selection;
	const messageToUI = {
		type: "loaded",
		data: {
			selectionLength: selection.length,
			preview: selection[0]
				? await selection[0].exportAsync({ format: "JPG" })
				: undefined,
		},
	};

	figma.ui.postMessage(messageToUI);
}

async function generateCode() {
	const selection = figma.currentPage.selection;
	const sizes = selection.map((node) => {
		if ("width" in node) {
			return {
				width: node.width,
				height: node.height,
			};
		}
		return {
			width: 0,
			height: 0,
		};
	});

	const macaronLayers = compact(
		await Promise.all(selection.map((node) => generateHtml(node)))
	);

  const macaronCss = generateCss(selection);

	const messageToUI = {
		type: "generate_code",
		data: {
			type: "root",
			children: macaronLayers,
      css: macaronCss
		},
		sizes,
	};

	figma.ui.postMessage(messageToUI);
}

figma.ui.onmessage = async (msg: { type: string; count: number }) => {
	switch (msg.type) {
		case "ready":
			await getSection();
			break;

		case "generate_code":
			await generateCode();
			break;
	}
};

figma.on("selectionchange", getSection);
