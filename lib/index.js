'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const mkdir = require('mk-dirs');
const parse = require('url').parse;
const HOME = require('os').homedir();
const DIR = path.join(HOME, '.gittar');

function fetch(uri) {
	return new Promise((res, rej) => {
		let out = '';
		https.get(uri, r => {
			const code = r.statusCode;
			if (code >= 400) return rej();
			if (code > 300 && code < 400) return fetch(r.headers.location).then(res);
			r.on('data', str => out += str).on('end', _ => res(out));
		}).on('error', rej);
	});
}

function write(file, data) {
	file = path.normalize(file);
	return mkdir(path.dirname(file)).then(_ => fs.writeFileSync(file, data));
}

function getHint(str) {
	const arr = str.match(/^(git(hub|lab)|bitbucket):/i);
	return arr && arr[1];
}

function getRef(hash) {
	return (hash || '#master').substr(1);
}

function getFilePath(obj) {
	return path.join(DIR, obj.site, obj.repo, `${obj.type}.tar.gz`);
}

function parser(uri, host) {
	const info = parse(uri);
	const repo = info.pathname;
	const type = getRef(info.hash);
	const site = getHint(uri) || host || 'github';
	return { site, repo, type };
}

function exists(file) {
	// file is a `user/repo#tag`
	if (!path.isAbsolute(file)) {
		file = getFilePath( parser(file) );
	}
	return fs.existsSync(file) && file;
}
function extract(file, toDir, opts) {
	return new Promise((res, rej) => {
		const zip = exists(file);
		if (!zip) return rej('File does not exist!');
	});
}
