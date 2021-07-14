import Parser from 'stream-parser';
import {Transform} from 'stream';

class AcbParser extends Transform {
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
      this._bytes(3, (chunk) => callback({
        r: chunk.readUInt8(0),
        g: chunk.readUInt8(1),
        b: chunk.readUInt8(2)
      }));
      break;
    case 'CMYK':
      this._bytes(4, (chunk) => callback({
        c: Math.round((255 - chunk.readUInt8(0)) / 2.55),
        m: Math.round((255 - chunk.readUInt8(1)) / 2.55),
        y: Math.round((255 - chunk.readUInt8(2)) / 2.55),
        k: Math.round((255 - chunk.readUInt8(3)) / 2.55)
      }));
      break;
    case 'Lab':
      this._bytes(3, (chunk) => callback({
        l: Math.round(chunk.readUInt8(0) / 2.55),
        a: chunk.readUInt8(1) - 128,
        b: chunk.readUInt8(2) - 128
      }));
      break;
    }
  }

  _readAscii(count, callback) {
    this._bytes(count, (chunk) => callback.call(this, chunk.toString('ascii')));
  }

  _readUInt16BE(callback) {
    this._bytes(2, (chunk) => callback.call(this, chunk.readUInt16BE(0)));
  }

  _readUInt32BE(callback) {
    this._bytes(4, (chunk) => callback.call(this, chunk.readUInt32BE(0)));
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

Parser(AcbParser.prototype);

const parser = new AcbParser();

parser.on('book', (book) => console.log(JSON.stringify(book)));
parser.on('error', (error) => console.error(error.message));

process.stdin.pipe(parser).pipe(process.stdout);
// process.stdin.resume();
