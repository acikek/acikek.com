import fs from "node:fs";

export function getStyle() {
	return fs.readdirSync("styles")
		.map(filename => fs.readFileSync(`styles/${filename}`).toString())
		.join("\n");
}

export function getImages() {
	const entries = fs.readdirSync("images", { recursive: true, withFileTypes: true })
		.filter(dirent => dirent.isFile())
		.map(dirent => {
			const id = `${dirent.parentPath}/${dirent.name}`;
			return [id, fs.readFileSync(id)]
		});
	return Object.fromEntries(entries);
}

export function getTools() {
	return fs.readFileSync("tools.txt").toString().split("\n").filter(tool => tool.length > 0);
}
