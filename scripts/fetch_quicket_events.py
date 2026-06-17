import requests
import csv
import time
from pathlib import Path

API_KEY  = "a0748ec398b6539da089dead298ffe16"
BASE_URL = "https://api.quicket.co.za/api/events"
DST_CSV  = Path(__file__).parent / "quicket_events_sample.csv"
DST_JSON = Path(__file__).parent.parent / "web/src/data/quicketEvents.json"

import json

events = []
page   = 1

print("Fetching events from Quicket API...")

while True:
    resp = requests.get(BASE_URL, params={
        "api_key":   API_KEY,
        "pageSize":  100,
        "page":      page,
        "startDate": "2026-01-01",
    }, timeout=15)

    if resp.status_code != 200:
        print(f"  Page {page}: HTTP {resp.status_code} — stopping")
        break

    results = resp.json().get("results", [])
    if not results:
        print(f"  Page {page}: empty — done")
        break

    for ev in results:
        loc   = ev.get("locality") or {}
        venue = (ev.get("venue") or {})
        cats  = ", ".join(c["name"] for c in (ev.get("categories") or []))

        tickets    = ev.get("tickets") or []
        prices     = [t["price"] for t in tickets if not t.get("donation") and t.get("price") is not None]
        min_price  = min(prices) if prices else None
        max_price  = max(prices) if prices else None

        events.append({
            "id":          str(ev.get("id", "")),
            "name":        ev.get("name", ""),
            "startDate":   ev.get("startDate", ""),
            "endDate":     ev.get("endDate", ""),
            "city":        (loc.get("levelThree") or "").strip(),
            "region":      (loc.get("levelTwo")   or "").strip(),
            "venue":       (venue.get("name") or "").strip(),
            "url":         ev.get("url") or f"https://www.quicket.co.za/events/{ev.get('id', '')}",
            "imageUrl":    ev.get("imageUrl", ""),
            "categories":  cats,
            "description": ev.get("description") or "",
            "minPrice":    "" if min_price is None else str(min_price),
            "maxPrice":    "" if max_price is None else str(max_price),
        })

    print(f"  Page {page:3d}: +{len(results)} events (total {len(events)})")

    if len(results) < 100:
        print("  Last page reached")
        break

    page += 1
    time.sleep(0.3)

# Filter and sort
events = [e for e in events if e["startDate"]]
events.sort(key=lambda e: e["startDate"])

# Write CSV
FIELDS = ["id","name","startDate","endDate","city","region","venue","url","imageUrl","categories","description","minPrice","maxPrice"]
with open(DST_CSV, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=FIELDS)
    w.writeheader()
    w.writerows(events)
print(f"CSV: {len(events)} events → {DST_CSV}")

# Write JSON (same fields minus description to keep bundle small — description fetched on demand)
json_rows = [{k: e[k] for k in FIELDS} for e in events]
DST_JSON.write_text(json.dumps(json_rows, ensure_ascii=False), encoding="utf-8")
print(f"JSON: {len(json_rows)} events → {DST_JSON}")
print(f"Date range: {events[0]['startDate'][:10]} → {events[-1]['startDate'][:10]}")
