import fs from 'node:fs/promises';
import sharp from 'sharp';

const ids = [
  '1504307651254-35680f356dfd',
  '1504328345606-18bbc8c9d7d1',
  '1531834685032-c34bf0d84c77',
  '1581094794329-c8112a89af12',
  '1541888946425-d81bb19240f5',
  '1517089596392-fb9a9033e05b',
  '1581092160562-40aa08e78837',
  '1581092918056-0c4c3acd3789',
  '1581093458791-9f3c3900df4b',
  '1581093588401-fbb62a02f120',
  '1581091226825-a6a2a5aee158',
  '1621905251189-08b45d6a269e',
  '1607472586893-edb57bdc0e39',
  '1541976590-713941681591',
  '1517048676732-d65bc937f952',
  '1521737711867-e3b97375f902',
  '1542621334-a254cf47733d',
  '1586528116311-ad8dd3c8310d',
  '1530124566582-a618bc2615dc',
  '1600585154340-be6161a56a0c',
  '1556761175-b413da4baf72',
  '1581578731548-c64695cc6952',
  '1584820927498-cfe5211fd8bf',
  '1503387762-592deb58ef4e',
  '1504917595217-d4dc5ebe6122',
  '1565043666747-69f6646db940',
  '1519567241046-7f570eee3ce6',
  '1566073771259-6a8506099945',
  '1556910103-1c02745aae4d',
  '1414235077428-338989a2e8c0',
  '1589939705384-5185137a7f0f',
  '1553413077-190dd305871c',
  '1578575437130-527eed3abbec',
  '1502819460330-cf5e4d1629c9',
  '1521737604893-d14cc237f11d',
  '1522071820081-009f0129c71c',
  '1519003722824-194d4455a60c',
  '1595246140625-573b715d11dc',
  '1615874959474-d609969a20ed',
  '1590725140246-20acdee442be',
  '1576091160399-112ba8d25d1d',
  '1581093450021-4a7360e9a6b5',
  '1544197150-b99a580bb7a8',
  '1621905251918-48416bd8575a',
  '1486406146926-c627a92ad1ab',
  '1497366216548-37526070297c',
  '1503389152951-9f343605f61e',
  '1524758631624-e2822e304c36',
];

await fs.mkdir('tmp/candidates', { recursive: true });

const ok = [];
for (const id of ids) {
  const dest = `tmp/candidates/${id}.jpg`;
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=70`;
  const r = await fetch(url);
  if (!r.ok) { console.log('FAIL', r.status, id); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 8000) { console.log('SMALL', id); continue; }
  await fs.writeFile(dest, buf);
  ok.push(id);
}
console.log('downloaded', ok.length, 'of', ids.length);

// Build contact sheets: 4 cols, 5 rows, each cell 260x200 with index label.
const per = 20;
const cw = 260, ch = 200, cols = 4;
for (let s = 0; s * per < ok.length; s++) {
  const slice = ok.slice(s * per, s * per + per);
  const rows = Math.ceil(slice.length / cols);
  const W = cw * cols, H = ch * rows;
  const composites = [];
  for (let i = 0; i < slice.length; i++) {
    const img = await sharp(`tmp/candidates/${slice[i]}.jpg`).resize(cw, ch, { fit: 'cover' }).toBuffer();
    const label = Buffer.from(
      `<svg width="${cw}" height="40"><rect width="${cw}" height="40" fill="rgba(0,0,0,.65)"/><text x="10" y="27" font-family="Arial" font-size="22" fill="#fff">#${s * per + i + 1}</text></svg>`
    );
    composites.push({ input: img, top: Math.floor(i / cols) * ch, left: (i % cols) * cw });
    composites.push({ input: label, top: Math.floor(i / cols) * ch, left: (i % cols) * cw });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
    .composite(composites)
    .jpeg({ quality: 72 })
    .toFile(`tmp/sheet-${s + 1}.jpg`);
  console.log('sheet', s + 1, slice.join(' '));
}
