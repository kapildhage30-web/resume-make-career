// Claude se resume ko ATS format me convert karwata hai
const hits = new Map(); // simple rate limit (per IP, 5/hour)
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const ip = (req.headers["x-forwarded-for"] || "x").split(",")[0];
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  if (arr.length >= 5) return res.status(429).json({ error: "rate_limited" });
  arr.push(now); hits.set(ip, arr);
  const text = String((req.body || {}).text || "").slice(0, 12000);
  if (text.length < 40) return res.status(400).json({ error: "too_short" });
  const prompt = `Convert this resume text into an ATS-optimized resume. Return ONLY valid JSON with string keys: name,title,email,phone,loc,links,summary (2-3 lines, keyword rich),skills (comma separated),exp (each role: "Role | Company | Dates" line then bullets starting with "- " using strong action verbs; do NOT invent facts or numbers),proj,edu,cert. Use \\n for new lines.\n\nRESUME:\n${text}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
    });
    const j = await r.json();
    const t = (j.content || []).map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
    res.json(JSON.parse(t));
  } catch (e) { res.status(500).json({ error: "ai_failed" }); }
};
