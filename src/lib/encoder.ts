import {ColorSpace, ColorBook} from './types';
import * as Chunk from './chunk';

const ColorSpaceToId: Record<ColorSpace, number> = {
  'RGB': 0,
  'CMYK': 2,
  'Lab': 7
};

export function* encodeAcb(book: ColorBook) {
  yield Chunk.fromAscii('8BCB');
  yield Chunk.fromUInt16BE(1);

  yield Chunk.fromUInt16BE(book.id);
  yield Chunk.fromString(book.title);
  yield Chunk.fromString(book.colorNamePrefix);
  yield Chunk.fromString(book.colorNameSuffix);
  yield Chunk.fromString(book.description);
  yield Chunk.fromUInt16BE(book.colors.length);
  yield Chunk.fromUInt16BE(book.pageSize);
  yield Chunk.fromUInt16BE(book.pageMidPoint);

  const colorSpaceId = ColorSpaceToId[book.colorSpace];

  if (isNaN(colorSpaceId)) {
    throw new Error(`Unknown color space: ${book.colorSpace}`);
  }

  yield Chunk.fromUInt16BE(colorSpaceId);

  for (let color of book.colors) {
    yield Chunk.fromString(color.name);
    yield Chunk.fromAscii(color.code);

    switch (book.colorSpace) {
    case 'RGB':
      yield Buffer.from(color.components);
      break;
    case 'CMYK':
      yield Buffer.from(color.components.map((c) => 255 - Math.round(c * 2.55)));
      break;
    case 'Lab':
      yield Buffer.from([
        Math.round(color.components[0] * 2.55),
        color.components[1] + 128,
        color.components[2] + 128
      ]);
      break;
    }
  }

  yield Chunk.fromAscii(book.isSpot ? 'spflspot' : 'spflproc');
}
