import fs from "node:fs"

const templates = {
	components: {
		blogEntryThumbnail: fs.readFileSync("templates/components/blog-entry-thumbnail.html").toString(),
		blogEntry: fs.readFileSync("templates/components/blog-entry.html").toString(),
		update: fs.readFileSync("templates/components/update.html").toString()
	},
	pages: {
		base: fs.readFileSync("templates/pages/base.html").toString(),
		blogpostHeader: fs.readFileSync("templates/pages/blogpost-header.html").toString(),
		mainHeader: fs.readFileSync("templates/pages/main-header.html").toString()
	}
}

function getBasePage(title, header, content) {
	return templates.pages.base
		.replace("$title", title)
		.replace("$header", header)
		.replace("$content", content);
}

export default {
	getBasePage,
	...templates
}
