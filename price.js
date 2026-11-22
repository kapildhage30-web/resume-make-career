module.exports = (req, res) => res.json({ price: Number(process.env.PRICE_INR || 79) });
