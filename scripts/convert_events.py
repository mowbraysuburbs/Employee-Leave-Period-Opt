import csv, json
from pathlib import Path

src = Path(__file__).parent / "quicket_events_sample.csv"
dst = Path(__file__).parent.parent / "web/src/data/quicketEvents.json"
dst.parent.mkdir(parents=True, exist_ok=True)

rows = []
with open(src, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if not row["startDate"]:
            continue
        rows.append({
            "id":        row["id"],
            "name":      row["name"],
            "startDate": row["startDate"],
            "endDate":   row["endDate"],
            "city":      row["city"],
            "region":    row["region"],
            "venue":     row["venue"],
            "url":       row["url"],
            "imageUrl":  row["imageUrl"],
            "categories": row["categories"],
        })

rows.sort(key=lambda r: r["startDate"])

dst.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")
print(f"Written {len(rows)} events → {dst}")
