import {readFileSync} from 'fs';
import {Readable} from 'stream';

import glob from 'glob';
import hexdump from 'hexdump-nodejs';

import {AcbStreamDecoder} from '../decoder';
import {encodeAcb} from '../encoder';
import {ColorBook} from '../types';

function decodeBuffer(buffer: Buffer) {
  return new Promise<ColorBook>((resolve, reject) => {
    const decoder = new AcbStreamDecoder();

    decoder.on('book', resolve);
    decoder.on('error', reject);

    Readable.from(buffer).pipe(decoder);
  });
}

function encodeBook(book: ColorBook) {
  return Buffer.concat([...encodeAcb(book)]);
}

function dump(buffer: Buffer) {
  return hexdump(buffer).split('\n');
}

describe('integrations tests', () => {
  test.skip('encoding decoded books is binary-equivalent', async () => {
    const bookPaths = glob.sync('src/lib/tests/acb-files/*');

    for (const bookPath of bookPaths) {
      console.log(`Decoding and encoding ${bookPath}`);

      const originalBuffer = readFileSync(bookPath);

      const book = await decodeBuffer(originalBuffer);
      const encodedBuffer = encodeBook(book);

      expect(dump(encodedBuffer)).toEqual(dump(originalBuffer));
    }
  });
});
