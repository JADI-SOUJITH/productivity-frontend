# AI Productivity Tracker — Frontend

React dashboard for the AI Productivity Tracker. Shows real-time productivity stats, charts, and an AI coach powered by Groq. Built with TanStack Start and deployed on Cloudflare Workers.

**Live Dashboard:** https://tanstack-start-app.productivity-tracker.workers.dev

---

## What This Does

- Fetches analytics from the Flask backend every 30 seconds
- Displays productivity score, top sites, category breakdown, hourly activity
- Shows behavior metrics — avg session, tab switch rate, focus score, longest focus
- Compares today's performance against historical averages
- AI Coach chat (Groq LLaMA 3.3 70B) that responds to questions about your data

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (SSR React) |
| Styling | TailwindCSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Hosting | Cloudflare Workers |
| Language | TypeScript |

---

## Project Structure

```
productivity-frontend/
├── src/
│   ├── routes/
│   │   ├── __root.tsx        # Root layout
│   │   └── index.tsx         # Main dashboard page
│   ├── components/
│   │   └── dashboard/
│   │       ├── AICoach.tsx       # AI chat component
│   │       ├── ChartCard.tsx     # Chart wrapper card
│   │       ├── Charts.tsx        # TopSites, Category, Hourly charts
│   │       ├── Comparison.tsx    # Today vs Average table
│   │       └── StatCard.tsx      # Metric cards
│   └── styles.css            # Global styles
├── wrangler.jsonc            # Cloudflare Workers config
├── vite.config.ts            # Vite config
└── README.md
```

---

## Local Setup

**1. Clone the repo**
```bash
git clone https://github.com/JADI-SOUJITH/productivity-frontend.git
cd productivity-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Make sure backend is running**

Either run locally:
```bash
# In your backend folder
python collector.py
```

Or point to the live Render backend (already set in the code).

**4. Run dev server**
```bash
npm run dev
```

Opens on `http://localhost:8080`

---

## Deployment (Cloudflare Workers)

**1. Install Wrangler**
```bash
npm install -g wrangler
```

**2. Login to Cloudflare**
```bash
wrangler login
```

**3. Build and deploy**
```bash
npm run build
wrangler deploy
```

Your app deploys to `https://tanstack-start-app.productivity-tracker.workers.dev`

---

## How It Works

1. Dashboard loads → fetches `GET /data` from Flask backend
2. Every 30 seconds, data refreshes automatically
3. Charts update with latest productivity metrics
4. AI Coach sends messages to `POST /coach` on the backend
5. Groq LLaMA 3.3 70B generates a contextual reply using your live stats

---

## Chrome Extension

The dashboard only shows data if the Chrome Extension is installed and running. The extension tracks your tab usage and sends it to the Flask backend.

To install the extension:
1. Download the extension folder
2. Go to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked** → select the folder

---

## Related Repos

- **Backend:** https://github.com/JADI-SOUJITH/productivity-backend
- **Live API:** https://productivity-backend-wayz.onrender.com
