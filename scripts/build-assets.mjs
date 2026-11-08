import fs from 'node:fs/promises';
import sharp from 'sharp';

const photos = {
  'hero-construction': { type: 'pexels', id: 12357629, pos: 'centre' },
  'hero-plumbing': { type: 'pexels', id: 5691536, pos: 'centre' },
  'hero-electrical': { type: 'pexels', id: 21812143, pos: 'centre' },
  'hero-technician': { type: 'pexels', id: 26547256, pos: 'centre' },
  'hero-facility': { type: 'pexels', id: 20381389, pos: 'centre' },

  'about-team': { type: 'pexels', id: 36574302, pos: 'centre' },
  'about-site': { type: 'pexels', id: 17797264, pos: 'centre' },
  'industries-bg': { type: 'pexels', id: 34670929, pos: 'centre' },

  'show-construction': { type: 'pexels', id: 17797264, pos: 'centre' },
  'show-welding': { type: 'pexels', id: 30384144, pos: 'centre' },
  'show-electrical': { type: 'pexels', id: 39174676, pos: 'centre' },
  'show-industrial': { type: 'pexels', id: 35072828, pos: 'centre' },
  'show-plumbing': { type: 'pexels', id: 6419128, pos: 'centre' },
  'show-logistics': { type: 'pexels', id: 1267338, pos: 'centre' },
  'show-warehouse': { type: 'pexels', id: 17229385, pos: 'centre' },
  'show-cleaning': { type: 'pexels', id: 20381389, pos: 'centre' },
  'show-hospitality': { type: 'pexels', id: 7820321, pos: 'centre' },
  'show-engineering': { type: 'pexels', id: 33694015, pos: 'centre' },
  'show-carpentry': { type: 'unsplash', id: '1504328345606-18bbc8c9d7d1', pos: 'centre' },
  'show-restaurant': { type: 'unsplash', id: '1414235077428-338989a2e8c0', pos: 'centre' },
  'show-transport': { type: 'unsplash', id: '1578575437130-527eed3abbec', pos: 'centre' },
  'show-healthcare': { type: 'unsplash', id: '1576091160399-112ba8d25d1d', pos: 'centre' },
  'show-site': { type: 'unsplash', id: '1504307651254-35680f356dfd', pos: 'centre' },
};

const flags = ['sa', 'in', 'pk', 'bd', 'np', 'ph', 'lk', 'eg'];

await fs.mkdir('public/images', { recursive: true });
await fs.mkdir('public/flags', { recursive: true });
const report = [];

for (const [name, p] of Object.entries(photos)) {
  const url = p.type === 'pexels'
    ? `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=1800`
    : `https://images.unsplash.com/photo-${p.id}?auto=format&fit=crop&w=1800&q=80`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) { console.log('FAIL', name, r.status); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  const meta = await sharp(buf).metadata();
  // Normalise: 1600px wide max, jpeg q78, strip metadata.
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(`public/images/${name}.jpg`, out);
  report.push(`${name}: ${meta.width}x${meta.height} -> ${(out.length / 1024).toFixed(0)}KB`);
}

for (const code of flags) {
  const r = await fetch(`https://flagcdn.com/w320/${code}.png`);
  if (!r.ok) { console.log('FLAG FAIL', code, r.status); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.writeFile(`public/flags/${code}.png`, buf);
  report.push(`flag ${code}: ${(buf.length / 1024).toFixed(1)}KB`);
}

// Earth textures for the Three.js globe (from the three.js example asset set).
const textures = {
  'earth-map': 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  'earth-specular': 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  'earth-night': 'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  'earth-normal': 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
};
for (const [name, url] of Object.entries(textures)) {
  const r = await fetch(url);
  if (!r.ok) { console.log('TEX FAIL', name, r.status); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  const ext = name === 'earth-night' ? 'png' : 'jpg';
  await fs.writeFile(`public/textures/${name}.${ext}`, buf);
  report.push(`${name}.${ext}: ${(buf.length / 1024).toFixed(0)}KB`);
}

console.log(report.join('\n'));
