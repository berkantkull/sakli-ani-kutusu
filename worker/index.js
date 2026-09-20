const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; script-src 'self'; frame-src https://open.spotify.com; connect-src 'self'; base-uri 'none'; form-action 'self'",
};
const TYPES = new Set(["postcard", "text", "photo", "song"]);
const SHAPES = new Set(["heart", "circle", "wave"]);
const THEMES = new Set(["love", "birthday", "anniversary", "valentine", "promotion", "just", "special"]);
const MAX_BODY_BYTES = 18 * 1024 * 1024;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 12 * 1024 * 1024;
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://saklianikutusu.berkantkul.com.tr/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /b/

Sitemap: https://saklianikutusu.berkantkul.com.tr/sitemap.xml
`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function randomId(bytes = 18) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...data)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function text(value, limit, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, limit) : fallback;
}

function spotifyUrl(value) {
  try {
    const url = new URL(value);
    const match = url.protocol === "https:" && url.hostname === "open.spotify.com" && url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(track|album|playlist)\/([A-Za-z0-9]{22})\/?$/);
    return match ? `https://open.spotify.com/${match[1]}/${match[2]}` : "";
  } catch {
    return "";
  }
}

function decodePhoto(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const contentType = `image/${match[1]}`;
  const binary = atob(match[2]);
  if (!binary.length || binary.length > MAX_PHOTO_BYTES) return null;
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType };
}

function normalizeBox(input, boxId) {
  if (!input || typeof input !== "object" || !THEMES.has(input.theme) || !Array.isArray(input.items) || input.items.length < 1 || input.items.length > 16) throw new Error("Kutuda 1–16 anı olmalı.");
  const output = {
    theme: input.theme,
    recipient: text(input.recipient, 40),
    sender: text(input.sender, 40),
    title: text(input.title, 70),
    note: text(input.note, 240),
    finalNote: text(input.finalNote, 120),
    style: {
      palette: text(input.style?.palette, 20, "theme"),
      icon: text(input.style?.icon, 4, "♡"),
      font: text(input.style?.font, 20, "romantic"),
      layout: text(input.style?.layout, 20, "collage"),
      effect: text(input.style?.effect, 20, "hearts"),
    },
    items: [],
  };
  const photos = [];
  let photoBytes = 0;
  for (const raw of input.items) {
    if (!raw || !TYPES.has(raw.type)) throw new Error("Kutuda desteklenmeyen bir anı var.");
    const item = {
      id: randomId(9),
      type: raw.type,
      title: text(raw.title, 100),
      text: text(raw.text, 700),
      shape: SHAPES.has(raw.shape) ? raw.shape : "heart",
      url: "",
      photo: "",
    };
    if (item.type === "song") {
      item.url = spotifyUrl(raw.url);
      if (!item.url) throw new Error("Spotify bağlantılarından biri geçersiz.");
    }
    if (item.type === "photo") {
      const photo = decodePhoto(raw.photo);
      if (!photo) throw new Error("Fotoğraflardan biri okunamadı veya çok büyük.");
      photoBytes += photo.bytes.byteLength;
      if (photoBytes > MAX_TOTAL_PHOTO_BYTES) throw new Error("Fotoğrafların toplam boyutu çok büyük.");
      const assetId = randomId(12);
      item.photo = `/api/boxes/${boxId}/photos/${assetId}`;
      photos.push({ ...photo, id: assetId, objectKey: `boxes/${boxId}/${assetId}` });
    }
    output.items.push(item);
  }
  return { output, photos };
}

