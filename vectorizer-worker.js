// Vectorizer Worker: quantization -> marching squares -> simplify -> SVG

self.onmessage = (e) => {
  try {
    const { dataBuffer, w, h, settings } = e.data;
    const data = new Uint8ClampedArray(dataBuffer); // RGBA
    const { mode, k, fidelity, minArea, ignoreWhite, autoClean, curves, tension } = settings;

    const imgData = { data, width: w, height: h };
    if (autoClean) {
      const analysis = analyzeImage(data, w, h);
      if (analysis.lowContrast) contrastStretch(imgData, analysis.channels);
      if (analysis.saltPepper && w*h <= 2_000_000) median3x3(imgData);
    }

    const { labels, palette } = quantize(imgData, w, h, k, mode);
    const eps = Math.max(0.3, (8 - fidelity) * 0.8);
    const svg = buildSVG(labels, palette, w, h, { eps, minArea, ignoreWhite, curves, tension });
    self.postMessage({ ok: true, svg });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message || err) });
  }
};

function buildSVG(labels, palette, w, h, opts) {
  const { eps, minArea, ignoreWhite, curves, tension } = opts;
  let paths = '';
  for (let ci = 0; ci < palette.length; ci++) {
    const [r,g,b] = palette[ci];
    if (ignoreWhite && r > 246 && g > 246 && b > 246) continue;
    const mask = new Uint8Array(w*h);
    for (let i = 0; i < labels.length; i++) mask[i] = (labels[i] === ci) ? 1 : 0;
    const polys = marchingSquares(mask, w, h);
    for (const poly of polys) {
      if (poly.length < 3) continue;
      const simp = rdp(poly, eps);
      const area = Math.abs(polygonArea(simp));
      if (area < minArea) continue;
      const d = curves ? pathDCurve(simp, tension) : pathDLinear(simp);
      paths += `<path d="${d}" fill="rgb(${r},${g},${b})" stroke="none"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${paths}</svg>`;
}

// --- Quantization ---
function quantize(imgData, w, h, k, mode) {
  const data = imgData.data;
  if (mode === 'bw') {
    const hist = new Uint32Array(256);
    for (let i = 0; i < data.length; i += 4) {
      const y = (0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2])|0;
      hist[y]++;
    }
    let total = w*h; let sum1 = 0; for (let t = 0; t < 256; t++) sum1 += t * hist[t];
    let sumB = 0, wB = 0, maxVar = -1, threshold = 127;
    for (let t = 0; t < 256; t++) {
      wB += hist[t]; if (!wB) continue;
      const wF = total - wB; if (!wF) break;
      sumB += t * hist[t];
      const mB = sumB / wB; const mF = (sum1 - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > maxVar) { maxVar = between; threshold = t; }
    }
    const labels = new Uint16Array(w*h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const y = (0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2])|0;
      labels[p] = y > threshold ? 1 : 0;
    }
    const palette = [[0,0,0],[255,255,255]];
    return { labels, palette };
  }
  if (mode === 'gray') {
    const k1 = Math.max(2, Math.min(64, k|0));
    const Ys = new Uint8Array(w*h);
    for (let i = 0, p=0; i < data.length; i += 4, p++) Ys[p] = (0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2])|0;
    const centers = new Float32Array(k1);
    for (let i = 0; i < k1; i++) centers[i] = (255*(i+0.5))/k1;
    const labels = new Uint16Array(w*h);
    for (let iter=0; iter<8; iter++) {
      for (let p=0; p<Ys.length; p++) {
        let best=0, bestD=1e9, y=Ys[p];
        for (let c=0; c<k1; c++) { const d=Math.abs(y-centers[c]); if (d<bestD){bestD=d; best=c;} }
        labels[p]=best;
      }
      const sum = new Float64Array(k1); const cnt=new Uint32Array(k1);
      for (let p=0; p<Ys.length; p++){ sum[labels[p]] += Ys[p]; cnt[labels[p]]++; }
      for (let c=0; c<k1; c++) if (cnt[c]) centers[c]=sum[c]/cnt[c];
    }
    const palette = Array.from(centers).map(v => { const g = Math.max(0, Math.min(255, Math.round(v))); return [g,g,g]; });
    return { labels, palette };
  }
  // color
  const k3 = Math.max(2, Math.min(64, k|0));
  const total = w*h;
  const sampleStep = total > 1_000_000 ? 8 : total > 300_000 ? 4 : 2;
  const samples = [];
  for (let y = 0; y < h; y += sampleStep) {
    for (let x = 0; x < w; x += sampleStep) {
      const i = (y*w + x) * 4;
      samples.push([data[i], data[i+1], data[i+2]]);
    }
  }
  const centers = new Float32Array(k3*3);
  for (let c=0; c<k3; c++){ const s=samples[Math.floor(Math.random()*samples.length)]; centers[c*3]=s[0]; centers[c*3+1]=s[1]; centers[c*3+2]=s[2]; }
  const labels = new Uint16Array(total);
  for (let iter=0; iter<10; iter++){
    for (let p=0, i=0; p<total; p++, i+=4){
      let best=0, bestD=1e20; const r=data[i], g=data[i+1], b=data[i+2];
      for (let c=0; c<k3; c++){ const cr=centers[c*3], cg=centers[c*3+1], cb=centers[c*3+2]; const dr=r-cr, dg=g-cg, db=b-cb; const d=dr*dr+dg*dg+db*db; if(d<bestD){bestD=d; best=c;} }
      labels[p]=best;
    }
    const sum = new Float64Array(k3*3); const cnt = new Uint32Array(k3);
    for (let p=0, i=0; p<total; p++, i+=4){ const c=labels[p]; sum[c*3]+=data[i]; sum[c*3+1]+=data[i+1]; sum[c*3+2]+=data[i+2]; cnt[c]++; }
    for (let c=0; c<k3; c++) if (cnt[c]) { centers[c*3]=sum[c*3]/cnt[c]; centers[c*3+1]=sum[c*3+1]/cnt[c]; centers[c*3+2]=sum[c*3+2]/cnt[c]; }
  }
  const palette = Array.from({length:k3}, (_,c)=>[centers[c*3]|0, centers[c*3+1]|0, centers[c*3+2]|0]);
  return { labels, palette };
}

