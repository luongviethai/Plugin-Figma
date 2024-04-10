import { compact } from "lodash";
import { generateHtml, generateCss } from "./helpers";

figma.showUI(__html__, { width: 340, height: 404 });

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
	const macaronLayers = compact(
		await Promise.all(selection.map((node) => generateHtml(node)))
	);

	const macaronCss = generateCss(selection);

	const messageToUI = {
		type: "generate_code",
		data: {
			type: "root",
			children: macaronLayers,
			css: macaronCss,
		},
	};

	figma.ui.postMessage(messageToUI);
}

figma.ui.onmessage = async (msg) => {
	switch (msg.type) {
		case "ready":
			await getSection();
			break;

		case "generate_code":
			await generateCode();
			break;

		case "notify":
			figma.notify(msg.data);
			break;
	}
};

figma.on("selectionchange", getSection);
