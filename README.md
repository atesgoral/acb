[![npm (scoped)](https://img.shields.io/npm/v/@atesgoral/acb)](https://www.npmjs.com/package/@atesgoral/acb)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

# acb

Adobe Photoshop Color Book (ACB) encoder and decoder.

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
  colorNameSuffix: '',
  pageSize: 3,
  pageMidPoint: 1,
  colorSpace: 'RGB',
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

|field|description|
|:-:|-|
|id|The unique color book identifier. You must ensure that this does not conflict with an existing color book that exists in Photoshop's color book folder.|
|title|The color book title. Photoshop seems to show the filename instead of this.|
|description|The color book description. Photoshop doesn't show this anywhere. Use `'^R'` for the registered trademark symbol and `'^C'` for the copyright symbol.|
|colorNamePrefix|The prefix to prepend to every color name.|
|colorNameSuffix|The suffix to append to every color name.|
|pageSize|The number of colors to show on every color page in the library color picker. The maximum Photoshop allows is 9.|
|pageMidPoint|Which color (by index) on a page to use as the color page thumbnail. For example, with 9 colors per page, 5 would be the middle color.|
|colorSpace|The color space of the color book. Valid values are: `'RGB'`, `'CMYK'` and `'Lab'`. (`import type {ColorSpace} from '@atesgoral/acb';`)|
|isSpot|Whether the color book consists of spot color or process colors. This should be `true` for Lab and `false` for RGB and CMYK. (I might remove this property altogether, and handle it internally.)|
|colors|And array of color records.|

Each color record (`import type {Color} from '@atesgoral/acb';`) consists of the following mandatory properties:

|field|description|
|:-:|-|
|name|The color name.|
|code|A 6-character unique code for the color.|
|components|An array of component values. For RGB, it's 3 values 0..255. For CMYK it's 4 values 0..100. For Lab the L component is 0..100 while a and b are -128..127. (All ranges are inclusive.)|

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
