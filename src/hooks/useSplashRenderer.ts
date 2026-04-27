import { useEffect, useRef, useCallback, useState } from 'react';
import type { ImageItem, JellysplashConfig } from '../types';
import { drawSplash } from '../lib/renderer';

interface UseSplashRendererOptions {
  images: ImageItem[];
  config: JellysplashConfig;
}

export interface BenchmarkSample {
  label: string;
  width: number;
  height: number;
  iterations: number;
  warmupRuns: number;
  medianMs: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
}

export interface BenchmarkReport {
  imageCount: number;
  samples: BenchmarkSample[];
}

export function useSplashRenderer({ images, config }: UseSplashRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const benchmarkCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [lastPreviewMs, setLastPreviewMs] = useState<number | null>(null);

  const drawToCanvas = useCallback(
    (canvas: HTMLCanvasElement, W: number, H: number, forceFlush = false) => {
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const t0 = performance.now();
      drawSplash(ctx, W, H, images, config);
      if (forceFlush) {
        forceCanvasFlush(ctx, canvas);
      }
      return performance.now() - t0;
    },
    [images, config],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { outputWidth: W, outputHeight: H } = config;
    const duration = drawToCanvas(canvas, W, H);
    if (duration != null) {
      setLastPreviewMs(duration);
    }
  }, [config, drawToCanvas]);

  useEffect(() => {
    const id = setTimeout(draw, 60);
    return () => clearTimeout(id);
  }, [draw]);

  const exportPng = useCallback(() => {
    const { outputWidth: W, outputHeight: H } = config;
    const offscreen = document.createElement('canvas');
    if (drawToCanvas(offscreen, W, H) == null) return;
    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jellysplash-${W}x${H}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [config, drawToCanvas, images]);

  const runBenchmark = useCallback(async (): Promise<BenchmarkReport> => {
    const benchmarkCanvas = benchmarkCanvasRef.current;
    const presets = [
      {
        label: 'Current',
        width: config.outputWidth,
        height: config.outputHeight,
        iterations: 12,
        warmupRuns: 3,
      },
      { label: '720p', width: 1280, height: 720, iterations: 16, warmupRuns: 3 },
      { label: '1080p', width: 1920, height: 1080, iterations: 12, warmupRuns: 3 },
      { label: '4K', width: 3840, height: 2160, iterations: 6, warmupRuns: 2 },
    ];

    const samples: BenchmarkSample[] = [];

    for (const preset of presets) {
      const times: number[] = [];
      const totalRuns = preset.warmupRuns + preset.iterations;

      for (let i = 0; i < totalRuns; i++) {
        const ms = drawToCanvas(benchmarkCanvas, preset.width, preset.height, true);
        if (ms != null) {
          if (i >= preset.warmupRuns) {
            times.push(ms);
          }
        }
        await nextFrame();
      }

      samples.push({
        label: preset.label,
        width: preset.width,
        height: preset.height,
        iterations: times.length,
        warmupRuns: preset.warmupRuns,
        medianMs: percentile(times, 0.5),
        p95Ms: percentile(times, 0.95),
        minMs: times.length > 0 ? Math.min(...times) : 0,
        maxMs: times.length > 0 ? Math.max(...times) : 0,
      });
    }

    return {
      imageCount: images.length,
      samples,
    };
  }, [config.outputHeight, config.outputWidth, drawToCanvas, images.length]);

  return { canvasRef, exportPng, runBenchmark, lastPreviewMs };
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function forceCanvasFlush(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const sampleX = Math.max(0, Math.min(canvas.width - 1, canvas.width >> 1));
  const sampleY = Math.max(0, Math.min(canvas.height - 1, canvas.height >> 1));
  ctx.getImageData(sampleX, sampleY, 1, 1);
}
