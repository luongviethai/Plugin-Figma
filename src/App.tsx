import { useState, useEffect } from "react";
import "./App.css";

function App() {
	const [sectionLength, setSectionLength] = useState(0);
	const [url, setUrl] = useState("");

	// const byteSectionPreview = selection.map((node) => {
	// 	const imageBytes = node.exportAsync({ format: "JPG" });
	// 	const imageURL = URL.createObjectURL(
	// 		new Blob([imageBytes], { type: "image/jpg" })
	// 	);
	// 	return imageURL;
	// });

	const convertToUrl = (node: any) => {
		const imageURL = URL.createObjectURL(
			new Blob([node], { type: "image/jpg" })
		);
		return imageURL;
	};

	useEffect(() => {
		const onWindowMessage = (e: MessageEvent) => {
			const msg = e.data.pluginMessage;
			if (msg.type === "loaded") {
				const { selectionLength, preview } = msg.data;
				setSectionLength(selectionLength);
				setUrl(convertToUrl(preview));
			}
		};

		window.addEventListener("message", onWindowMessage);
		parent.postMessage({ pluginMessage: { type: "ready" } }, "*");

		return () => {
			window.removeEventListener("message", onWindowMessage);
		};
	}, []);

	return (
		<>
			{sectionLength > 0 ? (
				<>
					<div>Has {sectionLength} component found in your section</div>
					<img src={url} width={300} height={300} />
				</>
			) : (
				<div>Not have section selected</div>
			)}
		</>
	);
}

export default App;
