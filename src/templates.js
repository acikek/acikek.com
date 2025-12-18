import { minify } from "html-minifier-terser";
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

const minifyOptions = {
	minifyCSS: true,
	removeAttributeQuotes: true,
	collapseWhitespace: true
}

async function getBasePage(title, description, path, header, content) {
	return await minify(templates.pages.base
		.replaceAll("$title", title)
		.replace("$description", description)
		.replace("$path", path)
		.replace("$header", header)
		.replace("$content", content), minifyOptions);
}

async function getErrorPage(error) {
	return await minify(templates.pages.error.replaceAll("$error", error), minifyOptions);
}

export default {
	getBasePage,
	getErrorPage,
	...templates
}
