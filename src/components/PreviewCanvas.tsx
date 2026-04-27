import { useEffect, useRef, useState } from 'react';
import type { ImageItem, JellysplashConfig } from '../types';
import type { BenchmarkReport } from '../hooks/useSplashRenderer';
import { useSplashRenderer } from '../hooks/useSplashRenderer';

interface PreviewCanvasProps {
  images: ImageItem[];
  config: JellysplashConfig;
  onExportReady: (fn: () => void) => void;
}

export function PreviewCanvas({ images, config, onExportReady }: PreviewCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { canvasRef, exportPng, runBenchmark, lastPreviewMs } = useSplashRenderer({ images, config });
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);

  useEffect(() => {
    onExportReady(exportPng);
  }, [exportPng, onExportReady]);

  useEffect(() => {
    setBenchmarkReport(null);
  }, [images, config]);

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
  const handleRunBenchmark = async () => {
    setBenchmarking(true);
    try {
      const report = await runBenchmark();
      setBenchmarkReport(report);
    } finally {
      setBenchmarking(false);
    }
  };

  return (
    <div ref={wrapRef} className="canvas-wrap">
      <aside className="benchmark-panel">
        <div className="benchmark-panel__header">
          <strong>Benchmark</strong>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleRunBenchmark}
            disabled={isEmpty || benchmarking}
          >
            {benchmarking ? 'Running...' : 'Run benchmark'}
          </button>
        </div>
        <p className="benchmark-panel__meta">
          Preview: {lastPreviewMs == null ? 'n/a' : `${lastPreviewMs.toFixed(1)} ms`}
        </p>
        <p className="benchmark-panel__meta">
          Images: {images.length} | Output: {config.outputWidth}x{config.outputHeight}
        </p>
        <p className="benchmark-panel__meta">Benchmarks exclude warm-up runs and force a canvas readback.</p>
        {benchmarkReport && (
          <div className="benchmark-results">
            {benchmarkReport.samples.map((sample) => (
              <div key={sample.label} className="benchmark-sample">
                <div className="benchmark-sample__title">
                  <span>{sample.label}</span>
                  <span>
                    {sample.width}x{sample.height}
                  </span>
                </div>
                <div className="benchmark-sample__stats">
                  <span>median {sample.medianMs.toFixed(1)} ms</span>
                  <span>p95 {sample.p95Ms.toFixed(1)} ms</span>
                  <span>min {sample.minMs.toFixed(1)} ms</span>
                  <span>max {sample.maxMs.toFixed(1)} ms</span>
                  <span>{sample.iterations} runs</span>
                  <span>{sample.warmupRuns} warm-up</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
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
