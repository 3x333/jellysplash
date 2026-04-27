import type { ImageItem, JellysplashConfig } from '../types';
import { makeRng, seededShuffle } from './rng';

interface ImageMetrics {
  naturalWidth: number;
  naturalHeight: number;
  aspect: number;
  coverCropByAspect: Map<number, CoverCrop>;
}

interface CoverCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

const sharedOffscreenCanvas = document.createElement('canvas');
const sharedOffscreenCtx = sharedOffscreenCanvas.getContext('2d')!;
const perspectiveColumnCanvas = document.createElement('canvas');
const perspectiveColumnCtx = perspectiveColumnCanvas.getContext('2d')!;
const imageMetricsCache = new WeakMap<HTMLImageElement, ImageMetrics>();
const shuffledImagesCache = new WeakMap<ImageItem[], Map<number, ImageItem[]>>();
const solidOverlayCache = new Map<string, string>();

export function drawSplash(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  images: ImageItem[],
  config: JellysplashConfig,
): void {
  const { tilt, perspective, bgColour } = config;
  const tiltRad = (tilt * Math.PI) / 180;
  const diag = Math.ceil(Math.sqrt(W * W + H * H));
  // Vertical extent (in rotated space) needed to cover all four canvas corners
  const coverH = Math.ceil(
    2 * ((W / 2) * Math.abs(Math.sin(tiltRad)) + (H / 2) * Math.abs(Math.cos(tiltRad))),
  );
  const minScale = perspective !== 0 ? 1 - Math.abs(perspective) : 1;
  const srcH = Math.ceil(coverH / minScale);

  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, W, H);

  if (images.length === 0) return;

  // Render cards flat (no tilt) into a diagonal-wide offscreen so rotation has coverage
  const off = sharedOffscreenCanvas;
  const offCtx = sharedOffscreenCtx;
  resizeCanvas(off, diag, srcH);
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.fillStyle = bgColour;
  offCtx.fillRect(0, 0, diag, srcH);
  drawCards(offCtx, diag, srcH, diag, images, config);

  // Translate to canvas centre, rotate by tilt, then apply perspective strips.
  // The strips are drawn centred at (0,0) in the rotated space so the content
  // is always centred on the output canvas regardless of tilt angle.
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(W / 2, H / 2);
  ctx.rotate(tiltRad);
  applyPerspective(ctx, off, diag, coverH, perspective);
  ctx.restore();

  drawOverlay(ctx, W, H, config);
}

