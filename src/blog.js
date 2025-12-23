import fs from "node:fs";
import path from "node:path";

import moment from "moment";

import templates from "./templates.js";
import { getMainHeader } from "./main-page.js";

async function getBlogpost(id, title, summary, dateString, content) {
	const header = templates.pages.blogpostHeader
		.replace("$title", title)
		.replace("$summary", summary ? `<summary>${summary}</summary>` : "")
		.replace("$date", dateString);
	const filled = content.replace("$signature", `<img class="red-img signature" src="/images/logo.svg">`);
	return await templates.getBasePage(`${title} - acikek's blog`, summary || "", `blog/${id}`, header, `<div class="blogpost">${filled}</div>`);
}

async function _getBlogpostData(filename, source) {

}

export async function getBlogpostData(source, filename) {
	const noExtension = path.basename(filename, ".html");
	const filenameParts = noExtension.split("_", 2);
	const title = filenameParts[1];
	const content = fs.readFileSync(`${source}/${filename}`).toString();
	const metadataString = /<!--(.*)-->/gm.exec(content)?.[1];
	const metadata = metadataString ? JSON.parse(metadataString) : {};
	const date = moment(filenameParts[0]);
	const dateString = date.format("MMMM Do, YYYY");
	const id = title.toLowerCase().replaceAll(" ", "-").replaceAll(/[^0-9a-z\-]/g, "");
	const page = await getBlogpost(id, title, metadata.summary, dateString, content);
	return { id, title, date, dateString, page, metadata, path: `${source}/${filename}` };
}

export async function getBlogpostEntries(source) {
	const data = await Promise.all(
		fs.readdirSync(source)
			.map(filename => getBlogpostData(source, filename))
	);
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
	return await templates.getBasePage("acikek's blog", "Blogposts written by acikek and friends.", "blog", getMainHeader(2), blogEntries.join(""));
}

export async function getPrivateKeyData(key) {
	const data = JSON.parse(fs.readFileSync("private-blogpost-keys.json"));
}
