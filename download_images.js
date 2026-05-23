import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const singersDir = path.join(__dirname, 'public', 'images', 'singers');
const concertsDir = path.join(__dirname, 'public', 'images', 'concerts');
fs.mkdirSync(singersDir, { recursive: true });
fs.mkdirSync(concertsDir, { recursive: true });

const singers = [
  'Enrique Iglesias',
  'Ariana Grande',
  'Justin Bieber',
  'Celine Dion',
  'Selena Gomez',
  'Taylor Swift',
  'Dua Lipa',
  'Lady Gaga',
  'Adele',
  'Ed Sheeran',
  'Rihanna',
  'Drake',
  'Eminem',
  'Billie Eilish',
  'Nicki Minaj',
  'Beyonce',
  'Shakira',
  'Bruno Mars',
  'Pitbull',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const toKey = (name) =>
  name.toLowerCase()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[îï]/g, 'i')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const BLOCKED = [
  'wikipedia.org', 'wikimedia.org', 'upload.wikimedia', 'wiki/',
  'gstatic.com/images/branding', 'google.com/logos',
];
const isBlocked = (url) => BLOCKED.some((b) => url.includes(b));

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Cache-Control': 'no-cache',
};

// HTTP GET → string body, follows redirects
const fetchText = (url, extraHeaders = {}) =>
  new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { ...HEADERS, ...extraHeaders } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        return fetchText(res.headers.location, extraHeaders).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });

// Download binary file (image), follows redirects
const downloadBinary = (url, dest) =>
  new Promise((resolve, reject) => {
    const attempt = (u) => {
      const lib = u.startsWith('https') ? https : http;
      lib.get(u, { headers: HEADERS }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          return attempt(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const ct = res.headers['content-type'] || '';
        if (!ct.includes('image') && !ct.includes('octet')) {
          res.resume();
          return reject(new Error(`Not an image: ${ct}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
      }).on('error', (e) => { fs.unlink(dest, () => {}); reject(e); })
        .setTimeout(20000, function () { this.destroy(); reject(new Error('Timeout')); });
    };
    attempt(url);
  });

// ── Google Images scraper ─────────────────────────────────────────────────────
// Extracts image URLs from the encoded JSON Google embeds in its HTML response.
const scrapeGoogle = async (query) => {
  const url =
    `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=en&safe=off&num=20`;

  let html;
  try {
    html = await fetchText(url, { Referer: 'https://www.google.com/' });
  } catch (e) {
    throw new Error(`Google fetch failed: ${e.message}`);
  }

  const urls = new Set();

  // Pattern 1 – full JSON blobs: "ou":"https://..."
  const re1 = /"ou":"(https?:\/\/[^"]+?)"/g;
  let m;
  while ((m = re1.exec(html)) !== null) urls.add(m[1]);

  // Pattern 2 – escaped JSON inside AF_initDataCallback
  const re2 = /\\u0022(https?:\\u002F\\u002F[^\\]+?\.(?:jpg|jpeg|png|webp))\\u0022/gi;
  while ((m = re2.exec(html)) !== null) {
    urls.add(
      m[1]
        .replace(/\\u002F/gi, '/')
        .replace(/\\u003D/gi, '=')
        .replace(/\\u0026/gi, '&')
    );
  }

  // Pattern 3 – plain https image links in data attributes
  const re3 = /https?:\/\/[^\s"'\\]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'\\]*)?/gi;
  while ((m = re3.exec(html)) !== null) urls.add(m[0]);

  return [...urls].filter((u) => !isBlocked(u));
};

// ── Bing Images scraper (fallback) ────────────────────────────────────────────
const scrapeBing = async (query) => {
  const url =
    `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1&tsc=ImageHoverTitle`;

  let html;
  try {
    html = await fetchText(url, { Referer: 'https://www.bing.com/' });
  } catch (e) {
    throw new Error(`Bing fetch failed: ${e.message}`);
  }

  const urls = new Set();

  // Bing encodes real URLs in murl attribute
  const re1 = /murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g;
  let m;
  while ((m = re1.exec(html)) !== null) urls.add(decodeURIComponent(m[1]));

  // Also try srcUrl
  const re2 = /"srcUrl":"(https?:\/\/[^"]+?)"/g;
  while ((m = re2.exec(html)) !== null) urls.add(m[1]);

  // Plain image URLs
  const re3 = /https?:\/\/[^\s"'<>\\]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>\\]*)?/gi;
  while ((m = re3.exec(html)) !== null) urls.add(m[0]);

  return [...urls].filter((u) => !isBlocked(u));
};

// ── Try to download the first working image from a list of URLs ───────────────
const downloadFirstWorking = async (urls, dest) => {
  for (const url of urls.slice(0, 12)) {
    try {
      await downloadBinary(url, dest);
      // Verify the file is a real image (≥5 KB)
      const { size } = fs.statSync(dest);
      if (size < 5000) {
        fs.unlinkSync(dest);
        continue;
      }
      return url;
    } catch {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
    }
  }
  throw new Error('All candidate URLs failed');
};

// ── Main per-singer logic ─────────────────────────────────────────────────────
const downloadForSinger = async (singer) => {
  const key = toKey(singer);

  // ---------- Singer portrait ----------
  const singerPath = path.join(singersDir, `${key}.jpg`);
  let singerDone = false;

  for (const query of [
    `${singer} singer official photo`,
    `${singer} musician portrait`,
    `${singer} artist photo`,
  ]) {
    if (singerDone) break;
    try {
      let urls = await scrapeGoogle(query);
      if (!urls.length) urls = await scrapeBing(query);
      await downloadFirstWorking(urls, singerPath);
      singerDone = true;
      console.log(`   ✅  Singer  → singers/${key}.jpg`);
    } catch {
      // try next query
    }
    await delay(800);
  }

  if (!singerDone) console.error(`   ❌  Singer  failed for ${singer}`);

  // ---------- Concert photo ----------
  const concertPath = path.join(concertsDir, `${key}.jpg`);
  let concertDone = false;

  for (const query of [
    `${singer} live concert performance stage`,
    `${singer} concert tour show`,
    `${singer} performing live on stage`,
  ]) {
    if (concertDone) break;
    try {
      let urls = await scrapeGoogle(query);
      if (!urls.length) urls = await scrapeBing(query);
      await downloadFirstWorking(urls, concertPath);
      concertDone = true;
      console.log(`   ✅  Concert → concerts/${key}.jpg`);
    } catch {
      // try next query
    }
    await delay(800);
  }

  if (!concertDone) console.error(`   ❌  Concert failed for ${singer}`);
};

// ── Entry point ───────────────────────────────────────────────────────────────
(async () => {
  console.log(`🎤  Downloading images for ${singers.length} singers (no API key needed)\n`);
  let done = 0;
  for (const singer of singers) {
    console.log(`[${++done}/${singers.length}] ${singer}`);
    await downloadForSinger(singer);
    await delay(1200); // polite pause between singers
    console.log();
  }
  console.log('✅  All done!');
})();
