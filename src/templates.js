import fs from "node:fs"

const templates = {
	components: {
		blogEntryThumbnail: fs.readFileSync("templates/components/blog-entry-thumbnail.html").toString(),
		blogEntry: fs.readFileSync("templates/components/blog-entry.html").toString(),
		project: fs.readFileSync("templates/components/project.html").toString(),
		update: fs.readFileSync("templates/components/update.html").toString()
	},
	pages: {
		base: fs.readFileSync("templates/pages/base.html").toString(),
		blogpostHeader: fs.readFileSync("templates/pages/blogpost-header.html").toString(),
		error: fs.readFileSync("templates/pages/error.html").toString(),
		mainHeader: fs.readFileSync("templates/pages/main-header.html").toString()
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
