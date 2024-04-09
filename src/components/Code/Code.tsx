import { useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "./Code.css";
import copy from "copy-to-clipboard";

type CodeProps = {
	htmlOutput: string;
	cssOutput: string;
};

function Code(props: CodeProps) {
	const { htmlOutput, cssOutput } = props;
	const [value, setValue] = useState("html");

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setValue(e.target.value);
	};

	const handleCopy = () => {
		copy(value === "html" ? htmlOutput : cssOutput);
		parent.postMessage(
			{
				pluginMessage: {
					type: "notify",
					data: "Copied to clipboard",
				},
			},
			"*"
		);
	};

	return (
		<div className="container-code">
			<div className="wrapper-select">
				<select value={value} onChange={handleChange}>
					<option value="html">HTML</option>
					<option value="css">CSS</option>
				</select>
			</div>
			{value === "html" ? (
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
							__html: Prism.highlight(htmlOutput, Prism.languages.jsx, "jsx"),
						}}
					/>
				</pre>
			) : (
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
							__html: Prism.highlight(cssOutput, Prism.languages.jsx, "jsx"),
						}}
					/>
				</pre>
			)}
			<div className="wrapper-button-copy">
				<button
					disabled={!htmlOutput && !cssOutput}
					className="button button--secondary"
					onClick={handleCopy}
				>
					Copy
				</button>
			</div>
		</div>
	);
}

export default Code;
