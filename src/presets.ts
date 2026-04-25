import type { JellysplashConfig } from './types';
export interface Preset {
  name: string;
  config: Partial<JellysplashConfig>;
}

export const PRESETS: Preset[] = [
  {
    name: 'Cinematic',
    config: {
      tilt: -20,
      cardSize: 350,
      aspectRatio: 0.667,
      gap: 12,
      cornerRadius: 4,
      jitter: 80,
      brightness: 85,
      saturation: 90,
      overlayType: 'vignette',
      overlayStrength: 65,
      bgColour: '#000000',
    },
  },
  {
    name: 'Clean Grid',
    config: {
      tilt: 0,
      cardSize: 280,
      aspectRatio: 0.667,
      gap: 8,
      cornerRadius: 8,
      jitter: 0,
      brightness: 100,
      saturation: 100,
      overlayType: 'none',
      bgColour: '#111111',
    },
  },
  {
    name: 'Chaos',
    config: {
      tilt: -30,
      cardSize: 220,
      aspectRatio: 'source',
      gap: 6,
      cornerRadius: 12,
      jitter: 250,
      brightness: 90,
      saturation: 120,
      overlayType: 'vignette',
      overlayStrength: 50,
      bgColour: '#000000',
    },
  },
  {
    name: 'Wide Screen',
    config: {
      tilt: -15,
      cardSize: 400,
      aspectRatio: 1.778,
      gap: 10,
      cornerRadius: 6,
      jitter: 60,
      brightness: 88,
      saturation: 95,
      overlayType: 'gradient',
      overlayStrength: 55,
      bgColour: '#0a0a0a',
    },
  },
  {
    name: 'Poster Wall',
    config: {
      tilt: -8,
      cardSize: 200,
      aspectRatio: 0.667,
      gap: 4,
      cornerRadius: 2,
      jitter: 20,
      brightness: 95,
      saturation: 100,
      overlayType: 'vignette',
      overlayStrength: 40,
      bgColour: '#000000',
    },
  },
];
