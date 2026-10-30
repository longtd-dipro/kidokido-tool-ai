"""Gan lai nhan noise cho console.json cua crawl ke thua ver12 (crawl 02/10 chay truoc khi crawl-site.js co nhan noise).
Quy tac giong crawl-site.js consoleNoise(): text ERR_FAILED/ERR_ABORTED/Failed to fetch + co request bi chan (blocked.json
kind=request) cung trang trong 3 giay -> noise 'read-only-block'. Ban goc giu o console.orig.json."""
import json, os, re, shutil, sys
from datetime import datetime
base = sys.argv[1]
RX = re.compile(r"net::ERR_FAILED|net::ERR_ABORTED|Failed to fetch|NetworkError|Load failed", re.I)
ts = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
tot = 0
for d in ("crawl", "crawl-roles"):
    for site in sorted(os.listdir(os.path.join(base, d))):
        p = os.path.join(base, d, site)
        cp, bp = os.path.join(p, "console.json"), os.path.join(p, "blocked.json")
        if not (os.path.exists(cp) and os.path.exists(bp)):
            continue
        if not os.path.exists(os.path.join(p, "console.orig.json")):
            shutil.copy(cp, os.path.join(p, "console.orig.json"))
        con, blk = json.load(open(cp)), json.load(open(bp))
        blk = [b for b in blk if b.get("kind") == "request" and b.get("at")]
        n = 0
        for c in con:
            if c.get("noise") or not RX.search(c.get("text", "")):
                continue
            t = ts(c["at"])
            if any(b.get("page") == c.get("url") and 0 <= t - ts(b["at"]) <= 3 for b in blk):
                c["noise"] = "read-only-block"; n += 1
        json.dump(con, open(cp, "w"), ensure_ascii=False, indent=1)
        print(d, site, "console", len(con), "-> noise", n); tot += n
print("total noise", tot)
