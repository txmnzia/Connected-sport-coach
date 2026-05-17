import statistics
from datetime import date, timedelta


def pace_str(seconds_per_km):
    if not seconds_per_km or seconds_per_km <= 0:
        return "N/A"
    m = int(seconds_per_km // 60)
    s = int(seconds_per_km % 60)
    return f"{m}:{s:02d}"


def compute_training_load(activities):
    today = date.today()

    def daily_load(target):
        total = 0
        for a in activities:
            if a["date"] == target.isoformat():
                load = a.get("training_load") or 0
                if load == 0 and a.get("duration_min") and a.get("avg_hr"):
                    load = a["duration_min"] * (a["avg_hr"] / 180) ** 2 * 10
                total += load
        return total

    acute = sum(daily_load(today - timedelta(days=i)) for i in range(7))
    chronic_28 = sum(daily_load(today - timedelta(days=i)) for i in range(28))
    chronic = (chronic_28 / 28) * 7
    acwr = round(acute / chronic, 2) if chronic > 0 else 1.0

    return {"acute": round(acute, 1), "chronic": round(chronic, 1), "acwr": acwr}


def compute_volume_stats(activities):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    this_week = sum(
        a["distance_km"] for a in activities
        if date.fromisoformat(a["date"]) >= week_start
    )

    weekly_avgs = []
    for w in range(1, 5):
        ws = week_start - timedelta(weeks=w)
        we = ws + timedelta(days=6)
        km = sum(
            a["distance_km"] for a in activities
            if ws <= date.fromisoformat(a["date"]) <= we
        )
        weekly_avgs.append(km)

    avg_4w = statistics.mean(weekly_avgs) if weekly_avgs else 0
    spike_pct = round((this_week - avg_4w) / avg_4w * 100, 1) if avg_4w > 0 else 0.0

    return {
        "this_week_km": round(this_week, 1),
        "avg_4week_km": round(avg_4w, 1),
        "volume_spike_pct": spike_pct,
    }


def compute_hrv_status(daily_health):
    values = [d["hrv_7day_avg"] for d in daily_health if d.get("hrv_7day_avg")]
    if not values:
        return None, None, "unknown"

    baseline = statistics.median(values)
    latest = values[-1]
    ratio = latest / baseline if baseline > 0 else 1.0

    if ratio > 1.05:
        status = "elevated"
    elif ratio > 0.95:
        status = "normal"
    elif ratio > 0.80:
        status = "below_baseline"
    else:
        status = "suppressed"

    return round(latest, 1), round(baseline, 1), status


def compute_injury_risk(acwr, hrv_status, volume_spike_pct, resting_hr, rhr_baseline):
    # ACWR sub-score (40%)
    if acwr < 0.8:
        acwr_s = 15
    elif acwr <= 1.0:
        acwr_s = 5
    elif acwr <= 1.3:
        acwr_s = int(20 + (acwr - 1.0) / 0.3 * 20)
    elif acwr <= 1.5:
        acwr_s = int(40 + (acwr - 1.3) / 0.2 * 35)
    else:
        acwr_s = min(75 + int((acwr - 1.5) * 20), 95)

    # HRV sub-score (30%)
    hrv_s = {"elevated": 5, "normal": 15, "unknown": 20, "below_baseline": 45, "suppressed": 80}.get(hrv_status, 20)

    # Volume spike sub-score (20%)
    if volume_spike_pct < 10:
        vol_s = 5
    elif volume_spike_pct < 20:
        vol_s = 25
    elif volume_spike_pct < 30:
        vol_s = 50
    else:
        vol_s = 75

    # Resting HR sub-score (10%)
    if resting_hr and rhr_baseline:
        ratio = resting_hr / rhr_baseline
        rhr_s = 5 if ratio <= 1.05 else 30 if ratio <= 1.10 else 65
    else:
        rhr_s = 15

    score = int(acwr_s * 0.40 + hrv_s * 0.30 + vol_s * 0.20 + rhr_s * 0.10)
    score = max(0, min(score, 100))

    if score < 25:
        label, message = "low", "You're good to train hard today"
    elif score < 50:
        label, message = "moderate", "Train, but ease off intensity"
    elif score < 70:
        label, message = "high", "Consider an easy or rest day"
    else:
        label, message = "very high", "Rest is the training today"

    return {
        "score": score,
        "label": label,
        "message": message,
        "factors": {
            "training_load": {
                "label": "Training load",
                "status": "elevated" if acwr > 1.3 else "ok" if acwr >= 0.8 else "low",
                "acwr": acwr,
            },
            "recovery": {
                "label": "Recovery (HRV)",
                "status": hrv_status,
            },
            "volume": {
                "label": "Weekly volume",
                "status": "high" if volume_spike_pct > 20 else "moderate" if volume_spike_pct > 10 else "ok",
                "spike_pct": volume_spike_pct,
            },
            "resting_hr": {
                "label": "Resting heart rate",
                "status": "elevated" if (resting_hr and rhr_baseline and resting_hr / rhr_baseline > 1.10)
                          else "moderate" if (resting_hr and rhr_baseline and resting_hr / rhr_baseline > 1.05)
                          else "ok",
            },
        },
    }


def compute_max_safe_distance(activities, acwr, hrv_status, resting_hr, rhr_baseline):
    today = date.today()
    cutoff = today - timedelta(days=28)

    recent = [
        a for a in activities
        if date.fromisoformat(a["date"]) >= cutoff and a.get("distance_km", 0) > 2
    ]

    if not recent:
        return {
            "easy_km": 10.0, "moderate_km": 8.0, "hard_km": 6.0,
            "basis_km": None, "basis_date": None,
        }

    longest = max(recent, key=lambda a: a["distance_km"])
    base_km = longest["distance_km"] * 1.20

    if acwr > 1.5:
        base_km *= 0.65
    elif acwr > 1.3:
        base_km *= 0.80

    if hrv_status == "suppressed":
        base_km *= 0.80
    elif hrv_status == "below_baseline":
        base_km *= 0.90

    if resting_hr and rhr_baseline and resting_hr / rhr_baseline > 1.10:
        base_km *= 0.85

    base_km = max(base_km, 3.0)

    return {
        "easy_km": round(base_km, 1),
        "moderate_km": round(base_km * 0.80, 1),
        "hard_km": round(base_km * 0.60, 1),
        "basis_km": longest["distance_km"],
        "basis_date": longest["date"],
    }


def compute_speed_potential(activities, acwr, hrv_status, body_battery):
    today = date.today()
    cutoff = today - timedelta(days=90)

    eligible = [
        a for a in activities
        if date.fromisoformat(a["date"]) >= cutoff
        and a.get("distance_km", 0) > 4
        and a.get("avg_pace_s", 0) > 0
    ]

    if not eligible:
        return {
            "comfortable_pace": "N/A", "max_pace": "N/A",
            "comfortable_pace_s": 0, "max_pace_s": 0,
            "best_pace": "N/A", "readiness_pct": 100,
        }

    best_pace_s = min(a["avg_pace_s"] for a in eligible)

    readiness = 1.0
    if acwr > 1.3:
        readiness -= 0.03
    if hrv_status == "suppressed":
        readiness -= 0.05
    elif hrv_status == "below_baseline":
        readiness -= 0.03
    if body_battery and body_battery < 40:
        readiness -= 0.02
    readiness = max(readiness, 0.80)

    comfortable_s = round(best_pace_s + 75)
    max_s = round(best_pace_s * (1 + (1 - readiness) * 2))

    return {
        "comfortable_pace": pace_str(comfortable_s),
        "max_pace": pace_str(max_s),
        "comfortable_pace_s": comfortable_s,
        "max_pace_s": max_s,
        "best_pace": pace_str(best_pace_s),
        "readiness_pct": round(readiness * 100),
    }


def compute_performance(activities):
    today = date.today()

    recent = [a for a in activities if date.fromisoformat(a["date"]) >= today - timedelta(days=30)]
    older = [
        a for a in activities
        if today - timedelta(days=60) <= date.fromisoformat(a["date"]) < today - timedelta(days=30)
    ]

    recent_load = sum(a.get("training_load") or 0 for a in recent)
    older_load = sum(a.get("training_load") or 0 for a in older)
    trend = (recent_load - older_load) / older_load if older_load > 0 else 0

    if trend > 0.10:
        label, msg = "improving", "Your training load is building — fitness is trending up."
    elif trend > -0.05:
        label, msg = "maintaining", "Consistent training — you're holding your current level."
    elif trend < -0.15:
        label, msg = "declining", "Training volume has dropped — consider increasing frequency."
    else:
        label, msg = "recovering", "You're in a recovery phase — this is normal and needed."

    weak_spots = []
    last_28 = [a for a in activities if date.fromisoformat(a["date"]) >= today - timedelta(days=28)]

    if last_28:
        hard = [a for a in last_28 if (a.get("avg_hr") or 0) > 155]
        if len(hard) / len(last_28) > 0.40:
            weak_spots.append("Too many hard-effort runs — aim for 80% easy pace")

    cadence_runs = [a for a in last_28 if a.get("cadence", 0) > 0]
    if cadence_runs:
        avg_cad = statistics.mean(a["cadence"] for a in cadence_runs)
        if avg_cad < 170:
            weak_spots.append(f"Cadence averages {round(avg_cad)} spm — target 170–180 spm")

    imbalanced = [a for a in last_28 if abs((a.get("ground_contact_balance") or 50) - 50) > 2]
    if len(imbalanced) >= 3:
        weak_spots.append("Left/right imbalance detected — check hip and ankle symmetry")

    return {
        "fitness_label": label,
        "fitness_message": msg,
        "weak_spots": weak_spots[:3],
        "recent_runs": len(last_28),
    }


def compute_weekly_volumes(activities, weeks=12):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    volumes = []

    for w in range(weeks - 1, -1, -1):
        ws = week_start - timedelta(weeks=w)
        we = ws + timedelta(days=6)
        week_runs = [a for a in activities if ws <= date.fromisoformat(a["date"]) <= we]
        volumes.append({
            "week_start": ws.isoformat(),
            "total_km": round(sum(a["distance_km"] for a in week_runs), 1),
            "runs": len(week_runs),
        })

    return volumes


def compute_all(activities, daily_health):
    today = date.today()

    load = compute_training_load(activities)
    volume = compute_volume_stats(activities)
    hrv_recent, hrv_baseline, hrv_status = compute_hrv_status(daily_health)

    sorted_health = sorted(daily_health, key=lambda d: d["date"])
    latest = sorted_health[-1] if sorted_health else {}

    body_battery = latest.get("body_battery_high")
    resting_hr = latest.get("resting_hr")

    rhr_values = [d["resting_hr"] for d in daily_health if d.get("resting_hr")]
    rhr_baseline = round(statistics.median(rhr_values)) if rhr_values else None

    injury_risk = compute_injury_risk(
        load["acwr"], hrv_status, volume["volume_spike_pct"], resting_hr, rhr_baseline,
    )
    max_distance = compute_max_safe_distance(
        activities, load["acwr"], hrv_status, resting_hr, rhr_baseline,
    )
    speed = compute_speed_potential(
        activities, load["acwr"], hrv_status, body_battery,
    )
    performance = compute_performance(activities)

    return {
        "generated_at": today.isoformat() + "T06:00:00Z",
        "data_through": today.isoformat(),
        "injury_risk": injury_risk,
        "max_safe_distance": max_distance,
        "speed_potential": speed,
        "performance": performance,
        "training_load": {
            "acute": load["acute"],
            "chronic": load["chronic"],
            "acwr": load["acwr"],
            "weekly_km": volume["this_week_km"],
            "avg_4week_km": volume["avg_4week_km"],
            "volume_spike_pct": volume["volume_spike_pct"],
        },
        "recovery": {
            "hrv_last_night": latest.get("hrv_last_night"),
            "hrv_7day_avg": hrv_recent,
            "hrv_baseline": hrv_baseline,
            "hrv_status": hrv_status,
            "body_battery": body_battery,
            "resting_hr": resting_hr,
            "resting_hr_baseline": rhr_baseline,
        },
    }
