import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "dashboard" / "public" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

METRICS_FILE = DATA_DIR / "metrics.json"
HISTORY_FILE = DATA_DIR / "history.json"


def load_history():
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE) as f:
            return json.load(f)
    return {"activities": [], "daily_health": [], "weekly_volumes": [], "generated_at": None}


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def main():
    from garmin_sync import connect, fetch_activities, fetch_daily_health
    from analytics import compute_all, compute_weekly_volumes

    print("Loading existing history...")
    history = load_history()

    existing_activity_ids = {a.get("activity_id") for a in history["activities"]}
    existing_health_dates = {d["date"] for d in history["daily_health"]}

    print("Connecting to Garmin Connect...")
    api = connect()

    today = date.today()

    print("Fetching activities (last 90 days)...")
    new_activities = fetch_activities(api, today - timedelta(days=90), today)
    added = 0
    for a in new_activities:
        if a["activity_id"] not in existing_activity_ids:
            history["activities"].append(a)
            existing_activity_ids.add(a["activity_id"])
            added += 1
    print(f"  → {added} new activities added")

    cutoff_90 = (today - timedelta(days=90)).isoformat()
    history["activities"] = [a for a in history["activities"] if a["date"] >= cutoff_90]
    history["activities"].sort(key=lambda a: a["date"])

    print("Fetching daily health data (incremental)...")
    new_health = fetch_daily_health(
        api, today - timedelta(days=30), today, existing_health_dates
    )
    history["daily_health"].extend(new_health)
    print(f"  → {len(new_health)} new days fetched")

    cutoff_60 = (today - timedelta(days=60)).isoformat()
    history["daily_health"] = [d for d in history["daily_health"] if d["date"] >= cutoff_60]
    history["daily_health"].sort(key=lambda d: d["date"])

    history["weekly_volumes"] = compute_weekly_volumes(history["activities"])
    history["generated_at"] = today.isoformat()

    print("Saving history...")
    save_json(HISTORY_FILE, history)

    print("Computing analytics...")
    metrics = compute_all(history["activities"], history["daily_health"])

    print("Saving metrics...")
    save_json(METRICS_FILE, metrics)

    risk = metrics["injury_risk"]
    dist = metrics["max_safe_distance"]
    print(f"\nResults for {today}:")
    print(f"  Injury risk:        {risk['label'].upper()} ({risk['score']}/100)")
    print(f"  Max safe distance:  {dist['easy_km']}km easy / {dist['moderate_km']}km moderate / {dist['hard_km']}km hard")
    speed = metrics["speed_potential"]
    print(f"  Speed potential:    {speed['comfortable_pace']}/km comfortable, {speed['max_pace']}/km max push")


if __name__ == "__main__":
    main()
