import assert from "node:assert/strict";
import worker from "../dist/server/index.js";

class MockDB {
  boxes = new Map();
  assets = new Map();
  prepare(sql) {
    return {
      bind: (...args) => ({
        run: async () => this.run(sql, args),
        first: async () => this.first(sql, args),
        _sql: sql,
        _args: args,
      }),
    };
  }
  async batch(statements) {
    for (const statement of statements) await this.run(statement._sql, statement._args);
    return statements.map(() => ({ success: true }));
  }
  async run(sql, args) {
    if (sql.startsWith("INSERT INTO boxes")) this.boxes.set(args[0], { payload: args[1], created_at: args[2] });
    if (sql.startsWith("INSERT INTO uploaded_assets")) this.assets.set(args[0], { box_id: args[1], object_key: args[2], content_type: args[3] });
    return { success: true };
  }
  async first(sql, args) {
    if (sql.startsWith("SELECT payload")) return this.boxes.get(args[0]) || null;
    if (sql.startsWith("SELECT object_key")) {
      const asset = this.assets.get(args[0]);
      return asset?.box_id === args[1] ? asset : null;
    }
    return null;
  }
}

class MockBucket {
  objects = new Map();
  async put(key, bytes, options) { this.objects.set(key, { bytes, options }); }
  async delete(key) { this.objects.delete(key); }
  async get(key) {
    const object = this.objects.get(key);
    return object ? { body: object.bytes, httpEtag: '"test"' } : null;
  }
}

const env = { DB: new MockDB(), BUCKET: new MockBucket() };
const baseBox = {
  theme: "special",
  recipient: "Deniz",
  sender: "Berkant",
  title: "İyi ki varsın",
  note: "Bu kutuda biraz biz varız.",
  finalNote: "Daha nice anılara. ♡",
  style: { palette: "rose", icon: "♡", font: "romantic", layout: "collage", effect: "stars" },
  items: [{ id: "client-id", type: "text", title: "", text: "İyi ki.", shape: "heart", url: "", photo: "" }],
};

const home = await worker.fetch(new Request("https://sakli.example/"), env);
assert.equal(home.status, 200);
const homeHtml = await home.text();
assert.match(homeHtml, /Paylaşım linki oluştur/);
assert.match(homeHtml, /\.\/style\.css\?v=5/);

const nestedStyle = await worker.fetch(new Request("https://sakli.example/b/style.css?v=5"), env);
assert.equal(nestedStyle.status, 200);
assert.match(nestedStyle.headers.get("content-type"), /text\/css/);

const sitemap = await worker.fetch(new Request("https://sakli.example/sitemap.xml"), env);
assert.equal(sitemap.status, 200);
assert.match(await sitemap.text(), /https:\/\/saklianikutusu\.berkantkul\.com\.tr\//);
const robots = await worker.fetch(new Request("https://sakli.example/robots.txt"), env);
assert.equal(robots.status, 200);
assert.match(await robots.text(), /Disallow: \/b\//);

const created = await worker.fetch(new Request("https://sakli.example/api/boxes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(baseBox) }), env);
assert.equal(created.status, 201);
const createdJson = await created.json();
assert.match(createdJson.url, /^\/b\/[A-Za-z0-9_-]{16,64}$/);

const loaded = await worker.fetch(new Request(`https://sakli.example/api/boxes/${createdJson.id}`), env);
assert.equal(loaded.status, 200);
const loadedJson = await loaded.json();
assert.equal(loadedJson.finalNote, baseBox.finalNote);
assert.equal(loadedJson.items[0].text, "İyi ki.");
assert.notEqual(loadedJson.items[0].id, "client-id");

const photoBox = structuredClone(baseBox);
photoBox.items = [{ id: "photo", type: "photo", title: "Biz", text: "", shape: "heart", url: "", photo: "data:image/png;base64,aGVsbG8=" }];
const photoCreated = await worker.fetch(new Request("https://sakli.example/api/boxes", { method: "POST", body: JSON.stringify(photoBox) }), env);
assert.equal(photoCreated.status, 201);
const photoCreatedJson = await photoCreated.json();
const photoLoaded = await (await worker.fetch(new Request(`https://sakli.example/api/boxes/${photoCreatedJson.id}`), env)).json();
assert.match(photoLoaded.items[0].photo, /^\/api\/boxes\/.+\/photos\/.+$/);
const image = await worker.fetch(new Request(`https://sakli.example${photoLoaded.items[0].photo}`), env);
assert.equal(image.status, 200);
assert.equal(image.headers.get("content-type"), "image/png");
assert.equal(await image.text(), "hello");

console.log("Share creation, durable box retrieval, photo storage and static routes passed.");
