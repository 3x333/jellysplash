import type { ImageItem, JellysplashConfig } from '../types';
import { makeRng, seededShuffle } from './rng';

export function drawSplash(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  images: ImageItem[],
  config: JellysplashConfig,
): void {
  const {
    columns,
    gap,
    tilt,
    cornerRadius,
    aspectRatio,
    jitter,
    brightness,
    saturation,
    bgColour,
    overlayType,
    overlayStrength,
    overlayColour,
    seed,
  } = config;

  // If aspectRatio is 'source', use average ratio of loaded images
  const effectiveRatio: number =
    aspectRatio === 'source'
      ? images.reduce((sum, { img }) => sum + img.naturalWidth / img.naturalHeight, 0) /
        images.length
      : aspectRatio;

  // 1. Derive card size from column count
  const cardW = Math.floor((W - (columns - 1) * gap) / columns);
  const cardH = Math.floor(cardW / effectiveRatio);

  // 2. Background
  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, W, H);

  if (images.length === 0) return;

  // 3. Rotate canvas around centre
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate((tilt * Math.PI) / 180);

  const diag = Math.ceil(Math.sqrt(W * W + H * H));
  const numCols = Math.ceil(diag / (cardW + gap)) + 2;
  const numRows = Math.ceil(diag / (cardH + gap)) + 2;

  const originX = -Math.ceil(numCols / 2) * (cardW + gap);
  const originY = -Math.ceil(numRows / 2) * (cardH + gap);

  // 4. Shuffle images deterministically using the seed
  const shuffled = seededShuffle(images, makeRng(seed * 7 + 13));
  const rng = makeRng(seed);
  let imgIdx = 0;

  ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;

  // 5. Draw tiles
  for (let row = 0; row < numRows; row++) {
    const rowOffset = (rng() - 0.5) * jitter;

    for (let col = 0; col < numCols; col++) {
      const x = originX + col * (cardW + gap) + rowOffset;
      const y = originY + row * (cardH + gap);
      const { img } = shuffled[imgIdx % shuffled.length];
      imgIdx++;

      ctx.save();
      if (cornerRadius > 0) {
        roundedRectPath(ctx, x, y, cardW, cardH, cornerRadius);
        ctx.clip();
      }
      drawImageCover(ctx, img, x, y, cardW, cardH);
      ctx.restore();
    }
  }

  ctx.filter = 'none';
  ctx.restore();

  // 6. Overlay
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
    const r = parseInt(overlayColour.slice(1, 3), 16);
    const g = parseInt(overlayColour.slice(3, 5), 16);
    const b = parseInt(overlayColour.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }
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
  const iAspect = img.naturalWidth / img.naturalHeight;
  const cAspect = w / h;
  let sx = 0,
    sy = 0,
    sw = img.naturalWidth,
    sh = img.naturalHeight;

  if (iAspect > cAspect) {
    sw = img.naturalHeight * cAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / cAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
