export function fromAscii(value: string) {
  return Buffer.from(value, 'ascii');
}

export function fromUInt16BE(value: number) {
  const chunk = Buffer.allocUnsafe(2);
  chunk.writeUInt16BE(value);
  return chunk;
}

export function fromUInt32BE(value: number) {
  const chunk = Buffer.allocUnsafe(4);
  chunk.writeUInt32BE(value);
  return chunk;
}

export function fromString(value: string) {
  const chunk = Buffer.allocUnsafe(4 + value.length * 2);
  chunk.write(value, 4, 'utf16le');
  chunk.swap16();
  chunk.writeUInt32BE(value.length);
  return chunk;
}
