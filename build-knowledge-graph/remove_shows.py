"""Remove shows from the knowledge-graph sources.

Lost (Lostpedia: CC BY-NC-ND) and Star Trek (Memory Alpha: CC BY-NC) were removed on 2026-09-13
because their wiki licences are incompatible with the graph's CC BY-SA data licence.

For every show in SHOWS this:
- moves graph/arcs/<show>*.json to graph/excluded_shows/ (kept locally; not built, not published)
- removes the show's arcs from the pattern table (ASSIGN in graph/build_patterns.py)
- removes every cross-show link that touches the show (graph/build_resonances*.py)
- removes the show from graph/shows.json and its characters from characters/selected.csv
Entries are found by parsing the Python, so multi-line entries are removed whole. Safe to re-run.
Afterwards rebuild the graph (COMMANDS.txt, section 15).

Usage: python3 remove_shows.py
"""
import ast
import csv
import glob
import json
import os
import re
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(HERE, "graph")
SHOWS = {"lost": "Lost", "star_trek": "Star Trek"}  # graph show id -> show name in characters/selected.csv
ROUND1_LETTER = {"lost": "L", "star_trek": "S"}      # positional codes in graph/build_resonances.py
HEADER = re.compile(r"^\s*#.*\b(" + "|".join(re.escape(n) for n in SHOWS.values()) + r")\b")


def show_of(arc):
    return arc.split(":", 1)[-1].split("/")[0]


def entries(path):
    """(first_line, last_line, drop?) for every data entry in one of the graph/build_*.py files."""
    tree = ast.parse(open(path, encoding="utf-8").read())
    out = []
    for node in tree.body:
        if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
            name, v = node.targets[0].id, node.value
            if name == "ASSIGN" and isinstance(v, ast.Dict):
                out += [(k.lineno, val.end_lineno, show_of(k.value) in SHOWS) for k, val in zip(v.keys, v.values)]
            elif name == "PAIRS" and isinstance(v, ast.List):
                letters = set(ROUND1_LETTER.values())
                for t in v.elts:
                    codes = [e.value for e in t.elts[:2]]
                    out.append((t.lineno, t.end_lineno, any(re.match(r"[A-Z]", c).group() in letters for c in codes)))
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call) and getattr(node.value.func, "id", "") == "P":
            ends = [a.value for a in node.value.args[:2]]
            out.append((node.lineno, node.end_lineno, any(show_of(e) in SHOWS for e in ends)))
    return out


def clean_script(path):
    lines = open(path, encoding="utf-8").read().split("\n")
    es = entries(path)
    drop = {i for a, b, d in es if d for i in range(a - 1, b)}
    keep = {i for a, b, d in es if not d for i in range(a - 1, b)}
    if drop & keep:
        raise SystemExit(f"{path}: a removed entry shares a line with a kept one, lines {sorted(drop & keep)[:5]}")
    headers = [i for i, l in enumerate(lines) if HEADER.match(l)]
    drop |= set(headers)
    if not drop:
        return 0, []
    new = "\n".join(l for i, l in enumerate(lines) if i not in drop)
    compile(new, path, "exec")
    open(path, "w", encoding="utf-8").write(new)
    return sum(d for _, _, d in es), [lines[i].strip() for i in headers]


def main():
    os.makedirs(os.path.join(G, "excluded_shows"), exist_ok=True)
    for show in SHOWS:
        for p in glob.glob(os.path.join(G, "arcs", f"{show}.json")) + glob.glob(os.path.join(G, "arcs", f"{show}_[0-9]*.json")):
            shutil.move(p, os.path.join(G, "excluded_shows", os.path.basename(p)))
            print("moved", os.path.relpath(p, HERE), "-> graph/excluded_shows/")

    for name in ["build_patterns.py", "build_resonances.py", "build_resonances_extra.py", "build_resonances_extra_round3.py"]:
        n, headers = clean_script(os.path.join(G, name))
        print(f"graph/{name}: removed {n} entries" + (f", section comments {headers}" if headers else ""))

    p = os.path.join(G, "shows.json")
    text = open(p, encoding="utf-8").read()
    data = json.loads(text)
    indent = next((n for n in (1, 2, 4) if json.dumps(data, indent=n, ensure_ascii=False).strip() == text.strip()), 2)
    kept = [s for s in data if s["id"].split(":", 1)[1] not in SHOWS]
    if len(kept) != len(data):
        open(p, "w", encoding="utf-8").write(json.dumps(kept, indent=indent, ensure_ascii=False) + "\n")
    print(f"graph/shows.json: {len(data)} -> {len(kept)} shows")

    p = os.path.join(HERE, "characters", "selected.csv")
    raw = open(p, newline="", encoding="utf-8").read()
    rows = list(csv.reader(raw.splitlines()))
    kept = [rows[0]] + [r for r in rows[1:] if r and r[0] not in SHOWS.values()]
    if len(kept) != len(rows):
        with open(p, "w", newline="", encoding="utf-8") as f:
            csv.writer(f, lineterminator="\r\n" if "\r\n" in raw else "\n").writerows(kept)
    print(f"characters/selected.csv: {len(rows) - 1} -> {len(kept) - 1} characters")


if __name__ == "__main__":
    main()
