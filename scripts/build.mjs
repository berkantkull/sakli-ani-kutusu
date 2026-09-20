import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const [html, css, js, worker] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("style.css", "utf8"),
  readFile("app.js", "utf8"),
  readFile("worker/index.js", "utf8"),
]);

await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });

const bundle = [
  `const INDEX_HTML = ${JSON.stringify(html)};`,
  `const STYLE_CSS = ${JSON.stringify(css)};`,
  `const APP_JS = ${JSON.stringify(js)};`,
  worker,
].join("\n");

await writeFile("dist/server/index.js", bundle);
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/.openai/drizzle", { recursive: true });
