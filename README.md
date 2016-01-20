# VarInt-Splitter
---

### Split a stream of packets with their lengths as VarInts

[//]: # "ProTip(tm): This is how you make a comment in markdown. Anything between the quotes is ignored."

---
[![Version][version-badge]][npm-link]
[![Downloads][downloads-badge]][npm-link]
[![Build Status][build-badge]][build-link]
[![Coverage Status][coverage-badge]][coverage-link]
[![Dependency Status][deps-badge]][deps-link]
[![devDependency Status][devDeps-badge]][devDeps-link]
[![Commitizen friendly][cz-badge]][cz-link]
[![semantic-release][sr-badge]][sr-link]
[![MIT License][license-badge]][license-link]


[//]: # "These use the npm package name"
[version-badge]: 	https://img.shields.io/npm/v/varint-splitter.svg   "npm version"
[downloads-badge]: https://img.shields.io/npm/dm/varint-splitter.svg "npm downloads"
[npm-link]:  http://npm.im/varint-splitter                           "npm"

[license-badge]: https://img.shields.io/npm/l/varint-splitter.svg    "MIT License"
[license-link]:  http://ariporad.mit-license.org                     "MIT License"

[//]: # "The rest just use the repo slug"
[build-badge]: https://travis-ci.org/ariporad/varint-splitter.svg                   "Travis CI Build Status"
[build-link]:  https://travis-ci.org/ariporad/varint-splitter                       "Travis CI Build Status"

[deps-badge]: https://img.shields.io/david/ariporad/varint-splitter.svg             "Dependency Status"
[deps-link]:  https://david-dm.org/ariporad/varint-splitter                         "Dependency Status"

[devDeps-badge]: https://img.shields.io/david/dev/ariporad/varint-splitter.svg      "devDependency Status"
[devDeps-link]:  https://david-dm.org/ariporad/varint-splitter#info=devDependencies "devDependency Status"

[cz-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg "Commitizen friendly"
[cz-link]: http://commitizen.github.io/cz-cli/                               "Commitizen friendly"

[sr-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[sr-link]: https://github.com/semantic-release/semantic-release

[//]: # "This comes last, as it's really long"

[coverage-badge]: https://coveralls.io/repos/ariporad/varint-splitter/badge.svg?branch=master&service=github "Code Coverage"
[coverage-link]: https://coveralls.io/github/ariporad/varint-splitter?branch=master                          "Code Coverage"

---

## Why?

We needed a way to turn a messy `net.Socket` into a tidy stream of [`Protobuf`][] messages. (We then parse them using [`ProtobufJS`][]). This is it.

[`Protobuf`]: https://developers.google.com/protocol-buffers/
[`ProtobufJS`]: https://github.com/dcodeIO/protobuf.js
[`varint`]: http://npm.im/varint

---

## Usage

Since it's not possible to automatically know if a protobuf message is complete, this module requires that you prefix every message with it's length as a VarInt (If you need an easy to use varint implementation for node, We recommend [`varint`][]).

For example, say you wanted to send the message `66 6f 6f 20 62 61 72`. That's 7 bytes long, so you'd want to prefix it with `7` encoded as a VarInt (which happens to be `0x07`). All put together, that's:
```
To encode the message:

    66 6f 6f 20 62 61 72

Get it's length (7), and encode it as a VarInt (0x07), and append it to the beginning:

    07 66 6f 6f 20 62 61 72

Then send that.
```

Then as far as the actual API goes:

```javascript
import Splitter from 'varint-splitter';

const socket = getTCPSocketSomehow();
const splitter = new Splitter(); // This is the only thing that we export. It only does one thing.

socket.on('data', console.log); // Might Log: `07 66 6f`, then `20`, then `62 61 72`.

socket.pipe(splitter);

splitter.on('data', chunk => {
  // chunk is _*guaranteed*_ to be a buffer with the content `66 6f 6f 20 62 61 72` (The length header is stripped).
});

```

---

## Contributing

Please see [CONTRIBUTING.md][]

[CONTRIBUTING.md]: https://github.com/ariporad/varint-splitter/blob/master/CONTRIBUTING.md

---

## License

[MIT: ariporad.mit-license.org.](http://ariporad.mit-license.org)
