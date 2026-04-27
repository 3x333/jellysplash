export interface ImageItem {
  img: HTMLImageElement;
  name: string;
  url: string;
}

export interface JellysplashConfig {
  outputWidth: number;
  outputHeight: number;

  cardSize: number;

  tilt: number;
  perspective: number;
  gap: number;
  cornerRadius: number;
  aspectRatio: number | 'source';
  jitter: number;

  brightness: number;
  saturation: number;
  overlayStrength: number;
  bgColour: string;
  overlayType: 'none' | 'solid' | 'gradient' | 'vignette';
  overlayColour: string;

  seed: number;
}

export const DEFAULT_CONFIG: JellysplashConfig = {
  outputWidth: 1920,
  outputHeight: 1080,
  cardSize: 325,
  tilt: 0,
  perspective: 0,
  gap: 15,
  cornerRadius: 5,
  aspectRatio: 'source',
  jitter: 150,
  brightness: 100,
  saturation: 100,
  overlayStrength: 100,
  bgColour: '#000000',
  overlayType: 'none',
  overlayColour: '#000000',
  seed: 69,
};
