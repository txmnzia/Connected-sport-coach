# Sport Coach

A personal running analytics dashboard that pulls your Garmin data, computes injury risk, max safe distance, and speed potential, then serves it as a static site on GitHub Pages.

No cloud API. No backend to maintain. Everything runs in GitHub Actions.

---

## What it shows

| Insight | What it means |
|---|---|
| **Injury risk** | Low / Moderate / High / Very High — based on training load, HRV, volume spike, and sleep |
| **Max safe distance** | How far you can safely run at easy, moderate, or hard effort |
| **Speed potential** | Your comfortable and ceiling pace for a 5K given today's readiness |
| **Weekly volume chart** | 12-week history with 4-week average reference line |
| **Recovery** | HRV vs your personal baseline, sleep score, body battery |
| **Fitness & weak spots** | Training trajectory and patterns to work on |

---

## Setup (15 minutes)

### 1. Enable GitHub Pages

In your repo → **Settings → Pages → Source → GitHub Actions**

### 2. Add Garmin credentials as secrets

In your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `GARMIN_EMAIL` | Your Garmin Connect email |
| `GARMIN_PASSWORD` | Your Garmin Connect password |

> **MFA note:** If you have two-factor authentication on Garmin Connect, the pipeline cannot log in automatically. You can disable MFA in Garmin account settings, or use the session token workaround in the Advanced section below.

### 3. Trigger the first sync

**Actions → Sync & Deploy → Run workflow**

The first run fetches 90 days of activities and 30 days of health data, builds the dashboard, and deploys it. Every subsequent run only fetches new data.

### 4. Your dashboard is live at

```
https://<your-username>.github.io/<repo-name>/
```

---

## How it works

```
GitHub Actions  (daily at 6 AM UTC)
  ↓
pipeline/run_pipeline.py
  ├── Fetches running activities (last 90 days)
  ├── Fetches daily health: HRV, sleep, body battery, resting HR
  ├── Computes: ACWR · injury risk · max safe distance · speed potential
  └── Writes dashboard/public/data/metrics.json + history.json
  ↓
Commits updated data files to the repo
  ↓
Builds React dashboard (Vite + Tailwind)
  ↓
Deploys to GitHub Pages
```

---

## Analytics methodology

### Injury risk (0–100)

| Signal | Weight | Risk triggers |
|---|---|---|
| Acute:Chronic Workload Ratio (7d vs 28d load) | 35% | > 1.3 elevated, > 1.5 high |
| HRV vs personal baseline | 25% | < 80% of baseline = suppressed |
| Weekly km vs 4-week average | 20% | > 30% spike = high |
| Sleep score | 10% | < 65 = poor |
| Resting HR vs baseline | 10% | > 10% above = elevated |

### Max safe distance

Starts from your longest run in the past 28 days, allows +20% progression, then applies downward modifiers for elevated ACWR, suppressed HRV, poor sleep, or elevated resting HR. Scaled by effort: easy × 1.0, moderate × 0.80, hard × 0.60.

### Speed potential

Finds your best recent pace over runs >4km (last 90 days). Comfortable = ~75 sec/km slower (Zone 2 effort). Max push degrades proportionally to your readiness score today.

---

## Local development

```bash
# Dashboard with sample data
cd dashboard && npm install && npm run dev

# Pipeline (needs Garmin credentials)
cd pipeline
pip install -r requirements.txt
GARMIN_EMAIL=you@example.com GARMIN_PASSWORD=pass python run_pipeline.py
```

---

## Advanced: MFA workaround

If Garmin two-factor auth blocks the pipeline:

1. Generate a session token locally (you'll be prompted for the MFA code once):
   ```bash
   python -c "
   from garminconnect import Garmin
   import base64, zipfile, io, os
   api = Garmin('you@example.com', 'password')
   api.login()
   api.garth.dump('/tmp/garth')
   buf = io.BytesIO()
   with zipfile.ZipFile(buf, 'w') as z:
       for f in os.listdir('/tmp/garth'):
           z.write(f'/tmp/garth/{f}', f)
   print(base64.b64encode(buf.getvalue()).decode())
   "
   ```
2. Add the output as a GitHub secret named `GARMIN_SESSION_B64`
3. In `pipeline/garmin_sync.py`, replace the `connect()` body with token loading (see code comments)
