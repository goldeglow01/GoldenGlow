/**
 * Builds the wide hero photos.
 *
 * The source photos are portrait shots of real workers. Dropped into a wide
 * full-bleed hero with `object-fit: cover` they were cropped to a slice of
 * background, so the person either disappeared or looked oversized.
 *
 * Each output is composed the way premium recruitment sites do it:
 *   - a darkened, strongly blurred version of the same photo fills the frame,
 *   - the sharp photo, cropped around the worker, sits on the right and fades
 *     into the blur, leaving the left side clean for the headline.
 *
 * Crop boxes are fractions of the source image, so they stay correct whatever
 * resolution the source is re-downloaded at.
 *
 * Run: node scripts/hero-crops.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const W = 1800;
const H = 820;

/** x/y/w/h are 0–1 fractions of the source image. */
const slides = [
  {
    id: 'construction',
    src: 'public/images/hero-construction.jpg',
    crop: { x: 0.14, y: 0.32, w: 0.72, h: 0.48 },
  },
  {
    id: 'plumbing',
    src: 'public/images/hero-plumbing.jpg',
    crop: { x: 0.08, y: 0.3, w: 0.84, h: 0.5 },
  },
  {
    id: 'electrical',
    src: 'public/images/hero-electrical.jpg',
    crop: { x: 0.42, y: 0.16, w: 0.56, h: 0.5 },
  },
  {
    id: 'technician',
    src: 'public/images/show-industrial.jpg',
    crop: { x: 0.18, y: 0.03, w: 0.74, h: 0.55 },
  },
  {
    id: 'facility',
    src: 'public/images/hero-facility.jpg',
    crop: { x: 0.3, y: 0.47, w: 0.52, h: 0.44 },
  },
];

await mkdir('public/images/hero', { recursive: true });

for (const slide of slides) {
  const meta = await sharp(slide.src).metadata();

  const box = {
    left: Math.round(slide.crop.x * meta.width),
    top: Math.round(slide.crop.y * meta.height),
    width: Math.round(slide.crop.w * meta.width),
    height: Math.round(slide.crop.h * meta.height),
  };
  box.width = Math.min(box.width, meta.width - box.left);
  box.height = Math.min(box.height, meta.height - box.top);

  // Backdrop: same scene, heavily blurred and darkened so it reads as depth.
  const backdrop = await sharp(slide.src)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .blur(38)
    .modulate({ brightness: 0.34, saturation: 0.8 })
    .toBuffer();

  // Foreground: sharp crop at frame height, kept at its own proportions.
  const fgHeight = H;
  const fgWidth = Math.round((box.width / box.height) * fgHeight);
  const fgLeft = W - fgWidth - 60;

  const fg = await sharp(slide.src)
    .extract(box)
    .resize(fgWidth, fgHeight, { fit: 'cover' })
    .toBuffer();

  // Alpha ramp: transparent at the left edge, opaque by 38% across.
  const maskSvg = `<svg width="${fgWidth}" height="${fgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000"/>
          <stop offset="0.12" stop-color="#1a1a1a"/>
          <stop offset="0.4" stop-color="#fff"/>
        </linearGradient>
      </defs>
      <rect width="${fgWidth}" height="${fgHeight}" fill="url(#g)"/>
    </svg>`;

  const maskRaw = await sharp(Buffer.from(maskSvg)).greyscale().raw().toBuffer();

  const masked = await sharp(fg)
    .ensureAlpha()
    .joinChannel(maskRaw, { raw: { width: fgWidth, height: fgHeight, channels: 1 } })
    .png()
    .toBuffer();

  const out = path.join('public/images/hero', `${slide.id}.jpg`);
  await sharp(backdrop)
    .composite([{ input: masked, left: fgLeft, top: 0, blend: 'over' }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);

  console.log(`${out}  crop ${box.width}x${box.height} -> fg ${fgWidth}x${fgHeight} at x=${fgLeft}`);
}
