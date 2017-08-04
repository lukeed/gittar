const fs = require('fs');
const p = require('path');
const test = require('tape');
const rimraf = require('rimraf');
const fn = require('../lib');

const join = p.join;
const stats = fs.statSync;
const isAbs = p.isAbsolute;
const exists = fs.existsSync;

const dir = join(__dirname, 'fixtures');

const wasRemote = ms => (Date.now() - ms) > 200; // fair?

const cleanup = str => (rimraf.sync(str),str);

const validate = t => function (x) {
	const arr = [x, typeof x === 'string', isAbs(x), exists(x)];
	t.true(arr.every(Boolean), 'returns a valid, absolute filepath!');
	return x;
};

test('exports an object', t => {
	t.plan(6);
	t.is(typeof fn, 'object');
	const keys = Object.keys(fn);
	t.is(keys.length, 2, 'has two keys');
	keys.forEach(k => {
		t.ok(fn[k], `gittar.${k} is defined`);
		t.is(typeof fn[k], 'function', `gittar.${k} is a function`);
	});
});

test('gittar.fetch (user/repo)', t => {
	t.plan(3);
	const isOk = validate(t);
	fn.fetch('lukeed/mri').then(isOk).then(cleanup).then(str => {
		t.true( str.includes('github'), 'assumes `github` host by default' );
		t.true( str.includes('master'), 'assumes `master` branch by default' );
	});
});

test('gittar.fetch (user/repo#tag)', t => {
	t.plan(2);
	const isOk = validate(t);
	fn.fetch('lukeed/mri#v1.1.0').then(isOk).then(cleanup).then(str => {
		t.true( str.includes('v1.1.0'), 'grabs `v1.1.0` archive' );
	});
});

test('gittar.fetch (host:user/repo#tag)', t => {
	t.plan(6);
	const isOk = validate(t);
	const repo = 'Rich-Harris/buble#v0.15.2';
	fn.fetch(`gitlab:${repo}`).then(isOk).then(foo => {
		t.true( foo.includes('gitlab'), 'parses `gitlab` hostname' );
		t.true( foo.includes('v0.15.2'), 'grabs `v0.15.2` archive' );
		// will grab same file
		fn.fetch(repo, { host:'gitlab' }).then(isOk).then(cleanup).then(bar => {
			t.pass('accepts `host` object');
			t.equal(foo, bar, 'resolves same repo/file path');
		});
	});
});

test('gittar.fetch (useCache)', t => {
	t.plan(3);
	var start=Date.now();
	const isOk = validate(t);
	const repo='lukeed/mri#v1.1.0';

	fn.fetch(repo).then(_ => {
		t.true(wasRemote(start), 'complete initial (remote) request');
	}).then(_ => {
		start = Date.now();
		fn.fetch(repo, { useCache:true }).then(foo => {
			t.false(wasRemote(start), 'fetched existing / local archive');
			return foo;
		}).then(isOk).then(cleanup);
	});
});

test('gittar.fetch (force)', t => {
	t.plan(3);
	var start=Date.now();
	const isOk = validate(t);
	const repo='lukeed/mri#v1.1.0';

	fn.fetch(repo).then(_ => {
		t.true(wasRemote(start), 'complete initial (remote) request');
	}).then(_ => {
		start = Date.now();
		fn.fetch(repo, { force:true }).then(foo => {
			t.true(wasRemote(start), 'respect `force:true` config');
			return foo;
		}).then(isOk).then(cleanup);
	});
});

test('gittar.fetch (force master)', t => {
	t.plan(3);
	var start=Date.now();
	const repo='lukeed/mri';
	const isOk = validate(t);

	fn.fetch(repo).then(_ => {
		t.true(wasRemote(start), 'complete initial (remote) request');
	}).then(_ => {
		start = Date.now();
		fn.fetch(repo).then(foo => {
			t.true(wasRemote(start), 'always send request remote for `master` branch');
			return foo;
		}).then(isOk).then(cleanup);
	});
});

test('gittar.fetch (404)', t => {
	t.plan(5);
	fn.fetch('https://foo.bar/baz/bat#dev').then().catch(err => {
		t.pass('caught rejected Promise');
		t.is(typeof err, 'object', 'received an error object');
		t.is(Object.keys(fn).length, 2, 'has two keys');
		t.is(err.code, 404, 'error `code` is 404');
		t.is(err.message, 'Not Found', 'error `message` is `Not Found`');
	})
});

test('gittar.fetch (local 404)', t => {
	t.plan(2);
	fn.fetch('https://foo.bar/baz/bat#dev', { useCache:true }).then().catch(err => {
		t.pass('caught rejected Promise');
		t.is(err, undefined, 'silently fails');
	})
});

test('gittar.extract (user/repo)', t => {
	t.plan(4);

	const isOk = validate(t);
	const repo = 'lukeed/mri';
	const tmp = join(dir, 'foo' + Math.random());

	fn.extract(repo, tmp).then().catch(err => {
		t.pass('caught rejected Promise');
		t.is(err, undefined, 'silently fails');
	}).then(_ => {
		// ensure file exists
		fn.fetch(repo).then(zip => {
			fn.extract(zip, tmp).then(isOk).then(str => {
				t.true(stats(str).isDirectory(), 'creates the directory');
				cleanup(zip) && cleanup(str);
			});
		});
	});
});
