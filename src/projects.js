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

function getAllProjectData() {
	return fs.readdirSync("projects")
		.map(filename => JSON.parse(fs.readFileSync(`projects/${filename}`)))
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(data => getProject(data.link, data.thumbnail, data.name, data.description));
}

export async function getProjectsPage() {
	const content = templates.pages.projects.replace("$content", getAllProjectData().join(""));
	return await templates.getBasePage("acikek's projects", "Projects created by acikek and friends.", "projects", getMainHeader(1), content);
}
