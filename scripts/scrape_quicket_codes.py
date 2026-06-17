import requests
import csv
import time
from pathlib import Path

API_KEY = "a0748ec398b6539da089dead298ffe16"
BASE_URL = "https://api.quicket.co.za/api/events"
PAGE_SIZE = 100
MAX_PAGES = 100
SLEEP = 0.3

categories = {}        # id -> name
localities = {}        # (province, city) -> count

print("Fetching Quicket events...")

for page in range(1, MAX_PAGES + 1):
    resp = requests.get(BASE_URL, params={
        "api_key": API_KEY,
        "pageSize": PAGE_SIZE,
        "page": page,
    }, timeout=15)

    if resp.status_code != 200:
        print(f"  Page {page}: HTTP {resp.status_code} — stopping")
        break

    data = resp.json()
    results = data.get("results", [])

    if not results:
        print(f"  Page {page}: empty — done")
        break

    for event in results:
        for cat in event.get("categories") or []:
            categories[cat["id"]] = cat["name"]

        loc = event.get("locality") or {}
        province = (loc.get("levelTwo") or "").strip()
        city     = (loc.get("levelThree") or "").strip()
        key = (province, city)
        localities[key] = localities.get(key, 0) + 1

    total_cats = len(categories)
    total_locs = len(localities)
    print(f"  Page {page:3d}: {len(results)} events | {total_cats} categories | {total_locs} localities")

    if len(results) < PAGE_SIZE:
        print("  Last page reached")
        break

    time.sleep(SLEEP)

out_dir = Path(__file__).parent

# --- quicket_categories.csv ---
cat_path = out_dir / "quicket_categories.csv"
with open(cat_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["id", "name"])
    for id_, name in sorted(categories.items()):
        w.writerow([id_, name])

# --- quicket_localities.csv ---
loc_path = out_dir / "quicket_localities.csv"
with open(loc_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["province", "city", "event_count"])
    for (province, city), count in sorted(localities.items()):
        w.writerow([province, city, count])

print(f"\nDone.")
print(f"  {len(categories)} categories  → {cat_path}")
print(f"  {len(localities)} localities  → {loc_path}")
