const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const path = require("path");
const next = require("next");

// Passenger often starts with cwd = public_html. Always use this file's folder.
const dir = __dirname;
const nextDir = path.join(dir, ".next");
const port = Number.parseInt(process.env.PORT || "3000", 10);

process.env.NODE_ENV = "production";
process.chdir(dir);

console.log("[cpanel] cwd=", process.cwd());
console.log("[cpanel] dir=", dir);
console.log("[cpanel] .next exists=", fs.existsSync(nextDir));

if (!fs.existsSync(nextDir)) {
  console.error(
    "[cpanel] Missing .next. Upload the Mac build to",
    nextDir,
  );
  process.exit(1);
}

const app = next({ dev: false, dir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, () => {
      console.log(`Super Heng Bullion ready on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("[cpanel] next prepare failed:", error);
    process.exit(1);
  });
