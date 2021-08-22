# acb

[![npm (scoped)](https://img.shields.io/npm/v/@atesgoral/acb)](https://www.npmjs.com/package/@atesgoral/acb)
[![CI](https://github.com/atesgoral/acb/actions/workflows/ci.yml/badge.svg)](https://github.com/atesgoral/acb/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Adobe Photoshop Color Book (ACB) encoder and decoder.

## What

Adobe Photoshop's color picker allows you to pick colors from standard color libraries. These libraries reside as .acb files inside Photoshop's installation directory (e.g. /Applications/Adobe Photoshop/Presets/Color Books on macOS). This library allows you to decode and encode .acb files. You can extract color data from Photoshop's color books, as well as creating your own custom color books you can use or distribute to others.

![image](https://user-images.githubusercontent.com/50832/130333639-adf72cc4-0aad-4621-b447-06a381684117.png)

## Install

```sh
npm install @atesgoral/acb
# Or:
yarn add @atesgoral/acb
```

## Book structure

The output from the decoder and the expected input into the decoder looks something like this:

```js
const book = {
  id: 42,
  title: 'Primary colors',
  description: 'Primary light colors, as perceived by humans.',
  colorNamePrefix: '',
  colorNamePostfix: '',
  pageSize: 3,
  pageKey: 1,
  colorModel: 'RGB',
  isSpot: true,
  colors: [
    {name: 'Red', code: 'RED   ', components: [255, 0, 0]},
    {name: 'Green', code: 'GREEN ', components: [0, 255, 0]},
    {name: 'Blue', code: 'BLUE  ', components: [0, 0, 255]},
  ],
};
```

If you're using TypeScript, there is a `ColorBook` interface that is exported by the library:

```ts
import type {ColorBook} from '@atesgoral/acb';

const book: ColorBook = {
  // ...
};
```

All properties are mandatory:

|      field       | description                                                                                                                                                                                                   |
| :--------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        id        | The unique color book identifier. You must ensure that this does not conflict with an existing color book that exists in Photoshop's color book folder. Stock Photoshop color books seem to start at id 3000. |
|      title       | The color book title. Photoshop seems to show the filename instead of this.                                                                                                                                   |
|   description    | The color book description. Photoshop doesn't show this anywhere. Use `'^R'` for the registered trademark symbol (&reg;) and `'^C'` for the copyright symbol (&copy;).                                        |
| colorNamePrefix  | The prefix to prepend to every color name.                                                                                                                                                                    |
| colorNamePostfix | The suffix to append to every color name.                                                                                                                                                                     |
|     pageSize     | The number of colors to show on every color page in the library color picker. The maximum Photoshop allows is 9.                                                                                              |
|     pageKey      | Which color (by index) on a page to use as the color page thumbnail. For example, with 9 colors per page, 5 would be the middle color.                                                                        |
|    colorModel    | The color space of the color book. Valid values are: `'RGB'`, `'CMYK'` and `'Lab'`. (`import type {ColorModel} from '@atesgoral/acb';`)                                                                       |
|      isSpot      | Whether the color book consists of spot color or process colors. This should be `true` for Lab and `false` for RGB and CMYK. (I might remove this property altogether, and handle it internally.)             |
|      colors      | And array of color records.                                                                                                                                                                                   |

Each color record (`import type {Color} from '@atesgoral/acb';`) consists of the following mandatory properties:

|   field    | description                                                                                                                                                                            |
| :--------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    name    | The color name.                                                                                                                                                                        |
|    code    | A 6-character unique code for the color.                                                                                                                                               |
| components | An array of component values. For RGB, it's 3 values 0..255. For CMYK it's 4 values 0..100. For Lab the L component is 0..100 while a and b are -128..127. (All ranges are inclusive.) |

## Decoding examples

### Decoding from the standard input stream

```js
import {AcbStreamDecoder} from '@atesgoral/acb';

const decoder = new AcbStreamDecoder();

decoder.on('book', (book) => {
  console.log(JSON.stringify(book, null, 2));
});

decoder.on('error', (error) => console.error(error));

process.stdin.pipe(decoder).pipe(process.stdout);
```

### Decoding from a buffer

```js
import {Readable} from 'stream';

import {AcbStreamDecoder} from '@atesgoral/acb';

const decoder = new AcbStreamDecoder();

decoder.on('book', (book) => {
  console.log(JSON.stringify(book, null, 2));
});

decoder.on('error', (error) => console.error(error));

const buffer = fs.readFileSync('./book.acb');

Readable.from(buffer).pipe(decoder).pipe(process.stdout);
```

## Encoding examples

`encodeAcb` is a generator that yields Buffer chunks.

### Encoding to the standard output stream

```js
import {Readable} from 'stream';

import {encodeAcb} from '@atesgoral/acb';

const book = {
  // ...
};

const readable = Readable.from(encodeAcb(book));
readable.pipe(process.stdout);
```

### Encoding into a single Buffer

```js
import {encodeAcb} from '@atesgoral/acb';

const book = {
  // ...
};

const buffer = Buffer.concat([...encodeAcb(book)]);
```

## Background

I [reverse-engineered the ACB format](https://magnetiq.ca/pages/acb-spec/) back in 2003 before [Adobe had it published publicly](https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577411_pgfId-1066780). I've been creating custom color books on the side for artists, printers and ink manifacturers. I've finally gotten around to publicly publishing a library that everyone can use.
