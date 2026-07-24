const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PptxGenJS = require('pptxgenjs');
const sharp = require('sharp');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'build/HiveFukuoka2026_開催レポート.pptx');
const VARIANTS = path.join(ROOT, 'build/photo-variants');
const PHOTO_DIR = path.join(ROOT, 'assets/photos/selected');
const C = { blue: '055CAD', navy: '073B78', deep: '062B50', ice: 'E0EFF9', pale: 'F0F6FC', white: 'FFFFFF', ink: '0F172A', gray: '475569', muted: '94A3B8', coral: 'F25F5C' };

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Hive Fukuoka';
pptx.company = 'Hive Japan';
pptx.subject = 'Hive Fukuoka 2026 開催レポート';
pptx.title = 'Hive Fukuoka 2026 開催レポート';
pptx.lang = 'ja-JP';
pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Noto Sans JP', lang: 'ja-JP' };

function photo(prefix) {
  const file = fs.readdirSync(PHOTO_DIR).find((name) => name.startsWith(`${prefix}_`));
  if (!file) throw new Error(`Photo not found: ${prefix}`);
  return path.join(PHOTO_DIR, file);
}

function text(slide, value, x, y, w, h, options = {}) {
  slide.addText(value, {
    x, y, w, h, margin: options.margin ?? 0, fit: 'shrink',
    fontFace: options.fontFace || 'Noto Sans JP', fontSize: options.fontSize || 18,
    bold: options.bold || false, color: options.color || C.ink,
    align: options.align || 'left', valign: options.valign || 'mid',
    breakLine: false, transparency: options.transparency,
  });
}

function shape(slide, type, x, y, w, h, fill, line = fill) {
  slide.addShape(type, { x, y, w, h, fill: { color: fill }, line: { color: line === 'none' ? fill : line, transparency: line === 'none' ? 100 : 0, width: 1 } });
}

function header(slide, title, kicker, dark = false) {
  text(slide, kicker.toUpperCase(), 0.62, 0.42, 3.8, 0.22, { fontFace: 'Arial', fontSize: 7, bold: true, color: dark ? '94C3ED' : C.blue });
  text(slide, title, 0.6, 0.72, 12.0, 0.62, { fontSize: 27, bold: true, color: dark ? C.white : C.navy });
  slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.42, w: 0.95, h: 0, line: { color: dark ? '94C3ED' : C.blue, width: 3 } });
}

function footer(slide, dark = false) {
  slide.addShape(pptx.ShapeType.line, { x: 0.55, y: 7.12, w: 12.2, h: 0, line: { color: dark ? '35689E' : C.ice, width: 1 } });
  text(slide, 'HIVE FUKUOKA 2026', 0.58, 7.17, 2.5, 0.15, { fontFace: 'Arial', fontSize: 5.5, bold: true, color: dark ? 'BDD7EF' : C.blue });
  text(slide, String(pptx._slides.length), 12.35, 7.15, 0.38, 0.17, { fontFace: 'Arial', fontSize: 6, color: dark ? 'BDD7EF' : '7C9FC2', align: 'right' });
}

function slide(bg = C.white) {
  const s = pptx.addSlide();
  s.background = { color: bg };
  footer(s, bg !== C.white && bg !== C.pale);
  return s;
}

function section(number, title, kicker) {
  const s = slide(C.navy);
  text(s, number, 0.68, 0.78, 2.4, 0.95, { fontFace: 'Arial', fontSize: 52, bold: true, color: '2F6097' });
  text(s, kicker.toUpperCase(), 0.72, 2.45, 4.2, 0.28, { fontFace: 'Arial', fontSize: 8, bold: true, color: '94C3ED' });
  text(s, title, 0.7, 2.84, 11.5, 0.9, { fontSize: 32, bold: true, color: C.white });
  shape(s, pptx.ShapeType.hexagon, 10.35, 1.05, 2.0, 1.72, '0B4E94');
  shape(s, pptx.ShapeType.hexagon, 9.58, 3.5, 1.18, 1.02, '0B4E94');
}

async function variant(source, w, h, fit = 'cover', position = 'centre', background = C.white) {
  fs.mkdirSync(VARIANTS, { recursive: true });
  const pxW = Math.max(200, Math.round(w * 170));
  const pxH = Math.max(120, Math.round(h * 170));
  const key = crypto.createHash('md5').update(`${source}|${pxW}|${pxH}|${fit}|${position}|${background}`).digest('hex');
  const out = path.join(VARIANTS, `${key}.jpg`);
  if (!fs.existsSync(out)) {
    await sharp(source).rotate().resize(pxW, pxH, { fit, position, background: `#${background}` }).flatten({ background: `#${background}` }).jpeg({ quality: 90, mozjpeg: true }).toFile(out);
  }
  return out;
}

