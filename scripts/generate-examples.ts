import fs from 'fs';
import path from 'path';

import {encodeAcb, ColorModel, Color, ColorBook} from '../src';
import {conversion} from '../src/conversion';

function generateBook({
  id,
  colorModel,
  colors,
}: {
  id: number;
  colorModel: ColorModel;
  colors: Iterable<Color>;
}) {
  const book: ColorBook = {
    id,
    colorModel,
    title: `${colorModel} Components`,
    description: 'Example color book to verify component conversion',
    colorNamePrefix: `${colorModel} `,
    colorNamePostfix: '',
    pageSize: 9,
    pageKey: 5,
    isSpot: colorModel === 'Lab', // @TODO remove this property altogether
    colors: [...colors],
  };

  return book;
}

function* rgbColors() {
  for (let rgb = 0; rgb < 256; rgb++) {
    const components = conversion.RGB.toComponents([rgb, rgb, rgb]);

    yield {
      name: `${rgb} (${components[0]})`,
      code: `RGB${rgb.toString(16)}`.padEnd(6, ' '),
      components,
    };
  }
}

function* cmykColors() {
  for (let cmyk = 0; cmyk < 256; cmyk++) {
    const components = conversion.CMYK.toComponents([cmyk, cmyk, cmyk, cmyk]);

    yield {
      name: `${cmyk} (${components[0]})`,
      code: `CMYK${cmyk.toString(16)}`.padEnd(6, ' '),
      components,
    };
  }
}

function* labColors() {
  for (let l = 0; l < 256; l++) {
    const components = conversion.Lab.toComponents([l, 0, 0]);

    yield {
      name: `L ${l} (${components[0]})`,
      code: `L${l.toString(16)}`.padEnd(6, ' '),
      components,
    };
  }

  for (let ab = 0; ab < 256; ab++) {
    const components = conversion.Lab.toComponents([0, ab, ab]);

    yield {
      name: `ab ${ab} (${components[1]})`,
      code: `ab${ab.toString(16)}`.padEnd(6, ' '),
      components,
    };
  }
}

function saveBook(book: ColorBook) {
  const filename = `${book.title}.acb`;
  const filepath = path.join('books', filename);
  const buffer = Buffer.concat([...encodeAcb(book)]);
  fs.writeFileSync(filepath, buffer);
}

saveBook(
  generateBook({
    id: 43,
    colorModel: 'RGB',
    colors: rgbColors(),
  })
);

saveBook(
  generateBook({
    id: 44,
    colorModel: 'CMYK',
    colors: cmykColors(),
  })
);

saveBook(
  generateBook({
    id: 45,
    colorModel: 'Lab',
    colors: labColors(),
  })
);
