import {ColorSpace} from './types';

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

export function fromComponents(components: number[], colorSpace: ColorSpace) {
  switch (colorSpace) {
    case 'RGB':
      return Buffer.from(components);
    case 'CMYK':
      return Buffer.from(components.map((c) => 255 - Math.round(c * 2.55)));
    case 'Lab':
      return Buffer.from([
        Math.round(components[0] * 2.55),
        components[1] + 128,
        components[2] + 128,
      ]);
  }
}

export function toComponents(chunk: Buffer, colorSpace: ColorSpace) {
  switch (colorSpace) {
    case 'RGB':
      return Array.from(chunk);
    case 'CMYK':
      return Array.from(chunk).map((c) => Math.round((255 - c) / 2.55));
    case 'Lab':
      return [Math.round(chunk[0] / 2.55), chunk[1] - 128, chunk[2] - 128];
  }
}
