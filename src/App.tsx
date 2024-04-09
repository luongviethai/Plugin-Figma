import { useState, useEffect } from "react";
import "./App.css";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import { toHtml } from "hast-util-to-html";
import "figma-plugin-ds/dist/figma-plugin-ds.css";

function App() {
	const [sectionLength, setSectionLength] = useState(0);
	const [isShowCode, setShowCode] = useState(false);
	const [url, setUrl] = useState("");
	const [htmlOutput, setHTMLOutput] = useState("");
	const [cssOutput, setCSSOutput] = useState("");

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
				const root = msg.data;
				const html = toHtml(root).replace("&#x27;", "'");
				setHTMLOutput(html);
				setCSSOutput(msg.data.css);
			}
		};

		window.addEventListener("message", onWindowMessage);
		parent.postMessage({ pluginMessage: { type: "ready" } }, "*");

		return () => {
			window.removeEventListener("message", onWindowMessage);
		};
	}, []);

	const handleGenerateCode = () => {
		setShowCode(true);
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
						<button
							className="button button--primary"
							onClick={handleGenerateCode}
						>
							Generate Code
						</button>
						{isShowCode && (
							<>
								<pre>
									<code
										style={{
											display: "block",
											padding: "1rem",
											whiteSpace: "pre-wrap",
											fontSize: "10px",
											background: "none",
											fontFamily:
												"ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
										}}
										dangerouslySetInnerHTML={{
											__html: Prism.highlight(
												htmlOutput,
												Prism.languages.jsx,
												"jsx"
											),
										}}
									/>
								</pre>
								{cssOutput}
							</>
						)}
					</>
				) : (
					<h3>Not have section selected</h3>
				)}
			</div>
		</div>
	);
}

export default App;
