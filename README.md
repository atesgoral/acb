# acb

Adobe Photoshop Color Book (ACB) encoder and decoder.

## Book structure

The output from the decoder and the expected input into the decoder looks something like this:

```js
const book = {
  title: 'Primary colors',
  colorNamePrefix: '',
  colorNameSuffix: '',
  description: 'Primary light colors, as perceived by humans.',
  pageSize: 3,
  pageMidPoint: 1,
  colorSpace: 'RGB',
  colors: [
    {name: 'Red', code: 'RED   ', components: [255, 0, 0]},
    {name: 'Green', code: 'GREEN ', components: [0, 255, 0]},
    {name: 'Blue', code: 'BLUE  ', components: [0, 0, 255]},
  ],
  isSpot: true
};
```

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
