"""Update an item's Status (and Done date) in docs/al-ilm-sprint-plan.xlsx.

Usage: python docs/set_status.py AL-017 "In Progress"
       python docs/set_status.py AL-017 Done            (stamps today's date)
       python docs/set_status.py AL-017 Blocked --note "waiting on decision"
Formulas are preserved (workbook is loaded without data_only).
"""
import argparse
import sys
from datetime import date
from pathlib import Path

from openpyxl import load_workbook

PATH = Path(__file__).with_name("al-ilm-sprint-plan.xlsx")
STATUSES = {"To Do", "In Progress", "Blocked", "Done"}

ap = argparse.ArgumentParser()
ap.add_argument("item_id")
ap.add_argument("status")
ap.add_argument("--note", default=None)
args = ap.parse_args()
if args.status not in STATUSES:
    sys.exit(f"Status must be one of {sorted(STATUSES)}")

wb = load_workbook(PATH)
ws = wb["Backlog"]
for row in range(5, 301):
    if ws.cell(row, 1).value == args.item_id:
        ws.cell(row, 9).value = args.status
        ws.cell(row, 10).value = date.today() if args.status == "Done" else None
        if args.note:
            old = ws.cell(row, 11).value
            ws.cell(row, 11).value = f"{old} | {args.note}" if old else args.note
        wb.save(PATH)
        print(f"{args.item_id}: {ws.cell(row, 5).value} -> {args.status}")
        break
else:
    sys.exit(f"{args.item_id} not found")
