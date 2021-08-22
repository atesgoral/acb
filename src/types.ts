export type ColorModel = 'RGB' | 'CMYK' | 'Lab';

export interface Color {
  name: string;
  code: string;
  components: number[];
}

export interface ColorBook {
  id: number;
  title: string;
  colorNamePrefix: string;
  colorNamePostfix: string;
  description: string;
  pageSize: number;
  pageKey: number;
  colorModel: ColorModel;
  colors: Color[];
  isSpot: boolean;
}
