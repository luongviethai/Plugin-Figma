figma.showUI(__html__, { width: 640, height: 480 });
 
async function getSection()  {
  const selection = figma.currentPage.selection;
  const messageToUI = {
    type: "loaded",
    data: {
      selection: selection.length,
    },
  };
  figma.ui.postMessage(messageToUI);
}

figma.ui.onmessage = async (msg: { type: string; count: number }) => {

  switch(msg.type) {
    case 'ready':
      await getSection();
      break;
  }


	// figma.closePlugin();
};


figma.on("selectionchange", getSection);
