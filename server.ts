import { readFileSync } from "fs";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import apiRouter from "./server/masterAPIRouter";

//If in production ts has been built to JS, must use index.html in build folder
const isProd = process.env["NODE_ENV"] === "production";
let html = readFileSync(isProd ? "build/index.html" : "index.html", "utf8");
let parsedHTML = "";

if (isProd) {
  //Code to parse where the script tag that is being added is added, then remove it, however doesn't work because the script bundle includes all of the react code + the vite dev server
  //God I love packing everything into one file
  let scriptStartIndex = html.indexOf(
    `<script type="module" crossorigin src="/assets/index`
  );
  let scriptEndIndex = html.indexOf(`</script>`, scriptStartIndex);

  console.log(scriptStartIndex, scriptEndIndex);

  parsedHTML =
    html.substring(0, scriptStartIndex) + html.substring(scriptEndIndex + 10);
} else parsedHTML = html;

console.log(parsedHTML);

const app = new Hono()
  .use("/*", serveStatic({ root: isProd ? "build/" : "./" })) //Serve the root folder, if running in dev serve base folder, if in prod serve build folder
  .use("/*", serveStatic({ root: "public/" })); //Serve images

app.route("/api", apiRouter);

app.get("/*", (c) => c.html(html));

export default app;

if (isProd) {
  serve({ ...app, port: 4000 }, (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  });
}
