import fs from "node:fs";
import path from "node:path";

import moment from "moment";

import templates from "./templates.js";
import { getMainHeader } from "./main-page.js";

async function getBlogpost(title, summary, dateString, content) {
	const header = templates.pages.blogpostHeader
		.replace("$title", title)
		.replace("$summary", summary ? `<summary>${summary}</summary>` : "")
		.replace("$date", dateString);
	const filled = content.replace("$signature", `<img class="red-img signature" src="/images/logo.svg">`);
	return await templates.getBasePage(`${title} - acikek's blog`, header, `<div class="blogpost">${filled}</div>`);
}

export async function getBlogpostData(filename) {
	const noExtension = path.basename(filename, ".html");
	const filenameParts = noExtension.split("_", 2);
	const title = filenameParts[1];
	const content = fs.readFileSync(`blogposts/${filename}`).toString();
	const metadataString = /<!--(.*)-->/gm.exec(content)?.[1];
	const metadata = metadataString ? JSON.parse(metadataString) : {};
	const date = moment(filenameParts[0]);
	const dateString = date.format("MMMM Do, YYYY");
	const id = title.toLowerCase().replaceAll(" ", "-").replaceAll(/[^0-9a-z\-]/g, "");
	const page = await getBlogpost(title, metadata.summary, dateString, content);
	return { id, title, date, dateString, page, metadata };
}

export async function getBlogpostEntries() {
	const data = await Promise.all(fs.readdirSync("blogposts").map(getBlogpostData));
	return data
		.sort((a, b) => a.date.isBefore(b.date) ? 1 : -1)
		.map(post => [post.id, post]);
}

function getBlogEntryThumbnail(id, path) {
	return templates.components.blogEntryThumbnail
		.replace("$id", id)
		.replace("$path", path);
}

function getBlogEntry(thumbnail, id, title, dateString, summary) {
	return templates.components.blogEntry
		.replace("$thumbnail", thumbnail)
		.replace("$id", id)
		.replace("$title", title)
		.replace("$date", dateString)
		.replace("$summary", summary);
}

export async function getBlogPage(blogpostEntries) {
	const blogEntries = blogpostEntries.map(pair => {
		const [id, post] = pair;
		const thumbnail = post.metadata.thumbnail ? getBlogEntryThumbnail(id, post.metadata.thumbnail) : `<div class="blog-entry-thumbnail-empty"></div>`;
		const summary = post.metadata.summary ? `<span style="color: var(--gray)">•</span> <span>${post.metadata.summary}</span>` : "";
		return getBlogEntry(thumbnail, id, post.title, post.dateString, summary);
	});
	return await templates.getBasePage("acikek's blog", getMainHeader(2), blogEntries.join(""));
}
