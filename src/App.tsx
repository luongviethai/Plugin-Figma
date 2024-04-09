import { useState, useEffect } from "react";
import "./App.css";
import { toHtml } from "hast-util-to-html";
import "figma-plugin-ds/dist/figma-plugin-ds.css";
import Empty from "./components/Empty";
import Code from "./components/Code";

function App() {
	const [sectionLength, setSectionLength] = useState(0);
	const [url, setUrl] = useState("");
	const [htmlOutput, setHTMLOutput] = useState("");
	const [cssOutput, setCSSOutput] = useState("");
	const [tabSelected, setTabSelected] = useState<"preview" | "code">("preview");

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
		setTabSelected("code");
		parent.postMessage({ pluginMessage: { type: "generate_code" } }, "*");
	};

	const handleSwapTab = (type: "preview" | "code") => {
		setTabSelected(type);
	};

	const renderTabPreview = () =>
		sectionLength > 0 ? (
			<div className="container-preview">
				<div className="wrapperImg">
					<img alt="Preview Selection" src={url} />
				</div>
				<div className="button-generate">
					<button
						className="button button--primary"
						onClick={handleGenerateCode}
					>
						Generate Code
					</button>
				</div>
			</div>
		) : (
			<Empty />
		);

	return (
		<div className="root">
			<div className="tab-trip">
				<div
					className={`tab-item tab-preview ${
						tabSelected === "preview" ? "tab-selected" : ""
					}`}
					onClick={() => handleSwapTab("preview")}
				>
					Preview
				</div>
				<div
					className={`tab-item tab-code ${
						tabSelected === "code" ? "tab-selected" : ""
					}`}
					onClick={() => handleSwapTab("code")}
				>
					Code
				</div>
			</div>

			{tabSelected === "preview" ? (
				renderTabPreview()
			) : (
				<Code htmlOutput={htmlOutput} cssOutput={cssOutput} />
			)}
		</div>
	);
}

export default App;
