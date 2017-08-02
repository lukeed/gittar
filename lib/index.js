'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const mkdir = require('mk-dirs');

function get(uri) {
	let out = '';
	return new Promise((res, rej) => {
		https.get(uri, r => {
			const code = r.statusCode;
			if (code >= 400) return rej();
			if (code > 300 && code < 400) return get(r.headers.location).then(res);
			r.on('data', str => out += str).on('end', _ => res(out));
		}).on('error', rej);
	});
}

function write(file, data) {
	file = path.normalize(file);
	return mkdir(path.dirname(file)).then(_ => fs.writeFileSync(file, data));
}
