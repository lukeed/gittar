'use strict';
const https = require('https');

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

