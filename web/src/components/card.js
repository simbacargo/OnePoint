import { React } from "react";

// Tailwind CSS card component
export default function Card(props) {
	return (
		<div className="bg-white shadow-md rounded-lg p-0">
			<div className="body">{props.children}</div>
		</div>
	);
}

