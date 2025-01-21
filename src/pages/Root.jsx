import { open } from "@tauri-apps/plugin-dialog";
import { Command } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import Dropdown from "../components/Dropdown";

export default function Root() {
	const [path, setPath] = useState(null);
	const [form, setForm] = useState("mp4");

	async function sendAlert(body) {
		let permissionGranted = await isPermissionGranted();
		if (!permissionGranted) {
			const permission = await requestPermission();
			permissionGranted = permission === "granted";
		}
		if (permissionGranted) {
			sendNotification({
				title: "YTDT",
				body,
			});
		} else {
			console.error("Notification permission not granted.");
		}
	}
	async function handleSubmit(event) {
		event.preventDefault();
		const url = event.target.url.value;
		const format = event.target.format.value;
		const args = [url, path, format];
		if (url && format && path) {
			const command = Command.sidecar("binaries/script", args);
			const output = await command.execute();
			if (output.stdout.includes("successful")) sendAlert("Download complete!");
		}
	}
	return (
		<div className="bg-gradient-to-br bg-black from-black from-30% to-red-600/[15%] to-90% min-h-screen overflow-auto">
			<div className="flex flex-col justify-center items-center gap-10 mt-20">
				<img
					src="https://i.postimg.cc/vmhZCmZZ/Yoube.png"
					className="h-56 w-80"
				/>
				<h1 className="text-text-50 text-5xl font-bold mb-5">YTDT GUI</h1>
			</div>
			<form onSubmit={(e) => handleSubmit(e)}>
				<div className="mt-20 flex flex-col gap-10 justify-center items-center">
					<input
						required
						placeholder="Video URL"
						name="url"
						className="w-96 p-3 rounded-xl ring ring-secondary-600 placeholder:text-gray-400 bg-secondary-800"
					/>
					<div
						className="w-96 p-3 rounded-xl cursor-pointer ring ring-secondary-600 text-gray-400 bg-secondary-800"
						onClick={async () => {
							const dir = await open({
								multiple: false,
								directory: true,
							});
							setPath(dir);
						}}
					>
						{path ? path : "Download path"}
					</div>

					{form.value === "other" ? (
						<input
							required
							placeholder="File format (e.g., mp4)"
							name="format"
							className="w-96 p-3 rounded-xl ring ring-secondary-600 placeholder:text-gray-400 bg-secondary-800"
						/>
					) : (
						<Dropdown
							value={form}
							values={[
								{ name: "mp4", value: "mp4" },
								{ name: "mp3", value: "mp3" },
								{ name: "flac", value: "flac" },
								{ name: "gif", value: "gif" },
								{ name: "other..", value: "other" },
							]}
							onChange={(query) => setForm(query)}
							className="w-96 p-3 rounded-xl ring ring-secondary-600 text-gray-400 bg-secondary-800"
						/>
					)}
				</div>
				<div className="flex justify-center items-center mt-14">
					<button
						onClick={async () => await sendAlert("bwaaa")}
						className="p-3 rounded-xl bg-primary-700 ring ring-primary-500 text-text-50"
					>
						Download
					</button>
				</div>
			</form>
		</div>
	);
}
