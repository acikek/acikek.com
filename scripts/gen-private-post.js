#!/bin/node

import crypto from "node:crypto";
import { argv } from "node:process";
import fs from "node:fs";
import path from "node:path";

import moment from "moment";

import { getBlogpostData } from "../src/blog.js";

if (argv.length < 3) {
	console.log("err: provide blogpost id");
	process.exit(1);
}

const postPath = argv[2];

if (path.dirname(postPath) !== "private-blogposts") {
	console.log("err: post must be in `private-blogposts/`");
	process.exit(1);
}

if (!fs.existsSync(postPath)) {
	console.log(`err: post does not exist (${postPath})`);
	process.exit(1);
}

const postData = await getBlogpostData("private-blogposts", path.basename(postPath));
const postKey = crypto.randomUUID();

let keys = {
	[postKey]: {
		id: postData.id,
		createdAt: moment.now()
	}
}

const keysPath = "private-blogpost-keys.json";

if (fs.existsSync(keysPath)) {
	keys = {
		...keys,
		...JSON.parse(fs.readFileSync(keysPath).toString())
	};
}

fs.writeFileSync(keysPath, JSON.stringify(keys, null, 4));
console.log(`https://acikek.com/blog/${postData.id}/${postKey}`);
