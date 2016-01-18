/* (c) 2016 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
import test from 'ava';
import varint from 'varint';
import { Readable } from 'stream';
import Splitter from '..';

const REALLY_LONG = Array(300).join('!');

function makePacket(msg = 'foo bar baz') {
  const payload = new Buffer(msg);
  const packet = Buffer.concat([new Buffer(varint.encode(payload.length)), payload]);
  return { payload, packet };
}

test.beforeEach('streams', t => {
  const x = t.context;
  // Fake Readable
  const input = x.input = new Readable();
  input._read = () => {};
  x.write = ::input.push;

  // The Splitter
  const output = x.output = new Splitter();
  input.pipe(output);
});

test.beforeEach('custom asserts', t => {
  const x = t.context;

  // Buffer Comparison
  x.bufEqu = (actual, expected, msg) => {
    return t.is(actual.toString('hex'), expected.toString('hex'), msg);
  };
  x.bufNotEqu = (actual, expected, msg) => {
    return t.isNot(actual.toString('hex'), expected.toString('hex'), msg);
  };
});

test.beforeEach('dealing with chunks', t => {
  const x = t.context;

  // Returns a promise which resolves to the next chunk emitted from `t.context.output`
  x.getChunk = () => new Promise(good => x.output.once('data', good));

  // Basically getChunk().then(buf(Not)Equ);
  x.chunkEqu = (expected, msg) => x.getChunk().then(chunk => x.bufEqu(chunk, expected, msg));
  x.chunkNotEqu = (expected, msg) => x.getChunk().then(chunk => x.bufNotEqu(chunk, expected, msg));
});

test('basics', async ({ context: { write, chunkEqu } /*, ...t */ }) => {
  const { payload, packet } = makePacket();

  write(packet.slice(0, 5));
  write(packet.slice(5));

  chunkEqu(payload, 'Packet is emitted as a single event, without the length header');
});

test('length in separate net packets', async ({ context: { write, chunkEqu }, ...t }) => {
  // I know that I should escape the '\'s, but it doesn't actually matter.
  const { payload, packet } = makePacket(REALLY_LONG);

  t.ok(payload.length > 256, 'Payload is >256 characters'); // Sanity Check
  write(packet.slice(0, 1));
  write(packet.slice(1));
  chunkEqu(payload, 'Packet is emitted as a single chunk');
});


test('payload in >1 packet', async ({ context: { write, chunkEqu } /*, ...t */ }) => {
  // I know that I should escape the '\'s, but it doesn't actually matter.
  const { payload, packet } = makePacket(REALLY_LONG);

  for (let i = 0; i < packet.length; ++i) write(packet.slice(i, i + 1));

  chunkEqu(payload, 'Packet is emitted as a single chunk');
});
