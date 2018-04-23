const Writable = require('stream').Writable;

class StreamParser extends Writable {
  constructor(options) {
    super(options);
    this.buffer = Buffer.from([]); // @todo use allocUnsafe?
    this.readQueue = [];
    this.readQueueResolver = null;
  }

  queueRead(count, resolve) {
    // console.log('queueRead', count);

    this.readQueue.push({ count, resolve });

    if (this.readQueueResolver) {
      // console.log('resolving read queue');
      this.readQueueResolver(this.readQueue); // @todo need to reset?
      this.readQueueResolver = null;
    }
  }

  readQueued() {
    // console.log('readQueued');

    return new Promise((resolve, reject) => {
      if (this.readQueue.length) {
        // console.log('resolving');
        resolve(this.readQueue);
      } else {
        // console.log('setting resolver');
        this.readQueueResolver = resolve;
      }
    });
  }

  async depleteChunk(chunk) {
    // console.log('depleteChunk');

    // let c = 0;

    while (chunk.length) {
      // c++;

      // console.log('awaiting queue');
      // const queue = await this.readQueued();
      await this.readQueued().then((queue) => {
        // console.log('got queued reads', queue.length);

        const read = queue.shift(); // @todo loop over queue instead of awaiting again

        const haveEnoughBytesInChunk = read.count <= chunk.length;

        if (haveEnoughBytesInChunk) {
          read.resolve(chunk.slice(0, read.count));
          chunk = chunk.slice(read.count); // @todo increment a start index instead of slicing
        } else {
          this.buffer = Buffer.concat(this.buffer, chunk);
          return Promise.resolve();
        }
      });
    }
  }

  _write(chunk, encoding, callback) {
    // console.log('_write', chunk.length);

    this.depleteChunk(chunk)
      .then(callback)
      .catch(callback);
  }

  // @todo implement _writev?

  // @todo implement _destroy

  read(count) {
    return new Promise((resolve, reject) => {
      this.queueRead(count, resolve); // @todo return Promise from queueRead instead?
    });
  }

  // @todo to signal no need to deplete latest chunk
  // pass thru?
  end() {

  }
}

module.exports = StreamParser;
