import type { JellysplashConfig } from './types';
export interface Preset {
  name: string;
  config: Partial<JellysplashConfig>;
}

export const PRESETS: Preset[] = [
  {
    name: 'Default',
    config: {
      tilt: 0,
      cardSize: 325,
      aspectRatio: 'source',
      gap: 15,
      cornerRadius: 5,
      jitter: 150,
      brightness: 100,
      saturation: 100,
      overlayType: 'none',
      overlayStrength: 100,
      bgColour: '#000000',
    },
  },
];
