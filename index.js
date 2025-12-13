import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import moment from "moment"

// TODO: minify

function getUpdateHtml(date, text) {
	const heading = date.format("MMMM Do, YYYY");
	return `<div class="update"><h2>${heading}</h2><div>${text}</div></div>`;
}

function getUpdates() {
	return fs.readdirSync("updates")
		.map(filename => {
			const date = moment(path.basename(filename, ".html"));
			const content = fs.readFileSync(`updates/${filename}`);
			return [date, content];
		})
		.sort((a, b) => a[0].isBefore(b[0]) ? 1 : -1)
		.map(pair => getUpdateHtml(pair[0], pair[1]));
}

function getHomepage() {
	const rawPage = fs.readFileSync("templates/homepage.html");
	return rawPage.toString().replace("$updates", getUpdates().join("\n"));
}

const styles = Object.fromEntries(
	fs.readdirSync("styles")
		.map(filename => [filename, fs.readFileSync(`styles/${filename}`)])
);

const images = Object.fromEntries(
	fs.readdirSync("images")
		.map(filename => [filename, fs.readFileSync(`images/${filename}`)])
);

const homepage = getHomepage();

const server = http.createServer((req, res) => {
	if (req.method !== null) {
		console.log(`[${moment().format("HH:mm:ss")}] ${req.method} ${req.url}`);
	}
});

server.addListener("request", (req, res) => {
	if (req.url === null || req.method !== "GET") {
		return;
	}
	const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
	const args = url.pathname.split("/").slice(1).filter(arg => arg.length > 0);
	const path = args.join("/");
	console.log(args);
	if (path.endsWith(".css") && Object.hasOwn(styles, args.at(-1))) {
		res.writeHead(200, { "content-type": "text/css" });
		res.end(styles[args.at(-1)]);
		return;
	}
	if (path.endsWith(".svg") && Object.hasOwn(images, path)) {
		res.writeHead(200, { "content-type": "image/svg+xml" });
		res.end(images[path]);
		return;
	}
	if (path === "/") {
		res.writeHead(200, { "content-type": "text/html" });
		res.end(homepage);
		return;
	}
	if (path === "blog") {
		res.writeHead(200, { "content-type": "text/html" });
		res.end(fs.readFileSync("templates/blogpost.html"));
		return;
	}
});

server.listen(8000);
