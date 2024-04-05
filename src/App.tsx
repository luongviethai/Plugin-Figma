import { useState, useEffect } from "react";
import "./App.css";

function App() {
	const [selectedSelection, setSelectedSection] = useState(false);

	useEffect(() => {
		const onWindowMessage = (e: MessageEvent) => {
			const msg = e.data.pluginMessage;
			if (msg.type === "loaded") {
				const { isHasSelectionSelected } = msg.data;
				setSelectedSection(isHasSelectionSelected);
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
			{selectedSelection ? (
				<div>Tim thay Selected Section</div>
			) : (
				<div>Khong tim thay Selected Section</div>
			)}
		</>
	);
}

export default App;
