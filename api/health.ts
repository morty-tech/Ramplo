import type { VercelRequest, VercelResponse } from "@vercel/node";
export default (_req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({ ok: true, runtime: "nodejs20.x" });
};
