import fs from "node:fs";
import path from "node:path";

import moment from "moment";

import templates from "./templates.js";
import { getMainHeader } from "./main-page.js";

export const PRIVATE_KEYS_PATH = "private-blogpost-keys.json";
const PRIVATE_BLOGPOST_LIFETIME = 2 * 24 * 60 * 60 * 1000;
const SIGNATURE = `<img class="red-img signature" src="/images/logo.svg">`;

async function getBlogpost(id, title, author, summary, dateString, notice, content) {
	const header = templates.pages.blogpostHeader
		.replace("$title", title)
		.replace("$author", author)
		.replace("$summary", summary ? `<summary>${summary}</summary>` : "")
		.replace("$date", dateString);
	const postContents = content.replace("$signature", SIGNATURE);
	const noticeSpan = ""; //notice !== null ? `<span class="blogpost-notice">${notice}</span > ` : "";
	const page = `${noticeSpan} <div class="blogpost">${postContents}</div>`;
	return await templates.getBasePage(`${title} - acikek's blog`, summary || "", `blog/${id}`, header, page);
}

export async function getBlogpostData(source, filename) {
	const noExtension = path.basename(filename, ".html");
	const filenameParts = noExtension.split("_", 2);
	const title = filenameParts[1];
	const content = fs.readFileSync(`${source}/${filename}`).toString();
	const metadataString = /<!--(.*)-->/gm.exec(content)?.[1];
	const metadata = metadataString ? JSON.parse(metadataString) : {};
	const author = metadata.author || "acikek";
	const date = moment(filenameParts[0]);
	const dateString = date.format("MMMM Do, YYYY");
	const id = title.toLowerCase().replaceAll(" ", "-").replaceAll(/[^0-9a-z\-]/g, "");
	const notice = source === "private-blogposts" ? "This is a private blogpost—for your eyes only." : null;
	const page = await getBlogpost(id, title, author, metadata.summary, dateString, notice, content);
	return { id, title, author, date, dateString, page, metadata, path: `${source}/${filename}` };
}

export async function getBlogpostEntries(source) {
	if (!fs.existsSync(source)) {
		return [];
	}
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

function getBlogEntry(thumbnail, id, title, author, dateString, summary) {
	return templates.components.blogEntry
		.replace("$thumbnail", thumbnail)
		.replace("$id", id)
		.replace("$title", title)
		.replace("$author", author)
		.replace("$date", dateString)
		.replace("$summary", summary);
}

export async function getBlogPage(blogpostEntries) {
	const blogEntries = blogpostEntries.map(pair => {
		const [id, post] = pair;
		const thumbnail = post.metadata.thumbnail ? getBlogEntryThumbnail(id, post.metadata.thumbnail) : `<div class="blog-entry-thumbnail-empty"></div>`;
		const author = post.metadata.author ? `<span class="rb">${post.metadata.author}</span>` : "";
		const summary = post.metadata.summary ? `<span style="color: var(--gray)">•</span> <span>${post.metadata.summary}</span>` : "";
		return getBlogEntry(thumbnail, id, post.title, author, post.dateString, summary);
	});
	return await templates.getBasePage("acikek's blog", "Blogposts written by acikek and friends.", "blog", getMainHeader(2), blogEntries.join(""));
}

export function checkPrivateBlogpostKey(privateBlogposts, id, key) {
	if (!fs.existsSync(PRIVATE_KEYS_PATH)) {
		return false;
	}
	const keysFile = fs.readFileSync(PRIVATE_KEYS_PATH);
	try {
		const keys = JSON.parse(keysFile.toString());
		if (!(key in keys)) {
			return false;
		}
		const keyData = keys[key];
		if (!("id" in keyData) || keyData.id !== id || !Object.hasOwn(privateBlogposts, id)) {
			return false;
		}
		const withinLifetime = keyData.createdAt !== undefined
			&& moment().diff(moment.unix(keyData.createdAt)) < PRIVATE_BLOGPOST_LIFETIME;
		if (!keyData.forever) {
			delete keys[key];
		}
		fs.writeFileSync(PRIVATE_KEYS_PATH, JSON.stringify(keys, null, 4));
		if (!withinLifetime) {
			return false;
		}
		return true;
	}
	catch (e) {
		console.error(e);
		return false;
	}
}
