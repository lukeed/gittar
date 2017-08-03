# gittar [![Build Status](https://travis-ci.org/lukeed/gittar.svg?branch=master)](https://travis-ci.org/lukeed/gittar)

> Download and/or Extract git repositories (GitHub, GitLab, BitBucket). Cross-platform and Offline-first!

Gittar is a Promise-based API that downloads `*.tar.gz` files from GitHub, GitLab, and BitBucket.

All archives are saved to the `$HOME/.gittar` directory with the following structure:

```sh
{HOSTNAME}/{USER}/{REPO}/{BRANCH-TAG}.tar.gz
#=> github/lukeed/mri/v1.1.0.tar.gz
#=> gitlab/Rich-Harris/buble/v0.15.2.tar.gz
#=> github/vuejs-templates/pwa/master.tar.gz
```

By default, new `gittar.fetch` requests will check the local filesystem for a matching tarball _before_ intiating a new remote download!

> **Important:** Please see [`gittar.fetch`](#gittarfetchrepo-options) for exceptions & behaviors!


## Install

```
$ npm install --save gittar
```


## Usage

```js
const gittar = require('gittar');

gittar.fetch('lukeed/gittar').then(console.log);
//=> ~/.gittar/github/lukeed/gittar/master.tar.gz

gittar.fetch('lukeed/tinydate#v1.0.0').then(console.log);
//=> ~/.gittar/github/lukeed/tinydate/v1.0.0.tar.gz

gittar.fetch('https://github.com/lukeed/mri').then(console.log);
//=> ~/.gittar/github/lukeed/mri/master.tar.gz

gittar.fetch('gitlab:Rich-Harris/buble#v0.15.2').then(console.log);
//=> ~/.gittar/gitlab/Rich-Harris/buble/v0.15.2.tar.gz

gittar.fetch('Rich-Harris/buble', { host:'gitlab' }).then(console.log);
//=> ~/.gittar/gitlab/Rich-Harris/buble/master.tar.gz

const src = '...local file path...';
const dest =

gittar.extract(src, dest);
```


## API

### gittar.fetch(repo, options)

#### repo
Type: `String`



#### options.host
Type: `String`<br>
Default: `github`

#### options.force
Type: `Boolean`<br>
Default: `false`

#### options.useCache
Type: `Boolean`<br>
Default: `false`

### gittar.extract(file, target, options)

#### file
Type: `String`

#### target
Type: `String`<br>
Default: `process.cwd()`

#### options
Type: `Object`<br>
Default: `{ strip:1 }`

All options are passed directly to [`tar.extract`](https://github.com/npm/node-tar#tarxoptions-filelist-callback-alias-tarextract).

> **Note:** The `cwd` and `file` options are set for you and _cannot_ be changed!

#### options.strip
Type: `Integer`<br>
Default: `1`

By default, `gittar` will strip the name of tarball from the extracted filepath.

```js
const file = 'lukeed/mri#master';

// strip:1 (default)
gittar.extract(file, 'foo');
//=> contents: foo/**

// strip:0 (retain tarball name)
gittar.extract(file, 'foo', { strip:0 });
//=> contents: foo/mri-master/**
```


## License

MIT © [Luke Edwards](https://lukeed.com)
