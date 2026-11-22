// Claude se resume ko ATS format me convert karwata hai
const hits = new Map(); // simple rate limit (per IP, 8/hour)
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "no_api_key" });
  const ip = (req.headers["x-forwarded-for"] || "x").split(",")[0];
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  if (arr.length >= 8) return res.status(429).json({ error: "too_many_requests" });
  arr.push(now); hits.set(ip, arr);
  const text = String((req.body || {}).text || "").slice(0, 15000);
  if (text.length < 40) return res.status(400).json({ error: "too_short" });
  const prompt = `You are an expert resume writer. Rebuild the messy resume text below into a clean, professional, ATS-friendly resume and return it using the resume tool.

Rules:
- summary: 3-4 lines, professional, keyword-rich, based only on facts in the resume (no "I", no filler).
- skills: comma-separated, grouped sensibly (tools/software, technical skills, soft skills last).
- exp: for each job write one line "Job Title | Company | Location | Dates", then 4-7 short bullet lines starting with "- ". Each bullet starts with a strong action verb. Turn long run-on paragraphs into separate, specific bullets. Separate lines with real new lines.
- edu, cert, proj: one entry per line (use "- " for bullets where useful).
- Fix spelling, capitalization and grammar. Do NOT invent employers, dates, numbers, degrees or skills that are not in the text. If something is missing, use an empty string.

RESUME TEXT:
${text}`;
  const str = { type: "string" };
  const tool = { name: "resume", description: "The rebuilt ATS-friendly resume",
    input_schema: { type: "object", required: ["name","title","email","phone","loc","links","summary","skills","exp","proj","edu","cert"],
      properties: { name: str, title: str, email: str, phone: str, loc: str, links: str, summary: str, skills: str, exp: str, proj: str, edu: str, cert: str } } };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 4096, tools: [tool], tool_choice: { type: "tool", name: "resume" }, messages: [{ role: "user", content: prompt }] })
    });
    const raw = await r.text();
    if (!r.ok) { console.error("anthropic_error", r.status, raw.slice(0, 400)); return res.status(502).json({ error: "ai_error_" + r.status }); }
    const j = JSON.parse(raw);
    const tu = (j.content || []).find(c => c.type === "tool_use");
    if (!tu || !tu.input) { console.error("no_tool_output", raw.slice(0, 400)); return res.status(502).json({ error: "bad_ai_output" }); }
    res.json(tu.input);
  } catch (e) { console.error("improve_failed", e && e.message); res.status(500).json({ error: "ai_failed" }); }
};
