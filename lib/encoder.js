const Chunk = {
  fromAscii: (value) => Buffer.from(value, 'ascii'),
  fromUInt16BE: (value) => {
    const chunk = Buffer.allocUnsafe(2);
    chunk.writeUInt16BE(value);
    return chunk;
  },
  fromUInt32BE: (value) => {
    const chunk = Buffer.allocUnsafe(4);
    chunk.writeUInt32BE(value);
    return chunk;
  },
  fromString: (value) => {
    const chunk = Buffer.allocUnsafe(4 + value.length * 2);
    chunk.write(value, 4, 'utf16le');
    chunk.swap16();
    chunk.writeUInt32BE(value.length);
    return chunk;
  }
}

export function* encodeAcb(book) {
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

  const colorSpaceId = {
    'RGB': 0,
    'CMYK': 2,
    'Lab': 7
  }[book.colorSpace];

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
