import os
import sys
from datetime import date, timedelta

from garminconnect import Garmin, GarminConnectAuthenticationError


def connect():
    email = os.environ.get("GARMIN_EMAIL")
    password = os.environ.get("GARMIN_PASSWORD")
    if not email or not password:
        print("Error: GARMIN_EMAIL and GARMIN_PASSWORD environment variables required.", file=sys.stderr)
        sys.exit(1)
    try:
        api = Garmin(email, password)
        api.login()
        return api
    except GarminConnectAuthenticationError as e:
        print(f"Garmin authentication failed: {e}", file=sys.stderr)
        sys.exit(1)


def fetch_activities(api, start_date, end_date):
    raw = api.get_activities_by_date(
        start_date.isoformat(), end_date.isoformat(), "running"
    )
    activities = []
    for a in raw:
        distance_m = a.get("distance") or 0
        duration_s = a.get("duration") or 0
        avg_speed = a.get("averageSpeed") or 0  # m/s

        avg_pace_s = round(1000 / avg_speed, 1) if avg_speed > 0 else 0

        activities.append({
            "date": (a.get("startTimeLocal") or "")[:10],
            "activity_id": a.get("activityId"),
            "distance_km": round(distance_m / 1000, 2),
            "duration_min": round(duration_s / 60, 1),
            "avg_pace_s": avg_pace_s,
            "avg_hr": a.get("averageHR") or 0,
            "max_hr": a.get("maxHR") or 0,
            "cadence": a.get("averageRunningCadenceInStepsPerMinute") or 0,
            "elevation_gain_m": a.get("elevationGain") or 0,
            "training_load": a.get("activityTrainingLoad") or 0,
            "aerobic_effect": a.get("aerobicTrainingEffect") or 0,
            "ground_contact_balance": a.get("groundContactBalanceLeft") or 50.0,
        })
    return activities


def _extract_rhr(rhr_data):
    if isinstance(rhr_data, (int, float)):
        return int(rhr_data)
    if isinstance(rhr_data, dict):
        metrics = rhr_data.get("allMetrics", {}).get("metricsMap", {})
        entries = metrics.get("WELLNESS_RESTING_HEART_RATE", [])
        if entries:
            return entries[0].get("value")
    return None


def _extract_sleep(sleep_data):
    dto = (sleep_data or {}).get("dailySleepDTO", {})
    scores = (sleep_data or {}).get("sleepScores", {})
    overall = scores.get("overall")
    score = overall.get("value") if isinstance(overall, dict) else overall
    duration_h = round(dto.get("sleepTimeSeconds", 0) / 3600, 1) if dto else None
    return score, duration_h


def _extract_hrv(hrv_data):
    summary = (hrv_data or {}).get("hrvSummary", {})
    return {
        "hrv_7day_avg": summary.get("weeklyAvg"),
        "hrv_last_night": summary.get("lastNight"),
        "hrv_status": (summary.get("status") or "").lower(),
    }


def fetch_daily_health(api, start_date, end_date, existing_dates=None):
    existing_dates = existing_dates or set()
    days = []
    current = start_date

    while current <= end_date:
        date_str = current.isoformat()
        if date_str not in existing_dates:
            day = {"date": date_str}

            try:
                stats = api.get_stats(date_str)
                day["body_battery_high"] = stats.get("bodyBatteryHighValue")
                day["body_battery_low"] = stats.get("bodyBatteryLowValue")
                day["stress_avg"] = stats.get("averageStressLevel")
            except Exception:
                pass

            try:
                day["resting_hr"] = _extract_rhr(api.get_rhr_day(date_str))
            except Exception:
                pass

            try:
                score, hours = _extract_sleep(api.get_sleep_data(date_str))
                day["sleep_score"] = score
                day["sleep_hours"] = hours
            except Exception:
                pass

            try:
                day.update(_extract_hrv(api.get_hrv_data(date_str)))
            except Exception:
                pass

            days.append(day)

        current += timedelta(days=1)

    return days


def sync_data(activities_days=90, health_days=30):
    api = connect()
    today = date.today()

    print(f"Fetching running activities (last {activities_days} days)...")
    activities = fetch_activities(api, today - timedelta(days=activities_days), today)
    print(f"  → {len(activities)} activities found")

    print(f"Fetching daily health (last {health_days} days)...")
    daily_health = fetch_daily_health(api, today - timedelta(days=health_days), today)
    print(f"  → {len(daily_health)} days fetched")

    return activities, daily_health