async function createBox(request, env) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return json({ error: "Kutu çok büyük. Birkaç fotoğrafı azaltıp tekrar dene." }, 413);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: "Kutu çok büyük. Birkaç fotoğrafı azaltıp tekrar dene." }, 413);
    input = JSON.parse(raw);
  } catch {
    return json({ error: "Kutu bilgileri okunamadı." }, 400);
  }
  const id = randomId();
  let normalized;
  try {
    normalized = normalizeBox(input, id);
  } catch (error) {
    return json({ error: error.message || "Kutuda eksik bilgi var." }, 400);
  }
  const uploaded = [];
  try {
    for (const photo of normalized.photos) {
      await env.BUCKET.put(photo.objectKey, photo.bytes, { httpMetadata: { contentType: photo.contentType, cacheControl: "public, max-age=31536000, immutable" } });
      uploaded.push(photo.objectKey);
    }
    const createdAt = Date.now();
    const statements = [env.DB.prepare("INSERT INTO boxes (id, payload, created_at) VALUES (?, ?, ?)").bind(id, JSON.stringify(normalized.output), createdAt)];
    for (const photo of normalized.photos) {
      statements.push(env.DB.prepare("INSERT INTO uploaded_assets (id, box_id, object_key, content_type, byte_size, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(photo.id, id, photo.objectKey, photo.contentType, photo.bytes.byteLength, createdAt));
    }
    await env.DB.batch(statements);
    return json({ id, url: `/b/${id}` }, 201);
  } catch (error) {
    console.error("createBox failed", error);
    await Promise.allSettled(uploaded.map((key) => env.BUCKET.delete(key)));
    return json({ error: "Kutun şu anda kaydedilemedi. Biraz sonra tekrar dene." }, 503);
  }
}

async function getBox(id, env) {
  try {
    const row = await env.DB.prepare("SELECT payload FROM boxes WHERE id = ? LIMIT 1").bind(id).first();
    if (!row) return json({ error: "Kutu bulunamadı." }, 404);
    return new Response(row.payload, { headers: JSON_HEADERS });
  } catch (error) {
    console.error("getBox failed", error);
    return json({ error: "Kutu şu anda açılamıyor." }, 503);
  }
}

async function getPhoto(boxId, assetId, env) {
  try {
    const row = await env.DB.prepare("SELECT object_key, content_type FROM uploaded_assets WHERE id = ? AND box_id = ? LIMIT 1").bind(assetId, boxId).first();
    if (!row) return new Response("Not found", { status: 404 });
    const object = await env.BUCKET.get(row.object_key);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { headers: { "content-type": row.content_type, "cache-control": "public, max-age=31536000, immutable", etag: object.httpEtag || "" } });
  } catch (error) {
    console.error("getPhoto failed", error);
    return new Response("Storage unavailable", { status: 503 });
  }
}

function staticResponse(body, contentType, cache = "public, max-age=300") {
  return new Response(body, { headers: { ...SECURITY_HEADERS, "content-type": contentType, "cache-control": cache } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "POST" && path === "/api/boxes") return createBox(request, env);
    const photoMatch = path.match(/^\/api\/boxes\/([A-Za-z0-9_-]{16,64})\/photos\/([A-Za-z0-9_-]{12,64})$/);
    if (request.method === "GET" && photoMatch) return getPhoto(photoMatch[1], photoMatch[2], env);
    const boxMatch = path.match(/^\/api\/boxes\/([A-Za-z0-9_-]{16,64})$/);
    if (request.method === "GET" && boxMatch) return getBox(boxMatch[1], env);
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD, POST" } });
    if (path === "/style.css" || path === "/b/style.css") return staticResponse(STYLE_CSS, "text/css; charset=utf-8");
    if (path === "/app.js" || path === "/b/app.js") return staticResponse(APP_JS, "text/javascript; charset=utf-8");
    if (path === "/sitemap.xml") return staticResponse(SITEMAP_XML, "application/xml; charset=utf-8", "public, max-age=3600");
    if (path === "/robots.txt") return staticResponse(ROBOTS_TXT, "text/plain; charset=utf-8", "public, max-age=3600");
    if (path === "/" || /^\/b\/[A-Za-z0-9_-]{16,64}\/?$/.test(path)) return staticResponse(INDEX_HTML, "text/html; charset=utf-8", "no-cache");
    return new Response("Not found", { status: 404, headers: SECURITY_HEADERS });
  },
};