async function image(slide, source, x, y, w, h, options = {}) {
  const prepared = await variant(source, w, h, options.fit || 'cover', options.position || 'centre', options.background || C.white);
  slide.addImage({ path: prepared, x, y, w, h });
}

async function fullPhoto(source, heading, caption, options = {}) {
  const s = pptx.addSlide();
  s.background = { color: C.deep };
  await image(s, source, 0, 0, 13.333, 7.5, { position: options.position || 'centre' });
  shape(s, pptx.ShapeType.rect, 0, 0, 13.333, 7.5, '000000');
  s._slideObjects[s._slideObjects.length - 1].options.fill.transparency = options.overlay ?? 48;
  text(s, heading, 0.75, 4.78, 11.75, 0.75, { fontSize: 30, bold: true, color: C.white, align: options.align || 'left' });
  text(s, caption, 0.78, 5.72, 11.5, 0.52, { fontSize: 13, color: C.white, align: options.align || 'left' });
  s.addShape(pptx.ShapeType.line, { x: options.align === 'right' ? 11.2 : 0.78, y: 6.5, w: 1.25, h: 0, line: { color: '94C3ED', width: 3 } });
  return s;
}

function metric(slide, x, y, label, value, note, dark = false) {
  text(slide, label.toUpperCase(), x, y, 2.55, 0.23, { fontFace: 'Arial', fontSize: 7, bold: true, color: dark ? '94C3ED' : C.blue });
  text(slide, value, x, y + 0.38, 2.65, 0.72, { fontFace: /[A-Za-z]/.test(value) ? 'Arial' : 'Noto Sans JP', fontSize: 30, bold: true, color: dark ? C.white : C.navy });
  text(slide, note, x, y + 1.18, 2.6, 0.48, { fontSize: 11, color: dark ? 'D8E8F7' : C.gray, valign: 'top' });
}

function bar(slide, label, value, max, x, y, w, color = C.blue, suffix = '') {
  text(slide, label, x, y, 2.0, 0.28, { fontSize: 12, bold: true, color: C.ink });
  shape(slide, pptx.ShapeType.rect, x + 2.05, y + 0.06, w - 3.35, 0.2, C.pale, 'none');
  shape(slide, pptx.ShapeType.rect, x + 2.05, y + 0.06, (w - 3.35) * value / max, 0.2, color, 'none');
  text(slide, `${value}${suffix}`, x + w - 1.12, y - 0.04, 1.1, 0.34, { fontFace: 'Arial', fontSize: 13, bold: true, color, align: 'right' });
}

