export default (_req: any, res: any) => {
  res.status(200).json({ ok: true, runtime: "nodejs20.x" });
};