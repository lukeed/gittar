'use strict';
const https = require('https');

const get = uri => new Promise((res, rej) => {
	https.get(uri, r => {
		let out = '';
		const code = r.statusCode;
		if (code >= 400) return rej();
		if (code == 301 || code == 302) {
			return get(r.headers.location).then(res);
		}
		r.on('data', str => out += str).on('end', _ => res(out));
	}).on('error', rej);
});
