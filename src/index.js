/* (c) 2016 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */
import { Transform } from 'stream';
import varint from 'varint';

export default class Splitter extends Transform {
  chunk = new Buffer(0);
  packetLen = null;
  state = 0;

  _transform(chunk, encoding, callback) {
    /* istanbul ignore next: pretty sure that this is just a internal (non-testable) stream thing */
    if (encoding !== 'buffer') chunk = new Buffer(chunk, encoding); // No clue if this is right

    // If we already have a partial chunk
    if (this.chunk.length) chunk = Buffer.concat([this.chunk, chunk]);

    // noinspection FallThroughInSwitchStatementJS
    switch (this.state) {
      case 0: // We need to figure out the length of the packet.
        const packetLen = varint.decode(chunk);
        if (packetLen === undefined) break; // Partial Varints
        this.packetLen = packetLen;
        chunk = chunk.slice(varint.decode.bytes);
        this.state = 1;
      // Intentional Fallthrough
      case 1: // We have some number of chunks, do we have a full packet?
        if (chunk.length < this.packetLen) break;
        const packet = chunk.slice(0, this.packetLen);
        this.push(packet); // Pass the packet through
        // Go back to start
        chunk = chunk.slice(this.packetLen); // The remaining chunk.
        this.packetLen = null;
        this.state = 0;
        break;
      /* istanbul ignore next: This doesn't make sense to test, nor is it easy to test */
      default:
        throw new Error('Unknown State: ' + this.state + '!');
    }
    this.chunk = chunk; // We've already checked for an existing chunk.

    callback();
  }
}