// --- Contours and geometry ---
function marchingSquares(mask, w, h) {
  const edges = new Map();
  const key = (x,y)=>x+","+y;
  const add = (ax,ay,bx,by)=>{ const a=key(ax,ay), b=key(bx,by); if(!edges.has(a)) edges.set(a,[]); if(!edges.has(b)) edges.set(b,[]); edges.get(a).push(b); edges.get(b).push(a); };
  const at = (x,y)=>(x>=0&&y>=0&&x<w&&y<h)?mask[y*w+x]:0;
  for (let y=0; y<h-1; y++){
    for (let x=0; x<w-1; x++){
      const v0=at(x,y), v1=at(x+1,y), v2=at(x+1,y+1), v3=at(x,y+1);
      const idx=(v0?1:0)|(v1?2:0)|(v2?4:0)|(v3?8:0);
      if (idx===0||idx===15) continue;
      const xm=x*2+1, ym=y*2+1;
      const eTop=[xm,y*2], eRight=[x*2+2,ym], eBottom=[xm,y*2+2], eLeft=[x*2,ym];
      const avg=(v0+v1+v2+v3)/4; const segs=[];
      switch(idx){
        case 1: segs.push([eLeft,eTop]); break;
        case 2: segs.push([eTop,eRight]); break;
        case 3: segs.push([eLeft,eRight]); break;
        case 4: segs.push([eRight,eBottom]); break;
        case 5: if(avg<0.5){segs.push([eLeft,eTop],[eBottom,eRight]);} else {segs.push([eTop,eRight],[eLeft,eBottom]);} break;
        case 6: segs.push([eTop,eBottom]); break;
        case 7: segs.push([eLeft,eBottom]); break;
        case 8: segs.push([eBottom,eLeft]); break;
        case 9: segs.push([eBottom,eTop]); break;
        case 10: if(avg<0.5){segs.push([eTop,eLeft],[eRight,eBottom]);} else {segs.push([eRight,eTop],[eBottom,eLeft]);} break;
        case 11: segs.push([eRight,eTop]); break;
        case 12: segs.push([eLeft,eRight]); break;
        case 13: segs.push([eTop,eRight]); break;
        case 14: segs.push([eTop,eLeft]); break;
      }
      for (const [a,b] of segs) add(a[0],a[1],b[0],b[1]);
    }
  }
  const polys=[]; const seen=new Set();
  for (const start of edges.keys()){
    if (seen.has(start)) continue; const loop=[]; let curr=start, prev=null;
    while(true){
      seen.add(curr);
      const [cx,cy]=curr.split(',').map(n=>parseInt(n,10)); loop.push([cx/2,cy/2]);
      const nbrs=edges.get(curr)||[]; let next=null; for (const n of nbrs){ if(n!==prev){ next=n; break; } }
      if(!next) break; prev=curr; curr=next; if(curr===start) break;
    }
    if(loop.length>2) polys.push(loop);
  }
  return polys;
}

function rdp(points, eps){ if(points.length<=3) return points; const first=points[0], last=points[points.length-1]; let idx=-1, maxDist=0; for(let i=1;i<points.length-1;i++){ const d=perpDist(points[i], first, last); if(d>maxDist){maxDist=d; idx=i;} } if(maxDist>eps){ const left=rdp(points.slice(0,idx+1),eps); const right=rdp(points.slice(idx),eps); return left.slice(0,-1).concat(right);} else { return [first,last]; } }
function perpDist(p,a,b){ const [x,y]=p,[x1,y1]=a,[x2,y2]=b; const dx=x2-x1, dy=y2-y1; if(dx===0&&dy===0) return Math.hypot(x-x1,y-y1); const t=((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy); const px=x1+t*dx, py=y1+t*dy; return Math.hypot(x-px,y-py); }
function polygonArea(poly){ let a=0; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const [x1,y1]=poly[j],[x2,y2]=poly[i]; a+= (x1*y2 - x2*y1);} return a/2; }

