import { useState, useEffect, useRef } from "react";
import "./App.css";
import { toHtml } from "hast-util-to-html";
import "figma-plugin-ds/dist/figma-plugin-ds.css";
import Empty from "./components/Empty";
import Code from "./components/Code";

const TIME_DELAY = 2000;

function App() {
	const requestRef = useRef<number>(0);
	const startTimeRef = useRef<number>(0);
	const startCountRef = useRef(0);
	const [process, setProcess] = useState(0);
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
				handleCancel();
				const { selectionLength, preview } = msg.data;
				setSectionLength(selectionLength);
				preview && setUrl(convertToUrl(preview));
				setHTMLOutput("");
				setCSSOutput("");
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

	useEffect(() => {
		if (process >= TIME_DELAY) {
			startCountRef.current = 0;
			startTimeRef.current = 0;
			cancelAnimationFrame(requestRef.current);
		}
	}, [process]);

	const animateCount = (timestamp: number) => {
		if (!startTimeRef.current) {
			startTimeRef.current = timestamp;
		}
		const deltaTime = timestamp - startTimeRef.current;
		const progress = deltaTime / 1000; // divide by 1000 to convert milliseconds to seconds
		const nextCount = Math.round(startCountRef.current + progress * 99); // 99 is total steps implement for 1s
		setProcess(nextCount * 10);
		requestRef.current = requestAnimationFrame(animateCount);
	};

	const handleGenerateCode = () => {
		startCountRef.current = 0;
		startTimeRef.current = 0;
		requestRef.current = requestAnimationFrame(animateCount);
	};

	const handleSwapTab = (type: "preview" | "code") => {
		setTabSelected(type);
	};

	const handleCancel = () => {
		setProcess(0);
		startCountRef.current = 0;
		startTimeRef.current = 0;
		cancelAnimationFrame(requestRef.current);
	};

	const handleGoToCode = () => {
		setTabSelected("code");
		parent.postMessage({ pluginMessage: { type: "generate_code" } }, "*");
	};

	const renderButtonAction = () => {
		if (process >= TIME_DELAY)
			return (
				<button className="button button--primary" onClick={handleGoToCode}>
					Go to Code
				</button>
			);

		return process ? (
			<button
				className="button button--secondary button-cancel"
				onClick={handleCancel}
			>
				Cancel
			</button>
		) : (
			<button className="button button--primary" onClick={handleGenerateCode}>
				Generate Code
			</button>
		);
	};

	const renderTabPreview = () =>
		sectionLength > 0 ? (
			<div className="container-preview">
				<div className="wrapperImg">
					<img alt="Preview Selection" src={url} />
					{process > 0 && process < TIME_DELAY && (
						<>
							<div className="overlay-preview" />
							<div className="wrapper-progress-bar">
								<div
									className="progress-bar"
									style={{ width: `${(process / TIME_DELAY) * 100}%` }}
								/>
							</div>
						</>
					)}
				</div>
				<div className="button-generate">{renderButtonAction()}</div>
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
