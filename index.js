import http from "node:http";
import fs from "node:fs"

import mime from "mime-types";
import moment from "moment";
import colors from "yoctocolors";

import { getBlogPage, getBlogpostEntries } from "./src/blog.js";
import { getHomepage } from "./src/main-page.js";
import { getProjectsPage } from "./src/projects.js";
import templates from "./src/templates.js";
import { getImages, getStyle, getTools } from "./src/files.js";

const PRIVATE_BLOGPOST_LIFETIME = 2 * 24 * 60 * 60 * 1000;

const style = getStyle();
const images = getImages();
const tools = getTools();

const homepage = await getHomepage();
const projects = await getProjectsPage();

const blogpostEntries = await getBlogpostEntries("blogposts");
const privateBlogposts = Object.fromEntries(await getBlogpostEntries("private-blogposts"));
const blog = await getBlogPage(blogpostEntries);
const blogposts = Object.fromEntries(blogpostEntries);

const error404 = await templates.getErrorPage(404);

const server = http.createServer();
const allowedMethods = ["GET", "HEAD", "OPTIONS"]; // TODO: OPTION and HEAD requests

function servePage(res, content) {
	res.writeHead(200, { "content-type": "text/html" });
	const tool = Math.random() > 0.25 ? "love" : tools[Math.floor(Math.random() * tools.length)];
	res.end(content.replace("$_tool", tool));
}

function tryServePrivateBlogpost(res, args) {
	if (!fs.existsSync("private-blogpost-keys.json")) {
		return false;
	}
	const keysFile = fs.readFileSync("private-blogpost-keys.json");
	try {
		const keys = JSON.parse(keysFile.toString());
		if (!(args[2] in keys)) {
			return false;
		}
		const keyData = keys[args[2]];
		if (!("id" in keyData) || keyData.id !== args[1] || !Object.hasOwn(privateBlogposts, args[1])) {
			return false;
		}
		const withinLifetime = keyData.createdAt !== undefined
			&& moment().diff(moment.unix(keyData.createdAt)) < PRIVATE_BLOGPOST_LIFETIME;
		delete keys[args[2]];
		fs.writeFileSync("private-blogpost-keys.json", JSON.stringify(keys, null, 4));
		if (!withinLifetime) {
			return false;
		}
		servePage(res, privateBlogposts[args[1]].page);
		return true;
	}
	catch (e) {
		console.error(e);
		return false;
	}
}

server.on("request", (req, res) => {
	if (!req.url || !req.method) {
		return;
	}
	const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
	const args = url.pathname.split("/").slice(1).filter(arg => arg.length > 0);
	const path = args.join("/");
	const debugString = `(path: ${path || "empty"}, args: [${args.join(", ")}])`;
	console.log(`[${moment().format("HH:mm:ss")}] ${colors.green(req.method)} ${req.url} ${colors.gray(debugString)}`);
	if (!allowedMethods.includes(req.method)) {
		res.writeHead(405, { "allow": allowedMethods });
		res.end();
		return;
	}
	if (path === "style.css") {
		res.writeHead(200, { "content-type": "text/css", "cache-control": "public, max-age=31536000, immutable" });
		res.end(style);
		return;
	}
	if (args.length == 0) {
		servePage(res, homepage);
		return;
	}
	if (args[0] === "projects") {
		if (args.length == 1) {
			servePage(res, projects);
			return;
		}
	}
	if (args[0] === "blog") {
		if (args.length == 3 && Object.hasOwn(privateBlogposts, args[1])) {
			if (tryServePrivateBlogpost(res, args)) {
				return;
			}
		}
		else if (args.length == 2 && Object.hasOwn(blogposts, args[1])) {
			servePage(res, blogposts[args[1]].page);
			return;
		}
		else if (args.length == 1) {
			servePage(res, blog);
			return;
		}
	}
	if (Object.hasOwn(images, path)) {
		res.writeHead(200, { "content-type": mime.lookup(path), "cache-control": "public, max-age=31536000, immutable" });
		res.end(images[path]);
		return;
	}
	res.writeHead(404, { "content-type": "text/html" });
	res.end(error404);
});

server.listen(8000);
