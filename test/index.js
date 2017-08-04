const p = require('path');
const test = require('tape');
const rimraf = require('rimraf');
const exists = require('fs').existsSync;
const fn = require('../lib');

const join = p.join;
const isAbs = p.isAbsolute;
const dir = join(__dirname, 'fixtures');

const wasRemote = ms => (Date.now() - ms) > 200; // fair?

function fetcher(t, repo, cleanup) {
	return fn.fetch(repo).then(str => {
		t.ok(str, 'return the filepath');
		t.is(typeof str, 'string', 'returns a string');
		t.true(str.includes('.tar.gz'), 'is `.tar.gz`');
		t.true(isAbs(str), 'is an absolute filepath');
		t.true(exists(str), 'creates the file!');
		cleanup && rimraf.sync(str);
		return str;
	});
}

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
	t.plan(7);
	fetcher(t, 'lukeed/mri', true).then(str => {
		t.true( str.includes('github'), 'assumes `github` host by default' );
		t.true( str.includes('master'), 'assumes `master` branch by default' );
	});
});

test('gittar.fetch (user/repo#tag)', t => {
	t.plan(6);
	fetcher(t, 'lukeed/mri#v1.1.0', true).then(str => {
		t.true( str.includes('v1.1.0'), 'grabs `v1.1.0` archive' );
	});
});

test('gittar.fetch (host:user/repo#tag)', t => {
	t.plan(9);
	fetcher(t, 'gitlab:Rich-Harris/buble#v0.15.2').then(foo => {
		t.true( foo.includes('gitlab'), 'parses `gitlab` hostname' );
		t.true( foo.includes('v0.15.2'), 'grabs `v0.15.2` archive' );
		// will grab same file
		fn.fetch('Rich-Harris/buble#v0.15.2', { host:'gitlab' }).then(bar => {
			t.ok(bar, 'accepts `host` object');
			t.equal(foo, bar, 'resolves same repo/file path');
			rimraf.sync(bar);
		});
	});
});

test('gittar.fetch (useCache)', t => {
	t.plan(2);
	var start=Date.now(), repo='lukeed/mri#v1.1.0';
	fn.fetch(repo).then(_ => {
		t.true( wasRemote(start), 'complete initial (remote) request' );
	}).then(_ => {
		start = Date.now();
		fn.fetch(repo, { useCache:true }).then(str => {
			t.false( wasRemote(start), 'fetched existing / local archive' );
			rimraf.sync(str);
		});
	});
});

test('gittar.fetch (force)', t => {
	t.plan(2);
	var start=Date.now(), repo='lukeed/mri#v1.1.0';
	fn.fetch(repo).then(_ => {
		t.true( wasRemote(start), 'complete initial (remote) request' );
	}).then(_ => {
		start = Date.now();
		fn.fetch(repo, { force:true }).then(str => {
			t.true( wasRemote(start), 'respect `force:true` config' );
			rimraf.sync(str);
		});
	});
});

test('gittar.fetch (force master)', t => {
	t.plan(2);
	var start=Date.now(), repo='lukeed/mri';
	fn.fetch(repo).then(_ => {
		t.true( wasRemote(start), 'complete initial (remote) request' );
	}).then(_ => {
		start = Date.now();
		fn.fetch(repo).then(str => {
			t.true( wasRemote(start), 'always send request remote for `master` branch' );
			rimraf.sync(str);
		});
	});
});
