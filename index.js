import http from "node:http";
import fs from "node:fs";

import moment from "moment";

import { getBlogPage, getBlogpostEntries } from "./src/blog.js";
import templates from "./src/templates.js";
import { getHomepage } from "./src/main-page.js";

const style = fs.readFileSync("style.css");

const images = Object.fromEntries(
	fs.readdirSync("images")
		.map(filename => [filename, fs.readFileSync(`images/${filename}`)])
);

const homepage = getHomepage();
const projects = templates.pages.base;

const blogpostEntries = getBlogpostEntries();
const blog = getBlogPage(blogpostEntries);
const blogposts = Object.fromEntries(blogpostEntries);

const server = http.createServer();

server.on("request", (req, res) => {
	if (req.url === null || req.method !== "GET") {
		return;
	}
	const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
	const args = url.pathname.split("/").slice(1).filter(arg => arg.length > 0);
	const path = args.join("/");
	console.log(`[${moment().format("HH:mm:ss")}] ${req.method} ${req.url} (path: ${path || "empty"}, args: [${args.join(", ")}])`);
	if (path === "style.css") {
		res.writeHead(200, { "content-type": "text/css" });
		res.end(style);
		return;
	}
	if (path.endsWith(".svg") && Object.hasOwn(images, args.at(-1))) {
		res.writeHead(200, { "content-type": "image/svg+xml" });
		res.end(images[args.at(-1)]);
		return;
	}
	if (args.length == 0) {
		res.writeHead(200, { "content-type": "text/html" });
		res.end(homepage);
		return;
	}
	if (args[0] === "projects") {
		if (args.length == 1) {
			res.writeHead(200, { "content-type": "text/html" });
			res.end(projects);
		}
	}
	if (args[0] === "blog") {
		if (args.length > 1 && Object.hasOwn(blogposts, args[1])) {
			res.writeHead(200, { "content-type": "text/html" });
			res.end(blogposts[args[1]].page);
			return;
		}
		else if (args.length == 1) {
			res.writeHead(200, { "content-type": "text/html" });
			res.end(blog);
			return;
		}
	}
});

server.listen(8000);
