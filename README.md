# Smart Stay — Rent-Free Luxury Living Web Application & Leads Hub

Mobile-first real estate qualification and call scheduling application integrated with Google Chat alerts and WhatsApp automation.

## 🚀 Key Features

- **Mobile Application UX:** Seamless iOS/Android native app aesthetic with segmented step progress, luxury option cards, and digital voucher passes.
- **Qualification Wizard (4 Steps):**
  1. Residence Configuration (1 BHK Luxury, 2 BHK Premium, 2.5 BHK, 3 BHK Signature, 3.5/4 BHK, or Custom BHK).
  2. Initial Investment Band selection.
  3. Specialist Consultation Call Scheduling (Dynamic past-time validation, Today / Tomorrow tabs, 1-tap time chips).
  4. Contact & Location Verification (Bangalore quick-pick chips, inline validation without native browser popups).
- **Executive Allotment Pass:** Apple Wallet / Boarding Pass digital ticket featuring real-time generated reference IDs (`SS-BLR-XXXXX`) and 1-tap copy functionality.
- **Dual Notification Hub:**
  - **Google Chat Alerts:** Real-time rich interactive cards dispatched to team spaces with 1-tap WhatsApp and Phone dialer buttons.
  - **WhatsApp Automation:** Direct client deep link + automated AiSensy template dispatch and sales helpline alerts.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (zero heavy framework overhead, blazing fast load times)
- **Integrations:** Google Chat Webhooks API, AiSensy WhatsApp Campaign API

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. Start Local Server
```bash
npm start
```
The application will be live at `http://localhost:3000`.

---

## 🌐 Deployment

### Deploy to Render / Railway
This project includes pre-configured `Dockerfile` and `render.yaml` manifests for 1-click cloud deployment.
1. Push this repository to GitHub.
2. Link the repository on [Render](https://render.com) or [Railway](https://railway.app).
3. Set your environment variables (`GOOGLE_CHAT_WEBHOOK_URL`, `AISENSY_API_KEY`, etc.).
4. Your application will be live 24/7 with automatic SSL.