function pathDLinear(poly){ let d=`M ${poly[0][0]} ${poly[0][1]}`; for(let i=1;i<poly.length;i++) d+=` L ${poly[i][0]} ${poly[i][1]}`; return d+' Z'; }
function pathDCurve(poly, tension){
  const T = Math.max(0, Math.min(1.5, tension||0.5));
  const n = poly.length;
  let d = `M ${poly[0][0]} ${poly[0][1]}`;
  for (let i=0; i<n; i++){
    const p0 = poly[(i-1+n)%n];
    const p1 = poly[i];
    const p2 = poly[(i+1)%n];
    const p3 = poly[(i+2)%n];
    const c1x = p1[0] + (p2[0]-p0[0]) * (T/6);
    const c1y = p1[1] + (p2[1]-p0[1]) * (T/6);
    const c2x = p2[0] - (p3[0]-p1[0]) * (T/6);
    const c2y = p2[1] - (p3[1]-p1[1]) * (T/6);
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d + ' Z';
}

// --- Cleaning and analysis ---
function analyzeImage(data, w, h) {
  const strideY = Math.max(1, Math.floor(h / 512));
  const strideX = Math.max(1, Math.floor(w / 512));
  const total = Math.ceil(h / strideY) * Math.ceil(w / strideX);
  const histR = new Uint32Array(256);
  const histG = new Uint32Array(256);
  const histB = new Uint32Array(256);
  let extremes = 0;
  for (let y = 0; y < h; y += strideY) {
    let idx = (y * w) * 4;
    for (let x = 0; x < w; x += strideX) {
      const r = data[idx]; const g = data[idx+1]; const b = data[idx+2];
      histR[r]++; histG[g]++; histB[b]++;
      if (r < 3 || g < 3 || b < 3 || r > 252 || g > 252 || b > 252) extremes++;
      idx += 4 * strideX;
    }
  }
  const p = (hist)=>percentileFromHist(hist, total, 0.01, 0.99);
  const pr=p(histR), pg=p(histG), pb=p(histB);
  const lowContrast = (pr.hi - pr.lo < 80) && (pg.hi - pg.lo < 80) && (pb.hi - pb.lo < 80);
  const saltPepper = (extremes / total) > 0.02;
  return { lowContrast, saltPepper, channels: { r: pr, g: pg, b: pb } };
}
function percentileFromHist(hist, total, loP, hiP) {
  const loTarget = Math.max(0, Math.floor(total * loP));
  const hiTarget = Math.max(0, Math.floor(total * hiP));
  let cum = 0; let lo = 0; let hi = 255;
  for (let i = 0; i < 256; i++) { cum += hist[i]; if (cum >= loTarget) { lo = i; break; } }
  cum = 0; for (let i = 255; i >= 0; i--) { cum += hist[i]; if (cum >= (total - hiTarget)) { hi = i; break; } }
  if (hi <= lo) { hi = Math.min(255, lo + 1); }
  return { lo, hi };
}
function contrastStretch(imgData, channels) {
  const d = imgData.data; const { r,g,b } = channels;
  const slr = 255 / (r.hi - r.lo || 1);
  const slg = 255 / (g.hi - g.lo || 1);
  const slb = 255 / (b.hi - b.lo || 1);
  for (let i=0;i<d.length;i+=4){ d[i]=clamp8((d[i]-r.lo)*slr); d[i+1]=clamp8((d[i+1]-g.lo)*slg); d[i+2]=clamp8((d[i+2]-b.lo)*slb); }
}
function median3x3(imgData){ const { width:w, height:h, data:src } = imgData; const dst = new Uint8ClampedArray(src.length); const get=(x,y,c)=>src[((y*w+x)*4)+c]; for(let y=0;y<h;y++){ for(let x=0;x<w;x++){ for(let c=0;c<3;c++){ const vals=[]; for(let dy=-1;dy<=1;dy++){ const yy=clamp(y+dy,0,h-1); for(let dx=-1;dx<=1;dx++){ const xx=clamp(x+dx,0,w-1); vals.push(get(xx,yy,c)); } } vals.sort((a,b)=>a-b); dst[((y*w+x)*4)+c]=vals[4]; } dst[((y*w+x)*4)+3]=get(x,y,3); } } src.set(dst); }
function clamp(v,lo,hi){ return Math.max(lo, Math.min(hi,v)); }
function clamp8(v){ return v<0?0:(v>255?255:(v|0)); }

