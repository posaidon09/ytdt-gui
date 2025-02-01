import { open } from "@tauri-apps/plugin-dialog";
import { Command } from "@tauri-apps/plugin-shell";
import { useContext, useState } from "react";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import Dropdown from "../components/Dropdown";
import { context } from "./../lib/Context";
import langs from "./../langs.json";

export default function Root() {
	const [path, setPath] = useState(null);
	const [form, setForm] = useState("mp4");
    const { lang, setLang } = useContext(context);

    const [progress, setProgress] = useState({
        stage: "waiting",
        percentage: 0
    });

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
		const format = event?.target?.format?.value ?? form.value;
		const args = [url, path, format];

            if (url && format && path) {
                const command = Command.sidecar("binaries/downloaderScript", args);
                const interval = setInterval(async () => {
                    try {
                        const req = await fetch("http://localhost:5100");
                        const res = await req.json();
                        setProgress(res);
                        if (res.stage === "done") {
                            setProgress({
                                stage: "done",
                                percentage: 100
                            });
                            clearInterval(interval)
                            setTimeout(() => {
                        setProgress({
                            stage: "waiting",
                            percentage: 0
                        });
                    }, 2000);
                        };
                    } catch (e) {
                        console.error(e);
                    }
                }, 200);
                const output = await command.execute();
                command.on('close', () => {
                    setProgress({
                        stage: "done",
                        percentage: 100
                    })
                    clearInterval(interval)
                    setTimeout(() => {
                        setProgress({
                            stage: "waiting",
                            percentage: 0
                        });
                    }, 2000);

                });
                if (output.stdout) sendAlert(langs[lang].finished);
            }
	}

	return (
		<div className="bg-gray-900 min-h-screen overflow-auto">
			<div className="flex flex-col justify-center items-center gap-10 mt-20">
        <div className="absolute left-10 top-10">
            <Dropdown
                value={lang}
                values={[
                    { name: "English", value: "English" },
                    { name: "Français", value: "Français" },
                    { name: "العربية", value: "العربية" },
                ]}
                onChange={(query) => setLang(query.value)}
                label={`Language: ${lang}`}
                className="w-52 p-3 rounded-xl ring ring-accent-600 text-gray-300 bg-primary-800"
            />
        </div>
				<img
					src="https://i.postimg.cc/vmhZCmZZ/Yoube.png"
					className="h-56 w-80"
				/>
				<h1 className="text-text-50 text-5xl font-bold mb-5">YTDT</h1>
			</div>
			<form onSubmit={(e) => handleSubmit(e)}>
				<div className="mt-20 flex flex-col gap-10 justify-center items-center">
					<input
						required
						placeholder={langs[lang].url}
						name="url"
						className="w-96 p-3 rounded-xl ring ring-secondary-600 text-gray-300 placeholder:text-gray-300 bg-secondary-800"
					/>
					<div
						className="w-96 p-3 rounded-xl cursor-pointer ring ring-secondary-600 text-gray-300 bg-secondary-800"
						onClick={async () => {
							const dir = await open({
								multiple: false,
								directory: true,
							});
							setPath(dir);
						}}
					>
						{path ? path : langs[lang].path}
					</div>

					{form?.value === langs[lang].ext ? (
						<input
							required
							placeholder={`${langs[lang].format} (e.g., mp4)`}
							name="format"
							className="w-96 p-3 rounded-xl text-gray-300 ring ring-secondary-600 placeholder:text-gray-400 bg-secondary-800"
						/>
					) : (
						<Dropdown
							value={form}
							values={[
								{ name: "mp4", value: "mp4" },
								{ name: "mp3", value: "mp3" },
								{ name: "flac", value: "flac" },
								{ name: "gif", value: "gif" },
								{ name: "other..", value: langs[lang].other },
							]}
							onChange={(query) => setForm(query)}
                            label={`${langs[lang].format} (eg: mp4)`}
							className="w-96 p-3 rounded-xl ring ring-secondary-600 text-gray-300 bg-secondary-800"
						/>
					)}
				</div>
				<div className="flex flex-col justify-center items-center mt-14">
                    { langs[lang].stage[progress.stage] == langs[lang].stage.waiting ?
                        ""
                        :
                    (
                        <div className="flex flex-row gap-5">
                            <p className="text-text-50 text-lg">{langs[lang].downloading} {langs[lang].stage[progress.stage]}:</p>
                            <div class="bg-secondary-900 rounded-xl shadow-sm overflow-hidden p-1">
                            <div class="relative h-6 flex items-center justify-center w-96">
                                <div className="absolute top-0 bottom-0 left-0 rounded-lg bg-green-400" style={{ width: `${Math.floor(progress.percentage)}%` }}></div>
                                <div class={`relative transition-all duration-300 ${Math.floor(progress.percentage) < 50 ? "text-white" : "text-black"} font-medium text-sm`}>{progress.percentage}%</div>
                            </div>
                            </div>
                        </div>
                    )}
					<button
						type="submit"
						className="p-3 mt-5 rounded-xl bg-primary-700 ring ring-primary-500 text-text-50"
					>
                        {langs[lang].download}
					</button>
        				</div>
			</form>
		</div>
	);
}
