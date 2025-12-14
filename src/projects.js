import fs from "node:fs";

import { getMainHeader } from "./main-page.js";
import templates from "./templates.js";

function getProject(link, thumbnail, name, description) {
	return templates.components.project
		.replace("$link", link)
		.replace("$thumbnail", thumbnail)
		.replace("$name", name)
		.replace("$description", description);
}

function getProjects() {
	return fs.readdirSync("projects")
		.map(filename => JSON.parse(fs.readFileSync(`projects/${filename}`)))
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(data => getProject(data.link, data.thumbnail, data.name, data.description));
}

export function getProjectsPage() {
	const content = `<div class="projects">${getProjects().join("")}</div>`;
	return templates.getBasePage("acikek's projects", getMainHeader(1), content);
}
