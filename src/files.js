import fs from "node:fs";
import path from "node:path";

import CleanCSS from "clean-css";

export function getStyle() {
	const combined = fs.readdirSync("styles")
		.map(filename => fs.readFileSync(`styles/${filename}`).toString())
		.join("\n");
	return new CleanCSS().minify(combined).styles;
}

export function getImages() {
	const entries = fs.readdirSync("images", { recursive: true, withFileTypes: true })
		.filter(dirent => dirent.isFile())
		.map(dirent => {
			const id = `${dirent.parentPath.replaceAll(path.sep, "/")}/${dirent.name}`;
			return [id, fs.readFileSync(id)]
		});
	return Object.fromEntries(entries);
}

export function getTools() {
	return fs.readFileSync("tools.txt").toString()
		.split("\n")
		.map(tool => tool.trim())
		.filter(tool => tool.length > 0);
}
