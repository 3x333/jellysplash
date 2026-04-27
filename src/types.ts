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
<<<<<<< HEAD
  perspective: number;
=======
>>>>>>> f012609018e7c62d8c02622f2293d2f433f3e5bc
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
  cardSize: 300,
  tilt: -15,
<<<<<<< HEAD
  perspective: 0,
=======
>>>>>>> f012609018e7c62d8c02622f2293d2f433f3e5bc
  gap: 8,
  cornerRadius: 8,
  aspectRatio: 'source',
  jitter: 0,
  brightness: 100,
  saturation: 100,
  overlayStrength: 50,
  bgColour: '#000000',
  overlayType: 'vignette',
  overlayColour: '#000000',
  seed: 69,
};
