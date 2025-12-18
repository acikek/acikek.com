import fs from "node:fs";
import path from "node:path";

import moment from "moment";

import templates from "./templates.js";

export function getMainHeader(tab) {
	return templates.pages.mainHeader.replace("$tab", tab);
}

function getUpdate(date, content) {
	return templates.components.update
		.replace("$heading", date.format("MMMM Do, YYYY"))
		.replace("$content", content);
}

function getUpdates() {
	return fs.readdirSync("updates")
		.map(filename => {
			const date = moment(path.basename(filename, ".html"));
			const content = fs.readFileSync(`updates/${filename}`);
			return { date, content };
		})
		.sort((a, b) => a.date.isBefore(b.date) ? 1 : -1)
		.map(update => getUpdate(update.date, update.content));
}

export async function getHomepage() {
	return await templates.getBasePage("acikek's page", "acikek's personal website!", "", getMainHeader(0), getUpdates().join(""));
}
