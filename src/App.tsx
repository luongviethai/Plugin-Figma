import { useState } from "react";
import "./App.css";

function App() {
	const [count, setCount] = useState(5);

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCount(parseInt(e.target.value));
	};

	const handleCreate = () => {
		parent.postMessage(
			{ pluginMessage: { type: "create-rectangles", count } },
			"*"
		);
	};

	const handleCancel = () => {
		parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
	};

	return (
		<>
			<h2>Rectangle Creator</h2>
			<p>
				Count: <input id="count" value={count} onChange={handleOnChange} />
			</p>
			<button id="create" onClick={handleCreate}>
				Create
			</button>
			<button id="cancel" onClick={handleCancel}>
				Cancel
			</button>
		</>
	);
}

export default App;
