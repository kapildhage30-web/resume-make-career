// Payment signature verify karta hai. Sahi hone par hi final clean resume deta hai.
const crypto = require("crypto");
const esc = s => String(s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const lines = s => String(s || "").split("\n").map(l => l.trim()).filter(Boolean)
  .map(l => /^[-•*]/.test(l) ? `<li>${esc(l.replace(/^[-•*]\s*/, ""))}</li>` : `<p class="r">${esc(l)}</p>`)
  .join("").replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul>${m}</ul>`);
const sec = (h, b) => b.trim() ? `<h2>${h}</h2>${b}` : "";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { order_id, payment_id, signature, data } = req.body || {};
  if (!order_id || !payment_id || !signature || !data) return res.status(400).json({ error: "bad_request" });
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(order_id + "|" + payment_id).digest("hex");
  const ok = expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!ok) return res.status(402).json({ error: "payment_not_verified" });
  const v = k => data[k] || "";
  const contact = [v("email"), v("phone"), v("loc"), v("links")].filter(Boolean).map(esc).join(" | ");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(v("name"))} - Resume</title>
<style>body{font:11pt/1.4 Arial,Helvetica,sans-serif;color:#000;max-width:720px;margin:24px auto}
h1{font-size:20pt;margin:0;text-align:center}.c{text-align:center;font-size:10pt}
h2{font-size:13pt;border-bottom:1px solid #000;margin:14px 0 6px;padding-bottom:2px}
ul{margin:2px 0 4px 18px;padding:0}li{margin:2px 0}p{margin:0}p.r{margin:6px 0 2px;font-weight:bold}
@media print{body{margin:0}}</style></head><body>
<h1>${esc(v("name"))}</h1><div class="c">${esc(v("title"))}</div><div class="c">${contact}</div>
${sec("PROFESSIONAL SUMMARY", `<p>${esc(v("summary"))}</p>`)}${sec("SKILLS", `<p>${esc(v("skills"))}</p>`)}
${sec("WORK EXPERIENCE", lines(v("exp")))}${sec("PROJECTS", lines(v("proj")))}
${sec("EDUCATION", lines(v("edu")))}${sec("CERTIFICATIONS &amp; ACHIEVEMENTS", lines(v("cert")))}
</body></html>`;
  res.json({ html });
};
