// Razorpay order banata hai (amount server par fix hai, user badal nahi sakta)
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const price = Number(process.env.PRICE_INR || 79);
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: price * 100, currency: "INR", receipt: "rs_" + Date.now() })
  });
  const o = await r.json();
  if (!r.ok) return res.status(500).json({ error: "order_failed" });
  res.json({ order_id: o.id, amount: o.amount, key: process.env.RAZORPAY_KEY_ID });
};
