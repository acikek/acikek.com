import http from "http";
import fs from "fs";
import path from "path";

import moment from "moment"

const UPDATES_PLACEHOLDER = "<!--#UPDATES-->";

const homepage = fs.readFileSync("src/index.html");
const stylesheet = fs.readFileSync("src/style.css");

const updates = fs.readdirSync("updates")
	.map(filename => {
		const date = moment(path.basename(filename, ".html"));
		const content = fs.readFileSync(`updates/${filename}`);
		return [date, content];
	})
	.sort((a, b) => a[0].isBefore(b[0]) ? 1 : -1)
	.map(pair => `<div class="update"><h2>${pair[0].format("MMMM Do, YYYY")}</h2><p>${pair[1]}</p></div>`)
	.join("");

const index = homepage.toString().replace(UPDATES_PLACEHOLDER, updates);

const server = http.createServer((req, res) => {
	if (req.method !== null) {
		console.log(`${req.method} ${req.url}`);
	}
});

server.addListener("request", (req, res) => {
	if (req.url === "/") {
		res.writeHead(200, { "content-type": "text/html" });
		res.end(index);
	}
	else if (req.url === "/style.css") {
		res.writeHead(200, { "content-type": "text/css" });
		res.end(stylesheet);
	}
});

server.listen(8000);
