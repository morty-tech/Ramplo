export default (_req: any, res: any) => {
  res.status(200);
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end("<h1>✅ Baseline works</h1><p>Try /api/health</p>");
};
