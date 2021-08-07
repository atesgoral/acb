import * as Chunk  from '../chunk';

describe('fromAscii', () => {
  test('returns a buffer from the given ASCII string', () => {
    expect(Chunk.fromAscii('hello')).toEqual(Buffer.from('hello'));
  });
});

describe('fromUInt16BE', () => {
  test('returns a buffer from the given big-endian unsigned 16-bit number', () => {
    expect(Chunk.fromUInt16BE(0xDEAD)).toEqual(Buffer.from([0xDE, 0xAD]));
  });
});

describe('fromUInt32BE', () => {
  test('returns a buffer from the given big-endian unsigned 32-bit number', () => {
    expect(Chunk.fromUInt32BE(0xDEADBEEF)).toEqual(Buffer.from([0xDE, 0xAD, 0xBE, 0xEF]));
  });
});

describe('fromString', () => {
  test('returns a buffer from the given string', () => {
    expect(Chunk.fromString('hello')).toEqual(Buffer.from('\x00\x00\x00\x05\x00h\x00e\x00l\x00l\x00o'));
    expect(Chunk.fromString('')).toEqual(Buffer.from('\x00\x00\x00\x00'));
  });
});
