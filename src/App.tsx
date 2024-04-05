import { useState, useEffect } from "react";
import "./App.css";

function App() {
	const [sectionLength, setSectionLength] = useState(0);
	const [url, setUrl] = useState("");

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
				preview && setUrl(convertToUrl(preview));
			}
			if (msg.type === "generate_code") {
				console.log("msg", msg.data);
			}
		};

		window.addEventListener("message", onWindowMessage);
		parent.postMessage({ pluginMessage: { type: "ready" } }, "*");

		return () => {
			window.removeEventListener("message", onWindowMessage);
		};
	}, []);

	const handleGenerateCode = () => {
		parent.postMessage({ pluginMessage: { type: "generate_code" } }, "*");
	};

	return (
		<div className="root">
			<div className="wrapperSection">
				{sectionLength > 0 ? (
					<>
						<h3>Has {sectionLength} component found in your section</h3>
						<div className="wrapperImg">
							<img alt="Preview Selection" src={url} />
						</div>
						<button onClick={handleGenerateCode}>Generate Code</button>
					</>
				) : (
					<h3>Not have section selected</h3>
				)}
			</div>
		</div>
	);
}

export default App;
