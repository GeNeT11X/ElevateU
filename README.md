# ElevateU+ – AI Resume Intelligence & Learning Companion

ElevateU+ combines AI-powered resume analysis with personalized learning recommendations so that job seekers can understand where they stand and what to learn next. The solution is composed of two collaborating services:

1. **elevateuai** – a Node.js API that ingests PDF resumes, calls Cohere for deep analysis, enriches the output with LinkedIn job scraping, and serves the React front end.
2. **courserecom** – a lightweight Flask service that generates course suggestions (Coursera catalogue + similarity models) based on the skills detected in the resume.

Together they deliver an end-to-end experience: upload a resume → receive ATS insights, benchmark scores, job leads, and curated courses to close skill gaps.

---

## Core Capabilities
- **Resume analytics** – Cohere `command-r` prompts extract strengths, weaknesses, salary ranges, and keyword coverage.
- **ATS & benchmark scoring** – Resume sections are scored (skills, experience, education, achievements) and normalised against industry benchmarks bundled in `industry_benchmarks.js`.
- **Keyword intelligence** – Detects present and missing ATS keywords per industry, and surfaces improvement tips.
- **Job discovery** – Scrapes LinkedIn guest listings for matching roles (see `web-scrape.js`), with caching to reduce throttling.
- **Course recommendations** – Fetches courses from the Flask microservice (`GET /recommend`) using extracted strong skills.
- **Modern UI** – React + Vite front end with Auth0 scaffolding for login and animated visualisations of the analytics.

---

## System Architecture
```
┌─────────────┐   POST /analyze (PDF)   ┌───────────────────────────┐   GET /recommend?skills=...   ┌────────────────────┐
│ React (Vite)├────────────────────────►│ Node+Express (elevateuai) │──────────────────────────────►│ Flask (courserecom)│
└─────────────┘   analysis JSON         │ • Cohere resume analysis  │   course suggestions JSON     │ • Coursera search   │
       ▲                                 │ • LinkedIn job scraping   │                              │ • Similarity model  │
       │                                 └───────────────────────────┘                              └────────────────────┘
       └────────────────────────────── Rendered insights ◄──────────────────────────────────────────────────────────────┘
```
Both services run locally (by default on ports `5173`, `8080`, and `5001`). The Node API expects the Flask recommender to be reachable at `http://localhost:5001/recommend`.

---

## Repository Layout
```
├─ elevateuai/                 # Resume intelligence stack
│  ├─ backend/                 # Node.js API (Express, Cohere integration, job scraping)
│  └─ frontend/                # React + Vite client with Auth0-powered login screen
├─ courserecom/                # Course recommendation microservice (Flask)
│  ├─ app/                     # Original web app, models, and assets (Coursera dataset)
│  ├─ run.py                   # Lightweight /recommend endpoint used by elevateuai
│  └─ requirements.txt         # Python dependencies
└─ README.md                   # You are here
```

---

## Prerequisites
- **Node.js 18+** (ships with `npm`)
- **Python 3.10+** with `pip` / `venv`
- **Cohere API key** for resume analysis (`command-r-08-2024` model)
- Optional: Auth0 application (replace sample domain/client ID in `elevateuai/frontend/src/main.jsx`)

---

## Getting Started

### 1. Clone
```powershell
git clone https://github.com/<your-username>/elevateuplus.git](https://github.com/GeNeT11X/ElevateU.git
cd elevateuplus
```

### 2. Course Recommender (Flask – port 5001)
```powershell
cd courserecom
python -m venv .venv
.venv\Scripts\activate        # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python run.py                 # serves GET /recommend
```
`run.py` calls Coursera’s public search API and the in-repo similarity model for better matches. Keep this service running before you hit the Node API.

