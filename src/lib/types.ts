export type ColorSpace = 'RGB' | 'CMYK' | 'Lab';

export interface Color {
  name: string;
  code: string;
  components: Array<number>;
}

export interface ColorBook {
  id: number;
  title: string;
  colorNamePrefix: string;
  colorNameSuffix: string;
  description: string;
  pageSize: number;
  pageMidPoint: number;
  colorSpace: ColorSpace;
  colors: Array<Color>;
  isSpot: boolean;
}