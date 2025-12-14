import fs from "node:fs";

import { getMainHeader } from "./main-page.js";
import templates from "./templates.js";

function getProjects() {
	return fs.readdirSync("projects")
		.map(filename => fs.readFileSync(`projects/${filename}`))
		.map(file => templates.components.project);
}

export function getProjectsPage() {
	const content = `<div class="projects">${getProjects().join("")}</div>`;
	return templates.getBasePage("acikek's projects", getMainHeader(1), content);
}
