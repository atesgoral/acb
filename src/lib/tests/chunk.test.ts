import * as Chunk from '../chunk';

describe('fromAscii', () => {
  test('returns a buffer from the given ASCII string', () => {
    const chunk = Chunk.fromAscii('hello');
    const expected = Buffer.from('hello');
    expect(chunk).toEqual(expected);
  });
});

describe('fromUInt16BE', () => {
  test('returns a buffer from the given big-endian unsigned 16-bit number', () => {
    const chunk = Chunk.fromUInt16BE(0xdead);
    const expected = Buffer.from([0xde, 0xad]);
    expect(chunk).toEqual(expected);
  });
});

describe('fromUInt32BE', () => {
  test('returns a buffer from the given big-endian unsigned 32-bit number', () => {
    const chunk = Chunk.fromUInt32BE(0xdeadbeef);
    const expected = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
    expect(chunk).toEqual(expected);
  });
});

describe('fromString', () => {
  test('returns a buffer from the given string', () => {
    const chunk = Chunk.fromString('hello');
    const expected = Buffer.from('\x00\x00\x00\x05\x00h\x00e\x00l\x00l\x00o');
    expect(chunk).toEqual(expected);
  });

  test('returns a buffer from the given empty string', () => {
    const chunk = Chunk.fromString('');
    const expected = Buffer.from('\x00\x00\x00\x00');
    expect(chunk).toEqual(expected);
  });
});

describe('fromComponents', () => {
  describe('RGB', () => {
    test('returns a buffer from the minimum components', () => {
      const chunk = Chunk.fromComponents([0, 0, 0], 'RGB');
      const expected = Buffer.from([0, 0, 0]);
      expect(chunk).toEqual(expected);
    });

    test('returns a buffer from mid-range components', () => {
      const chunk = Chunk.fromComponents([127, 127, 127], 'RGB');
      const expected = Buffer.from([127, 127, 127]);
      expect(chunk).toEqual(expected);
    });

    test('returns a buffer from maximum components', () => {
      const chunk = Chunk.fromComponents([255, 255, 255], 'RGB');
      const expected = Buffer.from([255, 255, 255]);
      expect(chunk).toEqual(expected);
    });
  });

  describe('CMYK', () => {
    test('returns a buffer from the minimum components', () => {
      const chunk = Chunk.fromComponents([0, 0, 0, 0], 'CMYK');
      const expected = Buffer.from([255, 255, 255, 255]);
      expect(chunk).toEqual(expected);
    });

    test('returns a buffer from the mid-range components', () => {
      const chunk = Chunk.fromComponents([50, 50, 50, 50], 'CMYK');
      const expected = Buffer.from([128, 128, 128, 128]);
      expect(chunk).toEqual(expected);
    });

    test('returns a buffer from the maximum components', () => {
      const chunk = Chunk.fromComponents([100, 100, 100, 100], 'CMYK');
      const expected = Buffer.from([0, 0, 0, 0]);
      expect(chunk).toEqual(expected);
    });
  });

  describe('Lab', () => {
    test('returns a buffer from the minimum components', () => {
      const chunk = Chunk.fromComponents([0, -128, -128], 'Lab');
      const expected = Buffer.from([0, 0, 0]);
      expect(chunk).toEqual(expected);
    });

    test('returns a buffer from the mid-range components', () => {
      const chunk = Chunk.fromComponents([50, 0, 0], 'Lab');
      const expected = Buffer.from([127, 128, 128]);
      expect(chunk).toEqual(expected);
    });

    test('returns a buffer from the maximum components', () => {
      const chunk = Chunk.fromComponents([100, 127, 127], 'Lab');
      const expected = Buffer.from([255, 255, 255]);
      expect(chunk).toEqual(expected);
    });
  });
});

describe('toComponents', () => {
  describe('RGB', () => {
    test('returns minimum components from the given buffer', () => {
      const components = Chunk.toComponents(Buffer.from([0, 0, 0]), 'RGB');
      const expected = [0, 0, 0];
      expect(components).toEqual(expected);
    });

    test('returns mid-range components from the given buffer', () => {
      const components = Chunk.toComponents(
        Buffer.from([127, 127, 127]),
        'RGB'
      );
      const expected = [127, 127, 127];
      expect(components).toEqual(expected);
    });

    test('returns maximum components from the given buffer', () => {
      const components = Chunk.toComponents(
        Buffer.from([255, 255, 255]),
        'RGB'
      );
      const expected = [255, 255, 255];
      expect(components).toEqual(expected);
    });
  });

  describe('CMYK', () => {
    test('returns minimum components from the given buffer', () => {
      const components = Chunk.toComponents(
        Buffer.from([255, 255, 255, 255]),
        'CMYK'
      );
      const expected = [0, 0, 0, 0];
      expect(components).toEqual(expected);
    });

    test('returns mid-range components from the given buffer', () => {
      const components = Chunk.toComponents(
        Buffer.from([128, 128, 128, 128]),
        'CMYK'
      );
      const expected = [50, 50, 50, 50];
      expect(components).toEqual(expected);
    });

    test('returns maximum components from the given buffer', () => {
      const components = Chunk.toComponents(Buffer.from([0, 0, 0, 0]), 'CMYK');
      const expected = [100, 100, 100, 100];
      expect(components).toEqual(expected);
    });
  });

  describe('Lab', () => {
    test('returns minimum components from the given buffer', () => {
      const components = Chunk.toComponents(Buffer.from([0, 0, 0]), 'Lab');
      const expected = [0, -128, -128];
      expect(components).toEqual(expected);
    });

    test('returns mid-range components from the given buffer', () => {
      const components = Chunk.toComponents(
        Buffer.from([128, 128, 128]),
        'Lab'
      );
      const expected = [50, 0, 0];
      expect(components).toEqual(expected);
    });

    test('returns maximum components from the given buffer', () => {
      const components = Chunk.toComponents(
        Buffer.from([255, 255, 255]),
        'Lab'
      );
      const expected = [100, 127, 127];
      expect(components).toEqual(expected);
    });
  });

  describe('comprehensive rounding tests', () => {
    describe('RGB', () => {
      test('preserves component values', () => {
        let components = null;
        let chunk = null;
        let expected = null;

        for (let component = 0; component <= 255; component++) {
          expected = [component, component, component];
          chunk = Chunk.fromComponents(expected, 'RGB');
          components = Chunk.toComponents(chunk, 'RGB');
          expect(components).toEqual(expected);
        }
      });
    });

    describe('CMYK', () => {
      test('preserves component values', () => {
        let components = null;
        let chunk = null;
        let expected = null;

        for (let component = 0; component <= 100; component++) {
          expected = [component, component, component, component];
          chunk = Chunk.fromComponents(expected, 'CMYK');
          components = Chunk.toComponents(chunk, 'CMYK');
          expect(components).toEqual(expected);
        }
      });
    });

    describe('Lab', () => {
      test('preserves component values', () => {
        let components = null;
        let chunk = null;
        let expected = null;

        for (let component = 0; component <= 100; component++) {
          expected = [component, 0, 0];
          chunk = Chunk.fromComponents(expected, 'Lab');
          components = Chunk.toComponents(chunk, 'Lab');
          expect(components).toEqual(expected);
        }

        for (let component = -128; component <= 127; component++) {
          expected = [0, component, component];
          chunk = Chunk.fromComponents(expected, 'Lab');
          components = Chunk.toComponents(chunk, 'Lab');
          expect(components).toEqual(expected);
        }
      });
    });
  });
});
