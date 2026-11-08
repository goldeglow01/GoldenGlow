import fs from 'node:fs/promises';
import sharp from 'sharp';
const ids=[6474205,14308927,36574302,38706752,34670929,17797264,5378695,7820321,1267338,16368408,5691536,38709545];
await fs.mkdir('tmp/pexels',{recursive:true});
const ok=[];
for(const id of ids){const dest=`tmp/pexels/${id}.jpg`;
 const url=`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});
 if(!r.ok){console.log('FAIL',r.status,id);continue;}
 const b=Buffer.from(await r.arrayBuffer()); if(b.length<8000){console.log('SMALL',id);continue;}
 await fs.writeFile(dest,b); ok.push(id);}
const cw=300,ch=260,cols=4,per=12,rows=Math.ceil(ok.length/cols);const comps=[];
for(let i=0;i<ok.length;i++){const img=await sharp(`tmp/pexels/${ok[i]}.jpg`).resize(cw,ch,{fit:'cover'}).toBuffer();
 const label=Buffer.from(`<svg width="${cw}" height="44"><rect width="${cw}" height="44" fill="rgba(0,0,0,.7)"/><text x="10" y="30" font-family="Arial" font-size="24" fill="#fff">${ok[i]}</text></svg>`);
 comps.push({input:img,top:Math.floor(i/cols)*ch,left:(i%cols)*cw});
 comps.push({input:label,top:Math.floor(i/cols)*ch,left:(i%cols)*cw});}
await sharp({create:{width:cw*cols,height:ch*rows,channels:3,background:'#222'}}).composite(comps).jpeg({quality:75}).toFile('tmp/p-sheet-3.jpg');
console.log('ok',ok.length);
