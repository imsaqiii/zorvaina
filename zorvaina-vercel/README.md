# Zorvaina Website (Vercel)

Frontend: static HTML/CSS/JS (root folder + `assets/`)
Backend: `api/contact.js` (Vercel Serverless Function, contact form -> email via Resend)

## Deploy
1. Is folder ko GitHub repo mein push karein (ya `vercel` CLI use karein).
2. vercel.com -> Add New Project -> repo import -> Framework Preset: **Other** -> Deploy.
3. Project -> Settings -> Environment Variables:
   - `RESEND_API_KEY` = aapki key (resend.com par free account banayein, usi email se jo enquiries receive karni hai)
   - `CONTACT_TO` (optional) = real.saqiii@gmail.com
   - `CONTACT_FROM` (optional) = "Zorvaina <hello@aapka-domain.com>" (domain Resend mein verify karne ke baad)
4. Env vars add karne ke baad **Redeploy** karein.

Note: Resend ka default sender `onboarding@resend.dev` sirf aapke apne Resend account ki email par mail bhej sakta hai. Kisi aur address par bhejne ke liye domain verify karein.

## Local test
`npm i -g vercel` -> `vercel dev`
