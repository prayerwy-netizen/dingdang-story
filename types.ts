export enum AspectRatio {
  SQUARE = '1:1',
  STANDARD = '4:3',
  PORTRAIT = '3:4',
  WIDE = '16:9',
  MOBILE = '9:16',
  CINEMA = '21:9'
}

export enum ImageSize {
  K4 = '4K'
}

export enum GenerationMode {
  GRID_2x2 = '2x2 分镜 (4视图)',
  GRID_3x3 = '3x3 分镜 (9视图)'
}

export interface GeneratedImage {
  id: string;
  url: string;
  fullGridUrl?: string;
  prompt: string;
  aspectRatio: string;
  timestamp: number;
}

export interface Asset {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  analysis?: string;
}

export type InspectorTab = 'details' | 'analysis';