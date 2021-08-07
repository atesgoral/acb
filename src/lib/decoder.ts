import {Transform, TransformOptions} from 'stream';

import Parser from 'stream-parser';

import type {ColorSpace, Color, ColorBook} from './types';

const IdToColorSpace: Record<number, ColorSpace> = {
  0: 'RGB',
  2: 'CMYK',
  7: 'Lab'
};

export interface AcbStreamDecoder extends Transform {
  on(event: 'book', callback: (book: ColorBook) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  once(event: 'book', callback: (book: ColorBook) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
}

export class AcbStreamDecoder extends Transform implements AcbStreamDecoder {
  private book: ColorBook = {
    id: 0,
    title: '',
    colorNamePrefix: '',
    colorNameSuffix: '',
    description: '',
    pageSize: 0,
    pageMidPoint: 0,
    colorSpace: 'RGB',
    colors: [],
    isSpot: false
  };
  private colorCount = 0;

  constructor(options?: TransformOptions) {
    super(options);
    this.readAscii(4, this.onSignature);
  }

  private onSignature(signature: string) {
    if (signature !== '8BCB') {
      return this.emit('error', new Error(`Not an ACB file: ${signature}`));
    }

    this.readUInt16BE(this.onVersion);
  }

  private onVersion(version: number) {
    if (version !== 1) {
      return this.emit('error', new Error(`Invalid version: ${version}`));
    }

    this.readUInt16BE(this.onId);
  }

  private onId(id: number) {
    this.book.id = id;
    this.readString(this.onTitle);
  }

  private onTitle(title: string) {
    this.book.title = title;
    this.readString(this.onColorNamePrefix);
  }

  private onColorNamePrefix(colorNamePrefix: string) {
    this.book.colorNamePrefix = colorNamePrefix;
    this.readString(this.onColorNameSuffix);
  }

  private onColorNameSuffix(colorNameSuffix: string) {
    this.book.colorNameSuffix = colorNameSuffix;
    this.readString(this.onDescription);
  }

  private onDescription(description: string) {
    this.book.description = description;
    this.readUInt16BE(this.onColorCount);
  }

  private onColorCount(colorCount: number) {
    this.colorCount = colorCount;
    this.readUInt16BE(this.onPageSize);
  }

  private onPageSize(pageSize: number) {
    this.book.pageSize = pageSize;
    this.readUInt16BE(this.onPageMidPoint);
  }

  private onPageMidPoint(pageMidPoint: number) {
    this.book.pageMidPoint = pageMidPoint;
    this.readUInt16BE(this.onColorSpaceId);
  }

  private onColorSpaceId(colorSpaceId: number) {
    const colorSpace = IdToColorSpace[colorSpaceId]

    if (!colorSpace) {
      return this.emit('error', new Error(`Unknown color space: ${colorSpaceId}`));
    }

    this.book.colorSpace = colorSpace;
    this.book.colors = [];
    this.checkReadNextColor();
  }

  private checkReadNextColor() {
    if (this.book.colors.length < this.colorCount) {
      this.readColor((color) => {
        this.book.colors.push(color);
        this.checkReadNextColor();
      });
    } else {
      this.readAscii(8, this.onSpotId);
    }
  }

  private onSpotId(spotId: string) {
    this.book.isSpot = spotId === 'spflspot';
    this.emit('book', this.book);
  }

  private readColor(callback: (color: Color) => void) {
    const color: Color = {
      name: '',
      code: '',
      components: []
    };

    this.readString((name) => {
      color.name = name;

      this.readAscii(6, (code) => {
        color.code = code;

        this.readComponents((components) => {
          color.components = components;

          callback(color);
        });
      });
    });
  }

  private readComponents(callback: (components: number[]) => void) {
    switch (this.book.colorSpace) {
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

  private readAscii(count: number, callback: (value: string) => void) {
    this._bytes(count, (chunk) => callback.call(this, chunk.toString('ascii')));
  }

  private readUInt16BE(callback: (value: number) => void) {
    this._bytes(2, (chunk) => callback.call(this, chunk.readUInt16BE()));
  }

  private readUInt32BE(callback: (value: number) => void) {
    this._bytes(4, (chunk) => callback.call(this, chunk.readUInt32BE()));
  }

  private readString(callback: (value: string) => void) {
    this.readUInt32BE((length) => {
      if (length) {
        this._bytes(length * 2, (chunk) => callback.call(this, chunk.swap16().toString('utf16le')));
      } else {
        callback.call(this, '');
      }
    });
  }

  // Mixed-in by Parser
  private _bytes(_n: number, _cb: (chunk: Buffer) => void) {}
}

Parser(AcbStreamDecoder.prototype);
