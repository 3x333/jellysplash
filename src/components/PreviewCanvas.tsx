import { useEffect, useRef } from 'react';
import type { ImageItem, JellysplashConfig } from '../types';
import { useSplashRenderer } from '../hooks/useSplashRenderer';

interface PreviewCanvasProps {
  images: ImageItem[];
  config: JellysplashConfig;
  onExportReady: (fn: () => void) => void;
}

export function PreviewCanvas({ images, config, onExportReady }: PreviewCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { canvasRef, exportPng } = useSplashRenderer({ images, config });

  useEffect(() => {
    onExportReady(exportPng);
  }, [exportPng, onExportReady]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const fit = () => {
      const maxW = wrap.clientWidth - 48;
      const maxH = wrap.clientHeight - 48;
      const scale = Math.min(maxW / config.outputWidth, maxH / config.outputHeight, 1);
      canvas.style.width = Math.round(config.outputWidth * scale) + 'px';
      canvas.style.height = Math.round(config.outputHeight * scale) + 'px';
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [config.outputWidth, config.outputHeight, canvasRef]);

  const isEmpty = images.length === 0;

  return (
    <div ref={wrapRef} className="canvas-wrap">
      {isEmpty && (
        <div className="canvas-empty">
          <p>Load some images to get started</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="canvas-preview"
        style={{ display: isEmpty ? 'none' : 'block' }}
      />
    </div>
  );
}
