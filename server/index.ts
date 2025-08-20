import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  res.status(200);
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Vercel baseline</title></head>
<body>
  <h1>✅ It works</h1>
  <p>Health: <code>/api/health</code></p>
</body></html>`);
}
