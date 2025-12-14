import http from "node:http";
import fs from "node:fs";

import moment from "moment";
import colors from "yoctocolors";

import { getBlogPage, getBlogpostEntries } from "./src/blog.js";
import { getHomepage } from "./src/main-page.js";
import { getProjectsPage } from "./src/projects.js";

const style = fs.readFileSync("style.css");

const images = Object.fromEntries(
	fs.readdirSync("images")
		.map(filename => [filename, fs.readFileSync(`images/${filename}`)])
);

const tools = fs.readFileSync("tools.txt").toString().split("\n");

const homepage = getHomepage();
const projects = getProjectsPage();

const blogpostEntries = getBlogpostEntries();
const blog = getBlogPage(blogpostEntries);
const blogposts = Object.fromEntries(blogpostEntries);

const server = http.createServer();

function servePage(res, content) {
	res.writeHead(200, { "content-type": "text/html" });
	const tool = Math.random() > 0.25 ? "love" : tools[Math.floor(Math.random() * tools.length)];
	res.end(content.replace("$_tool", tool));
}

server.on("request", (req, res) => {
	if (req.url === null || req.method !== "GET") {
		return;
	}
	const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
	const args = url.pathname.split("/").slice(1).filter(arg => arg.length > 0);
	const path = args.join("/");
	const debugString = `(path: ${path || "empty"}, args: [${args.join(", ")}])`;
	console.log(`[${moment().format("HH:mm:ss")}] ${colors.green(req.method)} ${req.url} ${colors.gray(debugString)}`);
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
		servePage(res, homepage);
		return;
	}
	if (args[0] === "projects") {
		if (args.length == 1) {
			servePage(res, projects);
		}
	}
	if (args[0] === "blog") {
		if (args.length > 1 && Object.hasOwn(blogposts, args[1])) {
			servePage(res, blogposts[args[1]].page);
			return;
		}
		else if (args.length == 1) {
			servePage(res, blog);
			return;
		}
	}
});

server.listen(8000);
