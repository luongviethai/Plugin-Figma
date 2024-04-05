figma.showUI(__html__, { width: 640, height: 480 });

figma.ui.onmessage = (msg: { type: string; count: number }) => {

	if (msg.type === "ready") {
		const selection = figma.currentPage.selection;
		const messageToUI = {
			type: "loaded",
			data: {
				isHasSelectionSelected: selection.length > 0,
			},
		};
		figma.ui.postMessage(messageToUI);
	}

	// figma.closePlugin();
};
