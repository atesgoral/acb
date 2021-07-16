import {Readable} from 'stream';

import {AcbStreamDecoder} from './lib/decoder.js';
import {encodeAcb} from './lib/encoder.js';

const decoder = new AcbStreamDecoder();

// readable.pipe(process.stdout);
// readable.pipe(decoder).pipe(process.stdout);

decoder.on('book', (book) => {
  // console.log(JSON.stringify(book, null, 2));
  const readable = Readable.from(encodeAcb(book));
  readable.pipe(process.stdout);
});

decoder.on('error', (error) => console.error(error));

process.stdin.pipe(decoder).pipe(process.stdout);

// process.stdin.pipe(decoder).pipe(process.stdout);
// process.stdin.resume();
