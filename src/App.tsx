import { useState, useEffect } from "react";
import "./App.css";

function App() {
	const [sectionLength, setSectionLength] = useState(0);

	useEffect(() => {
		const onWindowMessage = (e: MessageEvent) => {
			const msg = e.data.pluginMessage;
			if (msg.type === "loaded") {
				const { selection } = msg.data;
				setSectionLength(selection);
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
				<div>Has {sectionLength} component found in your section</div>
			) : (
				<div>Not have section selected</div>
			)}
		</>
	);
}

export default App;
