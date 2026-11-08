import fs from 'node:fs/promises';
import sharp from 'sharp';

const ids = [
  7788227, 28196526, 12357629, 26547256, 11321790, 8961403,
  6419128, 21812143, 39174676, 14319099, 33694019,
  40012866, 33694015, 35072828, 32588552, 34054478,
  33357392, 20381389,
  30384144, 34040514, 30768944, 26864336, 9729626,
  17229385, 30824313, 1267329, 4483556, 13532504,
];

await fs.mkdir('tmp/pexels', { recursive: true });
const ok = [];
for (const id of ids) {
  const dest = `tmp/pexels/${id}.jpg`;
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) { console.log('FAIL', r.status, id); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 8000) { console.log('SMALL', id); continue; }
    await fs.writeFile(dest, buf);
    ok.push(id);
  } catch (e) { console.log('ERR', id, e.message); }
}
console.log('downloaded', ok.length, 'of', ids.length);

const per = 15, cw = 300, ch = 260, cols = 5;
for (let s = 0; s * per < ok.length; s++) {
  const slice = ok.slice(s * per, s * per + per);
  const rows = Math.ceil(slice.length / cols);
  const composites = [];
  for (let i = 0; i < slice.length; i++) {
    const img = await sharp(`tmp/pexels/${slice[i]}.jpg`).resize(cw, ch, { fit: 'cover' }).toBuffer();
    const label = Buffer.from(`<svg width="${cw}" height="44"><rect width="${cw}" height="44" fill="rgba(0,0,0,.7)"/><text x="10" y="30" font-family="Arial" font-size="24" fill="#fff">${slice[i]}</text></svg>`);
    composites.push({ input: img, top: Math.floor(i / cols) * ch, left: (i % cols) * cw });
    composites.push({ input: label, top: Math.floor(i / cols) * ch, left: (i % cols) * cw });
  }
  await sharp({ create: { width: cw * cols, height: ch * rows, channels: 3, background: '#222' } })
    .composite(composites).jpeg({ quality: 75 }).toFile(`tmp/p-sheet-${s + 1}.jpg`);
}
