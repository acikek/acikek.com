import http from "node:http";
import fs from "node:fs";
import path from "node:path";

import moment from "moment"

// TODO: minify
// TODO: error handling
// TODO: reverse proxy
// TODO: better logging

function getUpdateHtml(date, content) {
	const heading = date.format("MMMM Do, YYYY");
	return `<div class="update"><h2>${heading}</h2><div>${content}</div></div>`;
}

function getUpdates() {
	return fs.readdirSync("updates")
		.map(filename => {
			const date = moment(path.basename(filename, ".html"));
			const content = fs.readFileSync(`updates/${filename}`);
			return { date, content };
		})
		.sort((a, b) => a.date.isBefore(b.date) ? 1 : -1)
		.map(update => getUpdateHtml(update.date, update.content));
}

function getBlogposts() {
	const template = fs.readFileSync("templates/blogpost.html").toString();
	const blogpostEntries = fs.readdirSync("blogposts")
		.map(filename => {
			const noExtension = path.basename(filename, ".html");
			const parts = noExtension.split("_", /*limit:*/ 2);
			const date = moment(parts[0]);
			const title = parts[1];
			const content = fs.readFileSync(`blogposts/${filename}`).toString();
			return { date, title, content };
		})
		.sort((a, b) => a.date.isBefore(b.date) ? 1 : -1)
		.map(blogpost => {
			const id = blogpost.title.toLowerCase().replace(" ", "-").replace(/[^0-9a-z\-]/g, "");
			const metadataString = /<!--(.*)-->/gm.exec(blogpost.content)?.[1];
			const metadata = metadataString ? JSON.parse(metadataString) : null;
			const page = template
				.replaceAll("$title", blogpost.title)
				.replace("$date", blogpost.date.format("MMMM Do, YYYY"))
				.replace("$content", blogpost.content)
				.replace("$summary", metadata?.summary ? `<summary>${metadata.summary}</summary>` : "");
			return [id, { page, metadata }];
		});
	return Object.fromEntries(blogpostEntries);
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
const projects = fs.readFileSync("templates/projects.html");
const blog = fs.readFileSync("templates/blog.html");
const blogposts = getBlogposts();

const server = http.createServer();

server.on("request", (req, res) => {
	if (req.url === null || req.method !== "GET") {
		return;
	}
	const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
	const args = url.pathname.split("/").slice(1).filter(arg => arg.length > 0);
	const path = args.join("/");
	console.log(`[${moment().format("HH:mm:ss")}] ${req.method} ${req.url} (path: ${path || "empty"}, args: [${args.join(", ")}])`);
	if (path.endsWith(".css") && Object.hasOwn(styles, args.at(-1))) {
		res.writeHead(200, { "content-type": "text/css" });
		res.end(styles[args.at(-1)]);
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