function drawCards(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  diag: number,
  images: ImageItem[],
  config: JellysplashConfig,
): void {
  const { cardSize, gap, cornerRadius, aspectRatio, jitter, brightness, saturation, seed } = config;
  const hasRoundedCorners = cornerRadius > 0;

  ctx.save();
  ctx.translate(W / 2, H / 2);

  const shuffled = getShuffledImages(images, seed);
  const rng = makeRng(seed);
  let imgIdx = 0;

  ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;

  if (aspectRatio === 'source') {
    const cardH = cardSize;
    const numRows = Math.ceil(diag / (cardH + gap)) + 2;
    const originY = -Math.ceil(numRows / 2) * (cardH + gap);

    for (let row = 0; row < numRows; row++) {
      const rowOffset = (rng() - 0.5) * jitter;
      const y = originY + row * (cardH + gap);
      let x = -(diag + cardSize * 4) / 2 + rowOffset;

      while (x < (diag + cardSize * 4) / 2) {
        const { img } = shuffled[imgIdx % shuffled.length];
        imgIdx++;
        const cardW = Math.floor(cardH * getImageMetrics(img).aspect);

        if (hasRoundedCorners) {
          drawRoundedImage(ctx, img, x, y, cardW, cardH, cornerRadius, getCoverCrop(img, cardW / cardH));
        } else {
          drawImageCover(ctx, img, x, y, cardW, cardH);
        }
        x += cardW + gap;
      }
    }
  } else {
    const cardW = cardSize;
    const cardH = Math.floor(cardW / (aspectRatio as number));
    const numCols = Math.ceil(diag / (cardW + gap)) + 2;
    const numRows = Math.ceil(diag / (cardH + gap)) + 2;
    const originX = -Math.ceil(numCols / 2) * (cardW + gap);
    const originY = -Math.ceil(numRows / 2) * (cardH + gap);

    for (let row = 0; row < numRows; row++) {
      const rowOffset = (rng() - 0.5) * jitter;

      for (let col = 0; col < numCols; col++) {
        const x = originX + col * (cardW + gap) + rowOffset;
        const y = originY + row * (cardH + gap);
        const { img } = shuffled[imgIdx % shuffled.length];
        imgIdx++;

        if (hasRoundedCorners) {
          drawRoundedImage(ctx, img, x, y, cardW, cardH, cornerRadius, getCoverCrop(img, cardW / cardH));
        } else {
          drawImageCoverWithCrop(ctx, img, getCoverCrop(img, cardW / cardH), x, y, cardW, cardH);
        }
      }
    }
  }

  ctx.filter = 'none';
  ctx.restore();
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  config: JellysplashConfig,
): void {
  const { overlayType, overlayStrength, overlayColour } = config;
  const alpha = overlayStrength / 100;

  if (overlayType === 'vignette') {
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else if (overlayType === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(0,0,0,${alpha * 0.8})`);
    grad.addColorStop(0.4, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  } else if (overlayType === 'solid') {
    ctx.fillStyle = getSolidOverlayColour(overlayColour, alpha);
    ctx.fillRect(0, 0, W, H);
  }
}

// Draws `src` as a perspective warp, centred at (0,0) in `dst`'s current
// transform. We render into a narrow-column intermediate so there is no triangle
// seam and the destination only composites smooth vertical spans.
function applyPerspective(
  dst: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  dstW: number,
  dstH: number,
  perspective: number,
): void {
  const srcCenterY = src.height / 2;

  if (Math.abs(perspective) < 0.001) {
    dst.drawImage(src, 0, srcCenterY - dstH / 2, src.width, dstH, -dstW / 2, -dstH / 2, dstW, dstH);
    return;
  }

  const columnWidth = dstW > 1400 ? 2 : 1;
  const columns = Math.max(1, Math.ceil(dstW / columnWidth));
  resizeCanvas(perspectiveColumnCanvas, columns, dstH);
  perspectiveColumnCtx.setTransform(1, 0, 0, 1, 0, 0);
  perspectiveColumnCtx.clearRect(0, 0, columns, dstH);
  perspectiveColumnCtx.imageSmoothingEnabled = true;
  perspectiveColumnCtx.imageSmoothingQuality = 'high';

  for (let col = 0; col < columns; col++) {
    const x0t = col / columns;
    const x1t = (col + 1) / columns;
    const srcX = x0t * src.width;
    const srcSampleW = Math.max(1, (x1t - x0t) * src.width + 0.5);
    const scale = perspectiveScale(perspective, (x0t + x1t) / 2);
    const srcSampleH = dstH / scale;
    const srcSampleY = srcCenterY - srcSampleH / 2;

    perspectiveColumnCtx.drawImage(
      src,
      srcX,
      srcSampleY,
      srcSampleW,
      srcSampleH,
      col,
      0,
      1,
      dstH,
    );
  }

  dst.drawImage(
    perspectiveColumnCanvas,
    0,
    0,
    columns,
    dstH,
    -dstW / 2,
    -dstH / 2,
    dstW,
    dstH,
  );
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  drawImageCoverWithCrop(ctx, img, getCoverCrop(img, w / h), x, y, w, h);
}

function drawImageCoverWithCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: CoverCrop,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  cornerRadius: number,
  crop: CoverCrop,
): void {
  ctx.save();
  roundedRectPath(ctx, x, y, w, h, cornerRadius);
  ctx.clip();
  drawImageCoverWithCrop(ctx, img, crop, x, y, w, h);
  ctx.restore();
}

function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}

function getShuffledImages(images: ImageItem[], seed: number): ImageItem[] {
  let bySeed = shuffledImagesCache.get(images);
  if (!bySeed) {
    bySeed = new Map<number, ImageItem[]>();
    shuffledImagesCache.set(images, bySeed);
  }

  const cacheKey = seed * 7 + 13;
  let shuffled = bySeed.get(cacheKey);
  if (!shuffled) {
    shuffled = seededShuffle(images, makeRng(cacheKey));
    bySeed.set(cacheKey, shuffled);
  }

  return shuffled;
}

function getImageMetrics(img: HTMLImageElement): ImageMetrics {
  let metrics = imageMetricsCache.get(img);
  if (!metrics) {
    metrics = {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      aspect: img.naturalWidth / img.naturalHeight,
      coverCropByAspect: new Map<number, CoverCrop>(),
    };
    imageMetricsCache.set(img, metrics);
  }

  return metrics;
}

function getCoverCrop(img: HTMLImageElement, targetAspect: number): CoverCrop {
  const metrics = getImageMetrics(img);
  let crop = metrics.coverCropByAspect.get(targetAspect);
  if (crop) return crop;

  let sx = 0;
  let sy = 0;
  let sw = metrics.naturalWidth;
  let sh = metrics.naturalHeight;

  if (metrics.aspect > targetAspect) {
    sw = metrics.naturalHeight * targetAspect;
    sx = (metrics.naturalWidth - sw) / 2;
  } else if (metrics.aspect < targetAspect) {
    sh = metrics.naturalWidth / targetAspect;
    sy = (metrics.naturalHeight - sh) / 2;
  }

  crop = { sx, sy, sw, sh };
  metrics.coverCropByAspect.set(targetAspect, crop);
  return crop;
}

function getSolidOverlayColour(overlayColour: string, alpha: number): string {
  const cacheKey = `${overlayColour}:${alpha}`;
  const cached = solidOverlayCache.get(cacheKey);
  if (cached) return cached;

  const r = parseInt(overlayColour.slice(1, 3), 16);
  const g = parseInt(overlayColour.slice(3, 5), 16);
  const b = parseInt(overlayColour.slice(5, 7), 16);
  const rgba = `rgba(${r},${g},${b},${alpha})`;
  solidOverlayCache.set(cacheKey, rgba);
  return rgba;
}

function perspectiveScale(perspective: number, t: number): number {
  return perspective < 0 ? 1 + perspective * (1 - t) : 1 - perspective * t;
}
