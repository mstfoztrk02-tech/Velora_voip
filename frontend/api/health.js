export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "democrmai api",
    time: new Date().toISOString()
  });
}
