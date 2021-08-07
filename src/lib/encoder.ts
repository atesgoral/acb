import {ColorSpace, ColorBook} from './types';
import * as Chunk from './chunk';

const ColorSpaceToId: Record<ColorSpace, number> = {
  RGB: 0,
  CMYK: 2,
  Lab: 7,
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
    yield Chunk.fromComponents(color.components, book.colorSpace);
  }

  yield Chunk.fromAscii(book.isSpot ? 'spflspot' : 'spflproc');
}
