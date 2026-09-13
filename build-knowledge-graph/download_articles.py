"""Download the wikitext of every article (main namespace, no redirects) from the
50 wikis listed in top50_show_wikis.md, several wikis in parallel.

Output: articles/<wiki-host>.jsonl.gz, one JSON object per line:
    {"pageid", "title", "revid", "timestamp", "wikitext"}

Resumable: progress is saved in articles/<wiki-host>.state.json after every batch,
so re-running the script continues where it stopped. Finished wikis are skipped.

Usage:
    python3 download_articles.py                   # all 50 wikis, 6 at a time
    python3 download_articles.py --workers 4
    python3 download_articles.py --only tardis.fandom.com --max-batches 2   # quick test
"""
import argparse
import gzip
import json
import os
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from fetch_wiki_stats import WIKIS

HERE = os.path.dirname(os.path.abspath(__file__))
USER_AGENT = "hackathon-wiki-article-downloader/1.0 (research; polite 1 req/s per wiki)"
DELAY = 1.0  # seconds between requests to the same wiki
MAX_RETRIES = 8

print_lock = threading.Lock()


def log(msg):
    line = time.strftime("%H:%M:%S ") + msg
    with print_lock:
        print(line, flush=True)
        with open(os.path.join(HERE, "logs", "download.log"), "a") as f:
            f.write(line + "\n")


def top50_wikis():
    """(host, api_url, expected_articles) for the 50 wikis in the ranked table."""
    text = open(os.path.join(HERE, "top50_show_wikis.md")).read().split("## Very")[0]
    urls = re.findall(r"\| (https://\S+)\s+\|", text)
    api_for = {base: api or base.rstrip("/") + "/api.php" for _, base, api in WIKIS}
    counts = {}
    for row in re.findall(r"\| (https://\S+)\s+\|\s+([\d,]+)", text):
        counts[row[0]] = int(row[1].replace(",", ""))
    return [(urllib.parse.urlparse(u).netloc, api_for[u], counts.get(u, 0)) for u in urls]


def get_json(api, params):
    url = api + "?" + urllib.parse.urlencode(params)
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.load(r)
            if "error" in data:
                raise RuntimeError(data["error"])
            return data
        except urllib.error.HTTPError as e:
            wait = int(e.headers.get("Retry-After", 0) or 0) or min(300, 5 * 2 ** attempt)
            if e.code not in (429, 500, 502, 503, 504):
                raise
        except (urllib.error.URLError, TimeoutError, ConnectionError, json.JSONDecodeError) as e:
            wait = min(300, 5 * 2 ** attempt)
        log(f"  retry {attempt + 1}/{MAX_RETRIES} in {wait}s: {url[:90]}")
        time.sleep(wait)
    raise RuntimeError(f"gave up after {MAX_RETRIES} retries: {url}")


def download_wiki(host, api, expected, max_batches=None):
    out_path = os.path.join(HERE, "articles", f"{host}.jsonl.gz")
    state_path = os.path.join(HERE, "articles", f"{host}.state.json")
    state = {"continue": {}, "done": False, "articles": 0}
    if os.path.exists(state_path):
        state = json.load(open(state_path))
    if state["done"]:
        log(f"{host}: already complete ({state['articles']} articles), skipping")
        return host, state["articles"]

    params = {
        "action": "query", "format": "json", "formatversion": "2",
        "generator": "allpages", "gapnamespace": "0",
        "gapfilterredir": "nonredirects", "gaplimit": "50",
        "prop": "revisions", "rvprop": "ids|timestamp|content", "rvslots": "main",
    }
    log(f"{host}: starting at {state['articles']} / ~{expected} articles")
    batches = 0
    while True:
        data = get_json(api, {**params, **state["continue"]})
        lines = []
        for p in data.get("query", {}).get("pages", []):
            revs = p.get("revisions")
            if not revs:  # content deferred to a later continuation of this batch
                continue
            rev = revs[0]
            # MediaWiki < 1.32 (e.g. Wikisimpsons) has no "slots"; content sits on the revision
            content = rev.get("slots", {}).get("main", rev)
            lines.append(json.dumps({
                "pageid": p["pageid"], "title": p["title"],
                "revid": rev.get("revid"), "timestamp": rev.get("timestamp"),
                "wikitext": content.get("content", content.get("*", "")),
            }, ensure_ascii=False))
        if lines:
            with gzip.open(out_path, "at", encoding="utf-8") as f:
                f.write("\n".join(lines) + "\n")
        state["articles"] += len(lines)
        state["continue"] = data.get("continue", {})
        state["done"] = "continue" not in data
        with open(state_path + ".tmp", "w") as f:
            json.dump(state, f)
        os.replace(state_path + ".tmp", state_path)

        batches += 1
        if batches % 50 == 0 or state["done"]:
            pct = 100 * state["articles"] / expected if expected else 0
            log(f"{host}: {state['articles']} articles ({pct:.0f}%)")
        if state["done"]:
            log(f"{host}: DONE, {state['articles']} articles")
            return host, state["articles"]
        if max_batches and batches >= max_batches:
            log(f"{host}: stopped after {batches} batches (--max-batches)")
            return host, state["articles"]
        time.sleep(DELAY)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=6, help="wikis downloaded at the same time")
    ap.add_argument("--only", nargs="*", help="only these hosts, e.g. tardis.fandom.com")
    ap.add_argument("--max-batches", type=int, help="stop each wiki after N requests (testing)")
    args = ap.parse_args()

    os.makedirs(os.path.join(HERE, "articles"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "logs"), exist_ok=True)
    wikis = top50_wikis()
    if args.only:
        known = {w[0] for w in wikis}
        # hosts outside the top-50 table: assume a standard Fandom/MediaWiki api.php
        extra = [(h, f"https://{h}/api.php", 0) for h in args.only if h not in known]
        wikis = [w for w in wikis if w[0] in args.only] + extra
    # biggest first, so the long ones aren't left running alone at the end
    wikis.sort(key=lambda w: -w[2])
    log(f"downloading {len(wikis)} wikis with {args.workers} workers")

    def run(w):
        try:
            return download_wiki(*w, max_batches=args.max_batches)
        except Exception as e:
            log(f"{w[0]}: FAILED: {e} (re-run the script to resume)")
            return w[0], None

    start = time.time()
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        results = list(ex.map(run, wikis))
    failed = [h for h, n in results if n is None]
    total = sum(n for _, n in results if n)
    log(f"finished in {(time.time() - start) / 60:.1f} min: {total} articles, "
        f"{len(failed)} failed {failed if failed else ''}")


if __name__ == "__main__":
    main()
