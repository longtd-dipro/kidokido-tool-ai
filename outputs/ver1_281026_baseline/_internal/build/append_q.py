"""Dan bd/questions-<WEB>.csv vao 06_OpenQuestions (bo dong da co cung Q ID)."""
import csv, sys, openpyxl
inv, files = sys.argv[1], sys.argv[2:]
wb = openpyxl.load_workbook(inv)
ws = wb["06_OpenQuestions"]
have = {r[0] for r in ws.iter_rows(min_row=2, values_only=True) if r[0]}
n = 0
for f in files:
    for r in list(csv.reader(open(f, encoding="utf8")))[1:]:
        if r[0] not in have:
            ws.append(r); have.add(r[0]); n += 1
wb.save(inv); print("added", n, "total", len(have))
