#!/usr/bin/env python3
"""Tukar data/kamus.xls -> src/data/kamus.json

Guna:  pip install xlrd && python3 scripts/convert.py

Lajur B = istilah, lajur C = maksud. Istilah berulang digabung jadi satu entri. Format italic/bold dalam sel dikekalkan
sebagai "runs": [{"t": teks, "i": 1, "b": 1}].
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "kamus.xls"
OUT = ROOT / "src" / "data" / "kamus.json"
TERM_COL, DEF_COL = 1, 2


def runs_for(wb, sh, r, c):
    """Pecahkan teks sel kepada segmen mengikut font (italic/bold)."""
    text = str(sh.cell_value(r, c))
    base = wb.font_list[wb.xf_list[sh.cell_xf_index(r, c)].font_index]
    marks = [(0, base)] + [
        (off, wb.font_list[fi]) for off, fi in sh.rich_text_runlist_map.get((r, c), [])
    ]
    out = []
    for n, (off, font) in enumerate(marks):
        end = marks[n + 1][0] if n + 1 < len(marks) else len(text)
        seg = text[off:end]
        if seg:
            out.append([seg, bool(font.italic), bool(font.bold or font.weight >= 700)])
    return out


def tidy(runs, base_bold):
    """Kemas ruang kosong, buang bold lalai lajur, gabung segmen sama gaya."""
    merged = []
    for t, i, b in runs:
        b = b and not base_bold
        if merged and merged[-1][1] == i and merged[-1][2] == b:
            merged[-1][0] += t
        else:
            merged.append([t, i, b])
    for m in merged:
        m[0] = re.sub(r"\s+", " ", m[0])
    # jangan gayakan segmen yang hanya ruang/tanda baca
    for m in merged:
        if not re.search(r"\w", m[0]):
            m[1] = m[2] = False
    final = []
    for t, i, b in merged:
        if final and final[-1][1] == i and final[-1][2] == b:
            final[-1][0] += t
        else:
            final.append([t, i, b])
    if final:
        final[0][0] = final[0][0].lstrip()
        final[-1][0] = final[-1][0].rstrip()
    res = []
    for t, i, b in final:
        if not t:
            continue
        d = {"t": t}
        if i:
            d["i"] = 1
        if b:
            d["b"] = 1
        res.append(d)
    return res


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    wb = xlrd.open_workbook(str(SRC), formatting_info=True)
    sh = wb.sheet_by_index(0)
    entries, warn, by_term = [], [], {}
    for r in range(sh.nrows):
        term = re.sub(r"\s+", " ", str(sh.cell_value(r, TERM_COL))).strip()
        defn = tidy(runs_for(wb, sh, r, DEF_COL), False)
        plain = "".join(x["t"] for x in defn)
        if not term and not plain:
            continue
        if term and not plain:
            if entries or "DIC" not in term.upper():
                warn.append(f"baris {r+1}: istilah tanpa maksud: {term!r}")
            continue
        if plain and not term:
            warn.append(f"baris {r+1}: maksud tanpa istilah: {plain[:50]!r}")
            continue
        # istilah yang sama digabung menjadi satu entri dengan beberapa maksud
        if term in by_term:
            e = by_term[term]
            if any("".join(x["t"] for x in d) == plain for d in e["defs"]):
                warn.append(f"baris {r+1}: pendua tepat dibuang: {term!r}")
            else:
                e["defs"].append(defn)
                warn.append(f"baris {r+1}: maksud tambahan digabung: {term!r}")
            continue
        e = {"id": slug(term) or f"baris-{r+1}", "term": term, "defs": [defn]}
        by_term[term] = e
        entries.append(e)
    entries.sort(key=lambda e: e["term"].upper())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(entries)} istilah -> {OUT.relative_to(ROOT)}")
    for w in warn:
        print("AMARAN:", w)


if __name__ == "__main__":
    main()
