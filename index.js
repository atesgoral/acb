const Transform = require('stream').Transform;
const Parser = require('stream-parser');

const colorSpaceMap = {
  0: 'RGB',
  2: 'CMYK',
  7: 'Lab'
};

const componentNormalizerMap = {
  RGB: (components) => components,
  CMYK: (components) => ({
    c: Math.round((255 - components[0]) / 2.55),
    m: Math.round((255 - components[1]) / 2.55),
    y: Math.round((255 - components[2]) / 2.55),
    k: Math.round((255 - components[3]) / 2.55)
  }),
  Lab: (components) => ({
    l: Math.round(components[0] / 2.55),
    a: components[1] - 128,
    b: components[2] - 128
  })
};

class AcbParser extends Transform {
  constructor() {
    super();

    this.colorBook = {};

    this._bytes(4, this.onSignature);
  }

  readInt8(cb) {
    this._bytes(1, (buffer) => {
      cb.call(this, buffer.readUInt8(0));
    });
  }

  readInt16(cb) {
    this._bytes(2, (buffer) => {
      cb.call(this, buffer.readUInt16BE(0));
    });
  }

  readInt32(cb) {
    this._bytes(4, (buffer) => {
      cb.call(this, buffer.readUInt32BE(0));
    });
  }

  readString(cb) {
    this.readInt32((length) => {
      if (length) {
        this._bytes(length * 2, (buffer) => {
          cb.call(this, buffer.swap16().toString('utf16le'));
        });
      } else {
        cb('');
      }
    });
  }

  readColors(cb) {
    const colors = [];
    const componentCount = this.colorBook.colorSpace === 'CMYK' ? 4 : 3;

    const readNextColor = () => {
      if (colors.length === this.colorBook.colorCount) {
        cb.call(this, colors);
      } else {
        const color = {};

        this.readString((name) => {
          color.name = name;

          this._bytes(6, (buffer) => {
            color.code = buffer.toString('ascii');

            const components = [];

            const readNextComponent = () => {
              if (components.length === componentCount) {
                color.components = componentNormalizerMap[this.colorBook.colorSpace](components);
                colors.push(color);
                readNextColor();
              } else {
                this.readInt8((component) => {
                  components.push(component);
                  readNextComponent();
                });
              }
            };

            readNextComponent();
          })
        });
      }
    };

    readNextColor();
  }

  onSignature(buffer, output) {
    this.colorBook.signature = buffer.toString('ascii');
    this.readInt16(this.onVersion);
  }

  onVersion(version) {
    this.colorBook.version = version;
    this.readInt16(this.onId);
  }

  onId(id) {
    this.colorBook.id = id;
    this.readString(this.onTitle);
  }

  onTitle(title) {
    this.colorBook.title = title;
    this.readString(this.onColorNamePrefix);
  }

  onColorNamePrefix(colorNamePrefix) {
    this.colorBook.colorNamePrefix = colorNamePrefix;
    this.readString(this.onColorNameSuffix);
  }

  onColorNameSuffix(colorNameSuffix) {
    this.colorBook.colorNameSuffix = colorNameSuffix;
    this.readString(this.onDescription);
  }

  onDescription(description) {
    this.colorBook.description = description;
    this.readInt16(this.onColorCount);
  }

  onColorCount(colorCount) {
    this.colorBook.colorCount = colorCount;
    this.readInt16(this.onPageSize);
  }

  onPageSize(pageSize) {
    this.colorBook.pageSize = pageSize;
    this.readInt16(this.onPageMidpoint);
  }

  onPageMidpoint(pageMidPoint) {
    this.colorBook.pageMidPoint = pageMidPoint;
    this.readInt16(this.onColorSpace);
  }

  onColorSpace(colorSpace) {
    this.colorBook.colorSpace = colorSpaceMap[colorSpace];
    this.readColors(this.onColors);
  }

  onColors(colors) {
    this.colorBook.colors = colors;
    this._bytes(8, this.onProduction);
  }

  onProduction(production) {
    this.colorBook.isSpot = production.toString('ascii') === 'spflspot';
    this.emit('done', this.colorBook);
    this._passthrough(Infinity);
  }
}

Parser(AcbParser.prototype);

const parser = new AcbParser();

parser.on('done', function (book) {
  console.log('Got book', JSON.stringify(book, null, 2));
});

process.stdin.pipe(parser).pipe(process.stdout);
process.stdin.resume();

// exports.encode = (colorBook) => {

// };

// exports.decode = (buffer) => {

// };
