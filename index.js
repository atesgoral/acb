import Parser from 'stream-parser';
import {Transform, Readable} from 'stream';

class AcbStreamDecoder extends Transform {
  constructor(options) {
    super(options);

    this._book = {};

    this._readAscii(4, this._onSignature);
  }

  _onSignature(signature) {
    if (signature !== '8BCB') {
      return this.emit('error', new Error(`Not an ACB file: ${signature}`));
    }

    this._book.signature = signature;
    this._readUInt16BE(this._onVersion);
  }

  _onVersion(version) {
    if (version !== 1) {
      return this.emit('error', new Error(`Invalid version: ${version}`));
    }

    this._book.version = version;
    this._readUInt16BE(this._onId);
  }

  _onId(id) {
    this._book.id = id;
    this._readString(this._onTitle);
  }

  _onTitle(title) {
    this._book.title = title;
    this._readString(this._onColorNamePrefix);
  }

  _onColorNamePrefix(colorNamePrefix) {
    this._book.colorNamePrefix = colorNamePrefix;
    this._readString(this._onColorNameSuffix);
  }

  _onColorNameSuffix(colorNameSuffix) {
    this._book.colorNameSuffix = colorNameSuffix;
    this._readString(this._onDescription);
  }

  _onDescription(description) {
    this._book.description = description;
    this._readUInt16BE(this._onColorCount);
  }

  _onColorCount(colorCount) {
    this._book.colorCount = colorCount;
    this._readUInt16BE(this._onPageSize);
  }

  _onPageSize(pageSize) {
    this._book.pageSize = pageSize;
    this._readUInt16BE(this._onPageMidPoint);
  }

  _onPageMidPoint(pageMidPoint) {
    this._book.pageMidPoint = pageMidPoint;
    this._readUInt16BE(this._onColorSpaceId);
  }

  _onColorSpaceId(colorSpaceId) {
    const colorSpace = {
      0: 'RGB',
      2: 'CMYK',
      7: 'Lab'
    }[colorSpaceId]

    if (!colorSpace) {
      return this.emit('error', new Error(`Unknown color space: ${colorSpaceId}`));
    }

    this._book.colorSpace = colorSpace;
    this._book.colors = [];
    this._checkReadNextColor(this._onColor);
  }

  _checkReadNextColor() {
    if (this._book.colors.length < this._book.colorCount) {
      this._readColor((color) => {
        this._book.colors.push(color);
        this._checkReadNextColor();
      });
    } else {
      this._readAscii(8, this._onSpotId);
    }
  }

  _onSpotId(spotId) {
    this._book.isSpot = spotId === 'spflspot';
    this.emit('book', this._book);
  }

  _readColor(callback) {
    const color = {};

    this._readString((name) => {
      color.name = name;

      this._readAscii(6, (code) => {
        color.code = code;

        this._readComponents((components) => {
          color.components = components;

          callback(color);
        });
      });
    });
  }

  _readComponents(callback) {
    switch (this._book.colorSpace) {
    case 'RGB':
      this._bytes(3, (chunk) => callback(Array.from(chunk)));
      break;
    case 'CMYK':
      this._bytes(4, (chunk) => callback(Array.from(chunk).map((c) => Math.round((255 - c) / 2.55))));
      break;
    case 'Lab':
      this._bytes(3, (chunk) => callback([
        Math.round(chunk[0] / 2.55),
        chunk[1] - 128,
        chunk[2] - 128
      ]));
      break;
    }
  }

  _readAscii(count, callback) {
    this._bytes(count, (chunk) => callback.call(this, chunk.toString('ascii')));
  }

  _readUInt16BE(callback) {
    this._bytes(2, (chunk) => callback.call(this, chunk.readUInt16BE()));
  }

  _readUInt32BE(callback) {
    this._bytes(4, (chunk) => callback.call(this, chunk.readUInt32BE()));
  }

  _readString(callback) {
    this._readUInt32BE((length) => {
      if (length) {
        this._bytes(length * 2, (chunk) => callback.call(this, chunk.swap16().toString('utf16le')));
      } else {
        callback.call(this, '');
      }
    });
  }
}

Parser(AcbStreamDecoder.prototype);

const Chunk = {
  fromAscii: (value) => Buffer.from(value, 'ascii'),
  fromUInt16BE: (value) => {
    const chunk = Buffer.allocUnsafe(2);
    chunk.writeUInt16BE(value);
    return chunk;
  },
  fromUInt32BE: (value) => {
    const chunk = Buffer.allocUnsafe(4);
    chunk.writeUInt32BE(value);
    return chunk;
  },
  fromString: (value) => {
    const chunk = Buffer.allocUnsafe(4 + value.length * 2);
    chunk.write(value, 4, 'utf16le');
    chunk.swap16();
    chunk.writeUInt32BE(value.length);
    return chunk;
  }
}

function* encodeAcb(book) {
  yield Chunk.fromAscii(book.signature);
  yield Chunk.fromUInt16BE(book.version);
  yield Chunk.fromUInt16BE(book.id);
  yield Chunk.fromString(book.title);
  yield Chunk.fromString(book.colorNamePrefix);
  yield Chunk.fromString(book.colorNameSuffix);
  yield Chunk.fromString(book.description);
  yield Chunk.fromUInt16BE(book.colorCount);
  yield Chunk.fromUInt16BE(book.pageSize);
  yield Chunk.fromUInt16BE(book.pageMidPoint);

  const colorSpaceId = {
    'RGB': 0,
    'CMYK': 2,
    'Lab': 7
  }[book.colorSpace];

  yield Chunk.fromUInt16BE(colorSpaceId);

  yield* book.colors.map((color) => {
    const chunks = [];

    chunks.push(
      Chunk.fromString(color.name),
      Chunk.fromAscii(color.code)
    );

    switch (book.colorSpace) {
    case 'RGB':
      chunks.push(Buffer.from(color.components));
      break;
    case 'CMYK':
      chunks.push(Buffer.from(color.components.map((c) => 255 - Math.round(c * 2.55))));
      break;
    case 'Lab':
      chunks.push(Buffer.from([
        Math.round(color.components[0] * 2.55),
        color.components[1] + 128,
        color.components[2] + 128
      ]));
      break;
    }

    return Buffer.concat(chunks);
  });

  yield Chunk.fromAscii(book.isSpot ? 'spflspot' : 'spflproc');
}

const book = {
  signature: '8BCB',
  version: 1,
  id: 42,
  title: 'Test book',
  colorNamePrefix: 'TEST ',
  colorNameSuffix: ' COLOR',
  description: 'Booky McBookface',
  colorCount: 3,
  pageSize: 3,
  pageMidPoint: 1,
  colorSpace: 'RGB',
  colors: [
    {name: 'Red', code: 'RED   ', components: [255, 0, 0]},
    {name: 'Green', code: 'GREEN ', components: [0, 255, 0]},
    {name: 'Blue', code: 'BLUE  ', components: [0, 0, 255]}
  ],
  isSpot: false
};

const readable = Readable.from(encodeAcb(book));

// readable.pipe(process.stdout);

const decoder = new AcbStreamDecoder();

decoder.on('book', (book) => console.log(JSON.stringify(book)));
decoder.on('error', (error) => console.error(error));

readable.pipe(decoder).pipe(process.stdout);
// process.stdin.pipe(decoder).pipe(process.stdout);
// process.stdin.resume();
