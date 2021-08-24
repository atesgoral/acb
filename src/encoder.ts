import {ColorModel, ColorBook} from './types';
import validate from './validator';
import * as Chunk from './chunk';

const ColorModelToId: Record<ColorModel, number> = {
  RGB: 0,
  CMYK: 2,
  Lab: 7,
};

const ColorModelComponents: Record<ColorModel, number> = {
  RGB: 3,
  CMYK: 4,
  Lab: 3,
};

export function* encodeAcb(book: ColorBook) {
  const valid = validate(book);

  if (!valid) {
    throw new Error(
      `Validation failed: ${JSON.stringify(validate.errors, null, 2)}`
    );
  }

  yield Chunk.fromAscii('8BCB');
  yield Chunk.fromUInt16BE(1);

  yield Chunk.fromUInt16BE(book.id);
  yield Chunk.fromString(book.title);
  yield Chunk.fromString(book.colorNamePrefix);
  yield Chunk.fromString(book.colorNamePostfix);
  yield Chunk.fromString(book.description);
  yield Chunk.fromUInt16BE(book.colors.length);
  yield Chunk.fromUInt16BE(book.pageSize);
  yield Chunk.fromUInt16BE(book.pageKey);

  const colorModelId = ColorModelToId[book.colorModel];
  const expectedComponents = ColorModelComponents[book.colorModel];

  if (isNaN(colorModelId)) {
    throw new Error(`Unknown color model: ${book.colorModel}`);
  }

  yield Chunk.fromUInt16BE(colorModelId);

  for (let color of book.colors) {
    if (color.code.length !== 6) {
      throw new Error(`Invalid color code length: ${color.code.length}`);
    }

    if (color.components.length !== expectedComponents) {
      throw new Error(`Invalid component count: ${color.components.length}`);
    }

    yield Chunk.fromString(color.name);
    yield Chunk.fromAscii(color.code);
    yield Chunk.fromComponents(color.components, book.colorModel);
  }

  yield Chunk.fromAscii(book.colorModel === 'Lab' ? 'spflspot' : 'spflproc');
}
