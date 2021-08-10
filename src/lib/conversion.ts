import {ColorSpace} from './types';

function roundUp(value: number) {
  return Math.round(Math.abs(value)) * Math.sign(value);
}

const convert = {
  fromComponent: (component: number) => roundUp(component * 255 / 100),
  toComponent: (value: number) => roundUp(value * 100 / 255)
};

interface Converter {
  fromComponents: (components: number[]) => number[];
  toComponents: (values: number[]) => number[];
}

export const conversion: Record<ColorSpace, Converter> = {
  RGB: {
    fromComponents: (components: number[]) => components,
    toComponents: (values: number[]) => values
  },
  CMYK: {
    fromComponents: (components: number[]) => components.map((component) => 255 - convert.fromComponent(component)),
    toComponents: (values: number[]) => values.map((value) => convert.toComponent(255 - value))
  },
  Lab: {
    fromComponents: (components: number[]) => ([
      convert.fromComponent(components[0]),
      components[1] + 128,
      components[2] + 128
    ]),
    toComponents: (values: number[]) => ([
      convert.toComponent(values[0]),
      values[1] - 128,
      values[2] - 128
    ])
  },
};
