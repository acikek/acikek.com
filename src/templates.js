import fs from "node:fs"

function readTemplate(path) {
	return fs.readFileSync(`templates/${path}.html`).toString();
}

const templates = {
	components: {
		blogEntryThumbnail: readTemplate("components/blog-entry-thumbnail"),
		blogEntry: readTemplate("components/blog-entry"),
		project: readTemplate("components/project"),
		update: readTemplate("components/update")
	},
	pages: {
		base: readTemplate("pages/base"),
		blogpostHeader: readTemplate("pages/blogpost-header"),
		error: readTemplate("pages/error"),
		mainHeader: readTemplate("pages/main-header"),
		projects: readTemplate("pages/projects")
	}
}

function getBasePage(title, header, content) {
	return templates.pages.base
		.replace("$title", title)
		.replace("$header", header)
		.replace("$content", content);
}

function getErrorPage(error) {
	return templates.pages.error.replaceAll("$error", error);
}

export default {
	getBasePage,
	getErrorPage,
	...templates
}
