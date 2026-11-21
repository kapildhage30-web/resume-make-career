# ATS Resume Maker – Deploy Guide (Hinglish)

## 1. Razorpay account (paise pane ke liye)
1. razorpay.com par sign up karo, KYC complete karo (PAN, bank account).
2. Dashboard → Settings → API Keys → **Generate Key**. `Key ID` aur `Key Secret` copy karo.
   (Pehle Test mode me try karo, phir Live keys use karo.)

## 2. Claude API key
console.anthropic.com → API Keys → Create key.

## 3. Deploy (free) – Vercel
1. Is poore folder ko GitHub par upload karo.
2. vercel.com → New Project → apni repo import karo.
3. Settings → Environment Variables me daalo:
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - ANTHROPIC_API_KEY
   - PRICE_INR = 79
4. Deploy dabao. Aapko `https://your-app.vercel.app` jaisa link milega – wahi aapka resume maker link hai.

## Kaise kaam karta hai
- Preview free + watermark ke saath.
- Download par Razorpay payment hota hai (UPI/card/netbanking).
- Server payment signature verify karta hai; sahi hone par hi clean resume deta hai.
- Paise seedha aapke Razorpay account me aate hain, bank me settle hote hain.

## Dhyan rakhne wali baatein
- Price sirf server par (`PRICE_INR`) change hoti hai.
- Har AI call par Claude API ka chhota kharcha aata hai; `api/improve.js` me 5/hour per IP limit hai.
- Resume me personal data hota hai: Privacy Policy page lagao. Server kuch store nahi karta.
- Refund/Terms page Razorpay live approval ke liye zaroori hota hai.
