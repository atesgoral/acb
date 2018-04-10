const StreamParser = require('./stream-parser');

class AcbParser extends StreamParser {
  constructor(options) {
    super(options);

    this.readBook()
      .then((book) => this.emit('book', book))
      .catch((error) => this.emit('error', error));
  }

  async readString() {
    const length = await this.readUInt32BE();

    if (length) {
      return (await this.read(length * 2)).swap16().toString('utf16le');
    } else {
      return '';
    }
  }

  async readColorSpace() {
    const colorSpace = {
      0: 'RGB',
      2: 'CMYK',
      7: 'Lab'
    }[await this.readUInt16BE()]

    if (!colorSpace) {
      throw new Error('Unknown color space');
    }

    return colorSpace;
  }

  async readComponents(colorSpace) {
    switch (colorSpace) {
    case 'RGB':
      return {
        r: await this.readUInt8(),
        g: await this.readUInt8(),
        b: await this.readUInt8()
      };
    case 'CMYK':
      return {
        c: Math.round((255 - await this.readUInt8()) / 2.55),
        m: Math.round((255 - await this.readUInt8()) / 2.55),
        y: Math.round((255 - await this.readUInt8()) / 2.55),
        k: Math.round((255 - await this.readUInt8()) / 2.55)
      };
    case 'Lab':
      return {
        l: Math.round(await this.readUInt8() / 2.55),
        a: await this.readUInt8() - 128,
        b: await this.readUInt8() - 128
      };
    }
  }

  async readColor(colorSpace) {
    const color = {};

    color.name = await this.readString();
    color.code = (await this.read(6)).toString('ascii');
    color.components = await this.readComponents(colorSpace);

    return color;
  }

  async readColors(colorCount, colorSpace) {
    const colors = [];

    while (colors.length < colorCount) {
      colors.push(await this.readColor(colorSpace));
    }

    return colors;
  }

  async readIsSpot() {
    return (await this.read(8)).toString('ascii') === 'spflspot';
  }

  async readBook() {
    const book = {};

    book.signature = (await this.read(4)).toString('ascii');

    if (book.signature !== '8BCB') {
      throw new Error('Not an ACB file');
    }

    book.version = await this.readUInt16BE();

    if (book.version !== 1) {
      throw new Error('Invalid version');
    }

    // book.id = await this.readUInt16BE();
    // book.title = await this.readString();
    // book.colorNamePrefix = await this.readString();
    // book.colorNameSuffix = await this.readString();
    // book.description = await this.readString();
    // book.colorCount = await this.readUInt16BE();
    // book.pageSize = await this.readUInt16BE();
    // book.pageMidPoint = await this.readUInt16BE();
    // book.colorSpace = await this.readColorSpace();
    // book.colors = await this.readColors();
    // book.isSpot = await this.readIsSpot();

    return book;
  }
}

const parser = new AcbParser();

parser.on('book', (book) => {
  console.log('Got book', book);
});

parser.on('error', (error) => {
  console.error('Got error', error);
});

process.stdin.pipe(parser);
process.stdin.resume();