async function build() {
  const P = Object.fromEntries(['003','007','014','019','022','037','043','048','050','061','091','094','116','139','143','220'].map((n) => [n, photo(n)]));
  const shiori = path.join(ROOT, 'assets/shiori');

  // 1 Cover
  {
    const s = pptx.addSlide();
    await image(s, P['003'], 0, 0, 13.333, 7.5, { position: 'centre' });
    shape(s, pptx.ShapeType.rect, 0, 0, 13.333, 7.5, C.navy);
    s._slideObjects[s._slideObjects.length - 1].options.fill.transparency = 25;
    text(s, 'HIVE FUKUOKA', 0.75, 0.92, 9.5, 0.72, { fontFace: 'Arial', fontSize: 38, bold: true, color: C.white });
    text(s, '2026', 0.75, 1.7, 4.0, 0.78, { fontFace: 'Arial', fontSize: 43, bold: true, color: 'BDD7EF' });
    text(s, '開催レポート', 0.75, 4.75, 7.0, 0.72, { fontSize: 34, bold: true, color: C.white });
    text(s, '2026.05.16-17 / FUKUOKA', 0.78, 5.62, 4.7, 0.28, { fontFace: 'Arial', fontSize: 9, bold: true, color: C.white });
    s.addShape(pptx.ShapeType.line, { x: 0.78, y: 6.3, w: 8.8, h: 0, line: { color: C.white, width: 1 } });
  }

  // 2 Key facts
  {
    const s = slide(); header(s, 'Hive Fukuoka 2026 開催実績', 'Overview');
    metric(s, 0.75, 2.0, 'Participants', '53名', '参加者総数');
    metric(s, 3.8, 2.0, 'Fukuoka', '27名', '現在地が福岡県');
    metric(s, 6.85, 2.0, '福岡県外', '26名', '関東圏25名・秋田県1名');
    metric(s, 9.9, 2.0, 'Edition', '第1回', '2026年に初開催');
    shape(s, pptx.ShapeType.rect, 0.75, 4.55, 11.9, 1.12, C.blue, 'none');
    text(s, '福岡27名、関東圏を中心とする福岡県外26名。ほぼ半数ずつが集まりました。', 1.1, 4.86, 11.15, 0.45, { fontSize: 20, bold: true, color: C.white, align: 'center' });
  }

  // 3 Thank you
  {
    const s = slide(); header(s, 'ご参加・ご協力いただいた皆さまへ', 'Thank you');
    text(s, '福岡と関東を中心に、53名が集いました。互いの活動や考えに耳を傾け、福岡の街を歩きながら、これから取り組みたいことを語り合った2日間でした。\n\nご参加・ご協力いただいた皆さまに、心より御礼申し上げます。', 0.78, 2.0, 5.6, 2.6, { fontSize: 19, valign: 'top' });
    await image(s, P['050'], 6.55, 1.72, 6.12, 4.95, { position: 'centre' });
  }

  // 4 Contents
  {
    const s = slide(C.navy); header(s, '本レポートの構成', 'Contents', true);
    [['01','Hive Japan / Hive Fukuoka'],['02','開催概要とプログラム'],['03','参加者属性'],['04','当日の様子'],['05','アンケート結果']].forEach(([n, label], i) => {
      const y = 1.9 + i * 0.88;
      text(s, n, 0.82, y, 0.65, 0.35, { fontFace: 'Arial', fontSize: 13, bold: true, color: '94C3ED' });
      text(s, label, 1.65, y - 0.04, 5.5, 0.45, { fontSize: 19, bold: true, color: C.white });
      s.addShape(pptx.ShapeType.line, { x: 7.25, y: y + 0.18, w: 4.75, h: 0, line: { color: '35689E', width: 1 } });
    });
  }

  section('01', 'Hive JapanとHive Fukuoka', 'About us');

  // 6 About Hive Japan
  {
    const s = slide(); header(s, 'Hive Japanとは', 'About Hive Japan');
    text(s, '志を起点に、領域を越えて社会の未来を動かす。', 0.75, 1.9, 11.8, 0.58, { fontSize: 24, bold: true, color: C.navy });
    text(s, 'Hive Japanは、「日本の未来を切り拓く」という使命を掲げ、「日本を良くしたい」と本気で考える若者が、立場や領域を越えて志でつながるコミュニティです。\n\n「Hive（蜂の巣）」の名の通り、多様な領域で活動する若者が出入りし、合宿や対話を通して一人ひとりの問いと志を磨きます。そこで得た知見やつながりを、それぞれの挑戦へ持ち帰る場です。\n\n東京で始まった輪は、岡山、宮城、福島、福岡、そしてインドへと広がり、さらに各地に新しい「志ある若者の集まる場」が生まれ始めています。', 0.78, 2.75, 11.45, 3.15, { fontSize: 18, color: C.ink, valign: 'top' });
  }

  // 7 About Hive Fukuoka
  {
    const s = slide(); header(s, 'Hive Fukuokaとは', 'About Hive Fukuoka');
    text(s, '2026年、Hive Japanの地域版として、福岡で初めて開催されました。', 0.75, 1.72, 11.8, 0.55, { fontSize: 24, bold: true, color: C.navy });
    text(s, '運営メンバーの多くは福岡出身で、進学を機に関東や関西へ移った経験があります。福岡へ戻った人もいれば、今は別の地域に暮らしながら、故郷にできることを考え続けている人もいます。\n\n福岡は、都市の利便性と身近な自然が共存し、事業やまちづくりだけでなく、アートやスポーツなど、さまざまな挑戦を始められる街です。九州各地の若者が集い、港と空港を通じて国内外に開かれていることも、この街の大きな魅力です。\n\nこの土地に根を張る人と、外から故郷に関わる人が出会い、互いの視点を持ち寄る。福岡から日本や世界のこれからを考え、新しい動きが生まれる場をつくりたい。こうした思いから、Hive Fukuokaは始まりました。', 0.78, 2.5, 11.5, 3.0, { fontSize: 15.5, color: C.ink, valign: 'top' });
    shape(s, pptx.ShapeType.rect, 0.78, 5.72, 11.55, 0.7, C.pale, C.ice);
    text(s, '福岡という土地から、日本と世界のこれからを考える。', 1.05, 5.9, 11.0, 0.34, { fontSize: 18, bold: true, color: C.blue, align: 'center' });
  }

  section('02', '開催概要とプログラム', 'Program');

  // 8 Outline
  {
    const s = slide(); header(s, '開催概要', 'Event outline');
    text(s, '1日目は福岡市で講義とディスカッション。2日目は4地域に分かれ、現場を訪ねました。', 0.75, 1.65, 11.85, 0.36, { fontSize: 16, bold: true, color: C.navy });

    text(s, 'DATE', 0.75, 2.28, 2.25, 0.22, { fontFace: 'Arial', fontSize: 8, bold: true, color: C.blue });
    text(s, '05.16–17', 0.75, 2.62, 2.35, 0.58, { fontFace: 'Arial', fontSize: 28, bold: true, color: C.navy });
    text(s, '2026年 / 1泊2日', 0.75, 3.3, 2.35, 0.3, { fontSize: 11, color: C.gray });

    s.addShape(pptx.ShapeType.line, { x: 3.28, y: 2.22, w: 0, h: 1.55, line: { color: C.ice, width: 1 } });
    text(s, 'DAY 1 / 05.16', 3.62, 2.28, 3.6, 0.22, { fontFace: 'Arial', fontSize: 8, bold: true, color: C.blue });
    text(s, '福岡市', 3.62, 2.62, 3.65, 0.58, { fontSize: 28, bold: true, color: C.navy });
    text(s, '講義・ディスカッション', 3.62, 3.26, 3.65, 0.34, { fontSize: 13, bold: true, color: C.ink });
    text(s, '大名カンファレンス', 3.62, 3.62, 3.65, 0.23, { fontSize: 9, color: C.gray });

    s.addShape(pptx.ShapeType.line, { x: 7.48, y: 2.22, w: 0, h: 1.55, line: { color: C.ice, width: 1 } });
    text(s, 'DAY 2 / 05.17', 7.82, 2.28, 4.65, 0.22, { fontFace: 'Arial', fontSize: 8, bold: true, color: C.blue });
    text(s, '北九州・東区・天神・南関町', 7.82, 2.62, 4.55, 0.5, { fontSize: 18, bold: true, color: C.navy });
    text(s, '4地域に分かれてフィールドワーク', 7.82, 3.26, 4.55, 0.34, { fontSize: 13, bold: true, color: C.ink });
    shape(s, pptx.ShapeType.rect, 0.75, 4.25, 11.9, 1.65, C.blue, 'none');
    s.addShape(pptx.ShapeType.line,{x:6.7,y:4.52,w:0,h:1.1,line:{color:'6DA7D9',width:1}});
    text(s, 'THEME 01', 1.0, 4.48, 1.35, 0.22, { fontFace:'Arial', fontSize:8, bold:true, color:'BDD7EF' });
    text(s, '交差点の街・福岡に「漬かる」', 1.0, 4.8, 5.35, 0.42, { fontSize:18, bold:true, color:C.white });
    text(s, '街と人に出会い、福岡の今に触れる。', 1.0, 5.34, 5.35, 0.28, { fontSize:11, color:'D8E8F7' });
    text(s, 'THEME 02', 7.05, 4.48, 1.35, 0.22, { fontFace:'Arial', fontSize:8, bold:true, color:'BDD7EF' });
    text(s, '志をアップデートする「宴」', 7.05, 4.8, 5.15, 0.42, { fontSize:18, bold:true, color:C.white });
    text(s, '問いと志を持ち寄り、対話を重ねる。', 7.05, 5.34, 5.15, 0.28, { fontSize:11, color:'D8E8F7' });
  }

  // Day 1 timeline
  {
    const s = slide(); header(s, 'Day 1｜1日目のプログラム', '2026.05.16');
    const rows = [
      ['10:00–10:30','受付オープン'],['10:30–11:10','宴のはじまり'],['11:10–11:50','アイスブレイク'],
      ['11:50–13:30','昼食'],['13:30–13:45','志アップデート①','志フレームワーク・福岡発の志インプット'],['13:55–15:35','志アップデート②','志の言語化・共有'],
      ['15:35–15:45','2日目のコース紹介'],['16:00–18:00','特別ゲストセッション'],['18:00–18:30','振り返りとまとめ'],
      ['19:00–20:00','ホテル案内・チェックイン'],['20:00–22:00','夜の宴','味どころ 希彌']
    ];
    rows.forEach(([time,label,note],i) => {
      const col=i<6?0:1, row=i<6?i:i-6, x=0.72+col*6.15, y=1.68+row*0.82;
      const accent=label.includes('志アップ')||label.includes('ゲスト');
      text(s,time,x,y,1.18,0.25,{fontFace:'Arial',fontSize:8.5,bold:true,color:C.blue});
      shape(s,pptx.ShapeType.rect,x+1.28,y-0.08,0.06,0.58,accent?C.blue:C.ice,'none');
      text(s,label,x+1.57,y-0.04,4.25,0.34,{fontSize:13,bold:true,color:C.navy});
      if(note) text(s,note,x+1.57,y+0.3,4.25,0.24,{fontSize:8.5,color:C.gray});
    });
  }

  // Day 1 guest session
  {
    const s = slide(); header(s, '社会を動かす実践者との対話', 'Day 1 / Guest session');
    await image(s, path.join(shiori,'takashima-soichiro.jpg'), 0.75, 1.78, 2.45, 3.45, { position: 'north' });
    text(s,'高島 宗一郎さん',3.52,2.0,3.0,0.5,{fontSize:22,bold:true,color:C.navy}); text(s,'福岡市長',3.52,2.62,2.0,0.3,{fontSize:13,color:C.blue});
    await image(s, path.join(shiori,'taguchi-kazunari.webp'), 6.7, 1.78, 2.45, 3.45, { position: 'north' });
    text(s,'田口 一成さん',9.45,2.0,3.0,0.5,{fontSize:22,bold:true,color:C.navy}); text(s,'ボーダレス・ジャパン\n代表取締役社長',9.45,2.58,2.85,0.75,{fontSize:13,color:C.blue,valign:'top'});
    text(s,'福岡の都市経営と、ビジネスから生まれる社会変革。それぞれの実践に学びました。',1.0,5.75,11.3,0.42,{fontSize:16,bold:true,color:C.gray,align:'center'});
  }

  // Day 2 timeline
  {
    const s = slide(); header(s, 'Day 2｜福岡を現場から知る', '2026.05.17');
    const rows=[['09:00–16:00','コース別ワーク','天神・北九州・東区・南関町'],['16:00–16:30','全体シェアセッション','QHubに再集合'],['16:30–17:00','クロージングセッション','2日間の振り返り'],['17:00','締め・解散','']];
    rows.forEach(([time,label,note],i)=>{const y=1.8+i*1.15; text(s,time,0.82,y,2.05,0.34,{fontFace:'Arial',fontSize:13,bold:true,color:C.blue}); shape(s,pptx.ShapeType.rect,3.0,y-0.08,0.08,0.7,i===0?C.blue:C.ice,'none'); text(s,label,3.42,y-0.12,5.6,0.42,{fontSize:18,bold:true,color:C.navy}); if(note) text(s,note,8.92,y-0.02,3.45,0.3,{fontSize:11,color:C.gray,align:'right'});});
    shape(s,pptx.ShapeType.rect,0.82,6.25,11.55,0.52,C.pale,C.ice); text(s,'4つのコースに分かれ、街とそこで活動する人を訪ねました。',1.05,6.36,11.0,0.28,{fontSize:14,bold:true,color:C.blue,align:'center'});
  }

  // Day 2 fieldwork courses 1-2
  {
    const s=slide(); header(s,'Day 2｜4つのフィールドワーク','Courses 01-02');
    await image(s,path.join(shiori,'fieldwork-course-1.png'),0.55,1.64,6.05,3.4,{fit:'contain'});
    await image(s,path.join(shiori,'fieldwork-course-2.png'),6.73,1.64,6.05,3.4,{fit:'contain'});
    text(s,'01  都市開発と最先端農業',0.68,5.42,5.8,0.42,{fontSize:17,bold:true,color:C.navy,align:'center'});
    text(s,'02  「物語」としての地図とまちづくり',6.85,5.42,5.8,0.42,{fontSize:17,bold:true,color:C.navy,align:'center'});
  }

  // Day 2 fieldwork courses 3-4
  {
    const s=slide(); header(s,'Day 2｜4つのフィールドワーク','Courses 03-04');
    await image(s,path.join(shiori,'fieldwork-course-3.png'),0.55,1.64,6.05,3.4,{fit:'contain'});
    await image(s,path.join(shiori,'fieldwork-course-4.png'),6.73,1.64,6.05,3.4,{fit:'contain'});
    text(s,'03  ローカルをクリエイティブでデザイン',0.68,5.42,5.8,0.42,{fontSize:17,bold:true,color:C.navy,align:'center'});
    text(s,'04  公民学連携のまちづくり',6.85,5.42,5.8,0.42,{fontSize:17,bold:true,color:C.navy,align:'center'});
  }

  section('03', '参加者属性', 'Participants');

  // 12 Regional mix
  {
    const s=slide(); header(s,'参加者の地域構成','Regional mix');
    bar(s,'福岡県',27,53,0.8,2.28,11.6,C.blue,'名'); bar(s,'福岡県外',26,53,0.8,3.72,11.6,C.navy,'名');
    shape(s,pptx.ShapeType.rect,0.8,5.55,11.55,0.78,C.pale,C.ice); text(s,'福岡27名、関東圏を中心とする福岡県外26名が集まりました。',1.05,5.78,11.0,0.34,{fontSize:19,bold:true,color:C.blue,align:'center'});
    text(s,'現在地ベース / 福岡県外＝東京都23名・茨城県1名・栃木県1名・秋田県1名 / n=53',0.8,6.52,11.55,0.22,{fontSize:8,color:C.gray,align:'right'});
  }

  // 13 Profile
  {
    const s=slide(); header(s,'参加者の内訳','Participant profile');
    [['社会人','40名','75%'],['学生','10名','19%'],['男性 : 女性','31 : 22','58% : 42%'],['年齢の中心層','24〜28歳','40名']].forEach(([k,v,p],i)=>{const x=0.75+(i%2)*6.05,y=1.78+Math.floor(i/2)*2.18; shape(s,pptx.ShapeType.rect,x,y,5.7,1.72,i===0?C.blue:C.pale,i===0?'none':C.ice); text(s,k,x+0.28,y+0.18,2.35,0.32,{fontSize:13,bold:true,color:i===0?C.white:C.navy}); text(s,v,x+0.28,y+0.62,3.15,0.62,{fontSize:28,bold:true,color:i===0?C.white:C.blue}); text(s,p,x+3.55,y+0.68,1.65,0.45,{fontFace:/%/.test(p)?'Arial':'Noto Sans JP',fontSize:18,bold:true,color:i===0?'94C3ED':C.navy,align:'right'});});
    text(s,'社会人・学生の区分は未入力3名 / 年齢は20〜31歳',0.75,6.25,11.55,0.28,{fontSize:11,color:C.gray,align:'right'});
  }

  // 15 Affiliations and fields
  {
    const s=slide(); header(s,'参加者の所属・分野','Affiliations & fields');
    await image(s,P['048'],0.72,1.7,6.55,4.95,{position:'centre'});
    text(s,'社会人の主な分野',7.65,1.82,4.55,0.42,{fontSize:18,bold:true,color:C.navy});
    text(s,'IT・AI・データ / メーカー・インフラ / 医療・福祉\n広告・メディア / コンサル・事業開発 / 教育・研究\nスタートアップ / 金融・投資 / 行政・まちづくり など',7.65,2.48,4.7,1.35,{fontSize:13.5,color:C.gray,valign:'top'});
    s.addShape(pptx.ShapeType.line,{x:7.65,y:4.0,w:4.55,h:0,line:{color:C.ice,width:1.5}});
    text(s,'主な所属大学',7.65,4.32,4.55,0.42,{fontSize:18,bold:true,color:C.navy});
    text(s,'九州大学 / 慶應義塾大学 / 早稲田大学\n福岡大学 / 九州大学大学院 / 西南学院大学 など',7.65,4.98,4.7,0.9,{fontSize:13.5,color:C.gray,valign:'top'});
  }

  section('04', '当日の様子', 'Scenes');

  await fullPhoto(P['220'],'1日目のはじまり。','受付とオープニングを終え、まずは参加者同士の交流から始まりました。',{position:'centre'});

  // Day 1: putting ambitions into words
  {
    const s=slide(); header(s,'志を言葉にする','Ambition dialogue');
    await image(s,P['143'],0.72,1.68,6.0,4.95,{position:'centre'}); await image(s,P['139'],6.92,1.68,5.7,2.35,{position:'centre'}); await image(s,P['116'],6.92,4.25,5.7,2.38,{position:'centre'});
  }

  // Day 1: sharing ambitions
  {
    const s=slide(); header(s,'志を分かち合う','Ambition sharing');
    await image(s,P['094'],0.72,1.68,5.85,4.95,{position:'north'}); await image(s,P['091'],6.75,1.68,5.87,4.95,{position:'west'});
  }

  await fullPhoto(P['061'],'高島市長・田口さんとの対話。','福岡のまちづくりと、事業を通じた社会課題への向き合い方を伺いました。',{position:'centre',align:'right'});

  // 20 Fieldwork
  {
    const s=slide(); header(s,'2日目のフィールドワーク','Fieldwork');
    await image(s,P['037'],0.72,1.68,5.8,4.95,{position:'centre'}); await image(s,P['043'],6.72,1.68,5.9,4.95,{position:'centre'});
    shape(s,pptx.ShapeType.rect,3.05,5.76,7.25,0.62,C.blue,'none'); text(s,'現場を訪ね、取り組んでいる方から直接話を伺いました。',3.3,5.91,6.75,0.28,{fontSize:14,bold:true,color:C.white,align:'center'});
  }

  // 21 Share
  {
    const s=slide(); header(s,'全体シェアと振り返り','Share & reflection');
    await image(s,P['022'],0.72,1.68,5.9,4.95,{position:'centre'}); await image(s,P['014'],6.82,1.68,5.8,4.95,{position:'centre'});
  }

  await fullPhoto(P['019'],'2日間を終えて。','クロージングを終え、2日間の学びと出会いをそれぞれの言葉で振り返りました。',{position:'centre',overlay:36});

  section('05', 'アンケート結果', 'Survey');

  // 24 Satisfaction headline
  {
    const s=slide(C.navy); header(s,'満足度は、3プログラム平均 8.9 / 10','Satisfaction',true);
    text(s,'8.9',0.78,1.72,4.1,1.6,{fontFace:'Arial',fontSize:74,bold:true,color:C.white}); text(s,'/ 10',4.02,2.38,1.25,0.52,{fontFace:'Arial',fontSize:21,bold:true,color:'94C3ED'});
    text(s,'85%',7.0,1.95,3.0,1.05,{fontFace:'Arial',fontSize:48,bold:true,color:C.white}); text(s,'8点以上の評価',7.05,3.0,3.8,0.38,{fontSize:15,bold:true,color:'BDD7EF'});
    shape(s,pptx.ShapeType.rect,0.78,4.45,11.75,1.1,'0B4E94','none'); text(s,'3つの主要プログラムすべてで平均8点以上',1.1,4.77,11.1,0.42,{fontSize:19,bold:true,color:C.white,align:'center'});
    text(s,'Day 1 志アップデート / Day 1 ゲストセッション / Day 2 コース別ワークショップ',0.8,6.05,11.7,0.26,{fontSize:9,color:'BDD7EF',align:'center'});
    text(s,'回答者29名 / 3プログラム・計87評価',0.8,6.42,11.7,0.2,{fontSize:7.5,color:'94C3ED',align:'right'});
  }

  // 25 Satisfaction detail
  {
    const s=slide(); header(s,'すべての主要プログラムで高評価','Program reviews');
    const rows=[['志アップデートセッション',8.5,'9-10点 55%'],['高島市長 × 田口社長セッション',9.4,'9-10点 86%'],['コース別ワークショップ',8.9,'9-10点 69%']];
    rows.forEach(([label,score,note],i)=>{const y=1.95+i*1.35; text(s,label,0.8,y,3.7,0.38,{fontSize:15,bold:true,color:C.navy}); shape(s,pptx.ShapeType.rect,4.55,y+0.07,5.65,0.25,C.pale,'none'); shape(s,pptx.ShapeType.rect,4.55,y+0.07,5.65*score/10,0.25,i===1?C.navy:C.blue,'none'); text(s,score.toFixed(1),10.45,y-0.12,1.15,0.56,{fontFace:'Arial',fontSize:25,bold:true,color:i===1?C.navy:C.blue}); text(s,note,11.25,y,1.08,0.28,{fontSize:8.5,color:C.gray,align:'right'});});
    text(s,'各設問 n=29 / 10点満点',0.8,6.2,11.5,0.25,{fontSize:8.5,color:C.gray,align:'right'});
  }

  // 26 Voices I
  {
    const s=slide(C.deep); header(s,'参加者の声','Voices 01',true);
    const quotes=['たくさんの仲間と出会い、福岡というふるさとを見つけ、\n生き方を振り返る。そんな二日間でした。','期待値を遥かに超える満足度でした。\n自分の人生レベルで、大きな契機となる二日間でした。','福岡が大好きになりました。大切な仲間と出会い、\n宝物のような学びをもらいました。'];
    quotes.forEach((q,i)=>{const y=1.7+i*1.55; text(s,'“',0.8,y,0.6,0.55,{fontFace:'Arial',fontSize:30,bold:true,color:'5FA2E4'}); text(s,q,1.45,y+0.05,10.7,0.9,{fontSize:18,bold:true,color:C.white,valign:'top'}); s.addShape(pptx.ShapeType.line,{x:1.45,y:y+1.18,w:10.65,h:0,line:{color:'214F7E',width:1}});});
    text(s,'自由記述より抜粋・一部要約 / n=29',0.8,6.52,11.5,0.2,{fontSize:7.5,color:'94C3ED',align:'right'});
  }

  // 27 Voices II
  {
    const s=slide(C.deep); header(s,'参加者の声','Voices 02',true);
    const quotes=['東京側と福岡側の融合がうまくできていて、\n気づいたら境目がなくなっていました。','どこにいても、やるかやらないか。\n福岡だからこそできることを、やり抜こうと思えました。','将来「チーム日本」として、\n一緒に未来を良くしていく仲間に出会えた感覚があります。'];
    quotes.forEach((q,i)=>{const y=1.7+i*1.55; text(s,'“',0.8,y,0.6,0.55,{fontFace:'Arial',fontSize:30,bold:true,color:'5FA2E4'}); text(s,q,1.45,y+0.05,10.7,0.9,{fontSize:18,bold:true,color:C.white,valign:'top'}); s.addShape(pptx.ShapeType.line,{x:1.45,y:y+1.18,w:10.65,h:0,line:{color:'214F7E',width:1}});});
    text(s,'自由記述より抜粋・一部要約 / n=29',0.8,6.52,11.5,0.2,{fontSize:7.5,color:'94C3ED',align:'right'});
  }

  // Acknowledgements
  {
    const s=slide(); header(s,'ご登壇・ご協力いただいた皆さま','Acknowledgements');

    text(s,'登壇者',0.75,1.72,4.2,0.42,{fontSize:18,bold:true,color:C.blue});
    text(s,'高島 宗一郎さん',0.75,2.3,4.35,0.42,{fontSize:21,bold:true,color:C.navy});
    text(s,'福岡市長',0.75,2.8,4.35,0.26,{fontSize:11,color:C.gray});
    s.addShape(pptx.ShapeType.line,{x:0.75,y:3.28,w:4.05,h:0,line:{color:C.ice,width:1.2}});
    text(s,'田口 一成さん',0.75,3.62,4.35,0.42,{fontSize:21,bold:true,color:C.navy});
    text(s,'株式会社ボーダレス・ジャパン\n代表取締役社長',0.75,4.1,4.35,0.62,{fontSize:11,color:C.gray,valign:'top'});

    s.addShape(pptx.ShapeType.line,{x:5.15,y:1.76,w:0,h:3.75,line:{color:C.ice,width:1.2}});
    text(s,'フィールドワーク協力・訪問先',5.55,1.72,6.75,0.42,{fontSize:18,bold:true,color:C.blue});
    const placesLeft=['テンジン大学','OYASAI株式会社','ゼンリンミュージアム','株式会社三角形','黒崎商店街寿通り'];
    const placesRight=['南関町図書館〈このみch-i〉','ファクトリーショップ「拝啓」','アイランドシティ中央公園','UDCIC\nUrban Design Center Island City'];
    placesLeft.forEach((label,i)=>text(s,label,5.55,2.34+i*0.57,3.05,0.34,{fontSize:13.5,bold:true,color:C.navy}));
    placesRight.forEach((label,i)=>text(s,label,8.88,2.34+i*0.7,3.55,i===3?0.58:0.34,{fontSize:i===3?11.5:13.5,bold:true,color:C.navy,valign:'top'}));

    shape(s,pptx.ShapeType.rect,0.75,5.72,11.9,0.82,C.pale,C.ice);
    text(s,'会場協力',1.02,5.94,1.55,0.3,{fontSize:12,bold:true,color:C.blue});
    text(s,'大名カンファレンス',2.72,5.91,3.35,0.34,{fontSize:15,bold:true,color:C.navy});
    text(s,'QHub / 九州博報堂',7.15,5.91,3.65,0.34,{fontSize:15,bold:true,color:C.navy});
    text(s,'団体・施設名は順不同',0.8,6.7,11.6,0.2,{fontSize:7.5,color:C.gray,align:'right'});
  }

  // Final
  {
    const s=await fullPhoto(P['007'],'ご参加・ご協力いただき、ありがとうございました。','福岡で生まれた出会いと問いが、それぞれの地域で次の一歩につながっていくことを願っています。',{position:'centre',overlay:38});
    text(s,'hive.fukuoka@gmail.com',9.65,6.72,2.8,0.22,{fontFace:'Arial',fontSize:8,color:C.white,align:'right'});
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await pptx.writeFile({ fileName: OUT });
  console.log(OUT);
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