### 3. Resume Intelligence API (Node – port 8080)
```powershell
cd elevateuai\backend
npm install
```
Create `.env` in `elevateuai/backend`:
```
COHERE_API_KEY=your_cohere_api_key
PORT=8080                       # optional override
```
> **Note:** `server.js` currently defaults to `http://localhost:5001/recommend`. If you host the course service elsewhere, update the URL in `elevateuai/backend/server.js` (or extend it to read from an environment variable) before starting the API.  
Start the API:
```powershell
npm start
```
`npm start` uses `nodemon` for hot reloads.

### 4. Front End (React – Vite dev server on port 5173)
```powershell
cd elevateuai\frontend
npm install
```
Optionally create `.env` (Vite automatically loads `.env.local` etc.):
```
VITE_API_URL=http://localhost:8080/analyze
```
Run the UI:
```powershell
npm run dev
```
Open the printed URL (typically `http://localhost:5173`). Upload a PDF resume and monitor the terminal logs for Cohere responses and course fetches.

---

## API Reference
- `POST /analyze` (Express, `elevateuai/backend/server.js`)
  - **Body:** `multipart/form-data` with `resume=<PDF>`
  - **Response:** Detailed JSON containing scores, keyword analysis, job listings, and `course_recommendations` from the Flask service.
- `GET /recommend` (Flask, `courserecom/run.py`)
  - **Query:** `skills=python,ml,sql`
  - **Response:** `{ "recommended_courses": [ { "title": "...", "platform": "Coursera", "id": "...", "slug": "..." }, ... ] }`

The React UI consumes the `/analyze` endpoint directly; the jobs and course sub-sections render conditionally from the API payload.

---

## Configuration & Extensibility
- **Auth0 Login:** Update `domain` and `clientId` in `elevateuai/frontend/src/main.jsx` to wire in your own Auth0 tenant.
- **LinkedIn Scraping:** `web-scrape.js` performs guest scraping without authentication. Respect LinkedIn’s terms, expect rate limits, and consider adding proxy/cookie support if you need higher throughput.
- **Course Dataset:** `courserecom/app/api/assets/Coursera.csv` backs the similarity model. Replace or extend this data to cover more providers or update metadata.
- **Prompt Tuning:** Adjust the Cohere prompt in `server.js` (`createAnalysisPrompt`) to change scoring behaviour or add extra sections.
- **Environment Variables:** Use `.env` files (Node) and standard Flask config patterns (Python) to keep secrets out of source control.

---

## Running Everything Together
Open three terminals from the repo root:

```powershell
# Terminal 1 – Flask recommender
cd courserecom
.venv\Scripts\activate
python run.py

# Terminal 2 – Node resume analyzer
cd elevateuai\backend
npm start

# Terminal 3 – React front end
cd elevateuai\frontend
npm run dev
```
After all services report “running”, browse to `http://localhost:5173`, upload a PDF resume, and scroll to see ATS scores, job listings, and recommended courses.

---

## Troubleshooting
- **Empty AI response:** Verify `COHERE_API_KEY` and that your Cohere account has access to `command-r-08-2024`.
- **Course recommendations unavailable:** Ensure the Flask service is listening on port `5001` and reachable from Node (check console logs for `Course Recommendation Error`).
- **LinkedIn job scraping blocked:** Wait a few minutes, reduce frequency, or configure a proxy. Excessive requests may trigger rate limits.
- **Auth0 login loop:** Provide a valid Auth0 app or bypass Auth0 by simplifying `main.jsx` to render `<App />` directly.

---

## Publishing & Contribution Tracking
1. Add your GitHub remote and push:
   ```powershell
   git remote add origin https://github.com/<your-username>/elevateuplus.git
   git push -u origin main
   ```
2. On GitHub, open **Insights → Contributors** to see who has committed to the repository.
3. Use `git log --stat` locally if you need a detailed author breakdown before pushing.

---

## Contributing
Pull requests are welcome. Please open an issue describing the change you intend to make, include testing notes (manual or automated), and keep secrets out of commits.

---


---
Star ⭐ the repo if ElevateU+ helped you polish your resume! 🎯
