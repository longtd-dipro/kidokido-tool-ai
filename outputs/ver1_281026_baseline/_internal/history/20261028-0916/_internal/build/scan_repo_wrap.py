"""Runtime workaround for 2 limits of kit scan-repo.py (kit file NOT modified):
1. resolve_js_import ignores tsconfig baseUrl bare imports ("services/x" -> src/services/x) -> 0 FE->API edges.
2. url_from_arg drops leading ${APIs.X} in template literals -> "/:id" instead of "/api/admin/x/:id".
Usage: python3 scan_repo_wrap.py <kit scan-repo.py> <normal scan-repo args...>
"""
import importlib.util, os, re, sys

kit = sys.argv.pop(1)
spec = importlib.util.spec_from_file_location("scan_repo_kit", kit)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

_orig_resolve = m.resolve_js_import


def resolve_js_import(repo, src, spec):
    r = _orig_resolve(repo, src, spec)
    if r or spec.startswith((".", "@/", "~/")):
        return r
    for base in ("src/" + spec, spec):          # tsconfig "baseUrl": "./src"
        for suf in ("", ".ts", ".js", ".tsx", ".jsx", "/index.ts", "/index.js", "/index.tsx", "/index.jsx"):
            if base + suf in repo.files:
                return base + suf
    return None


m.resolve_js_import = resolve_js_import
_cur = {}
_orig_url = m.url_from_arg


def url_from_arg(repo, a):
    a2 = (a or "").strip()
    t = re.match(r"^`\$\{([^}]*)\}(/[^`]*)?`", a2)
    if t:
        key = t.group(1).strip().split(".")[-1]
        if key in _cur:                           # const of the SAME file wins (names collide across files)
            a2 = "`" + _cur[key] + (t.group(2) or "") + "`" + a2[t.end():]
    else:
        k = a2.split(".")[-1] if re.match(r"^[A-Za-z_$][\w$.]*$", a2) else None
        if k in _cur:
            a2 = '"%s"' % _cur[k]
    return _orig_url(repo, a2)


m.url_from_arg = url_from_arg
_orig_scan = m.scan_fe_calls


def scan_fe_calls(repo, src):
    _cur.clear()
    if src.ext in m.JS_EXT:
        for rx in (m.CONST_RX, m.OBJ_URL_RX):
            for x in rx.finditer(src.text):
                _cur.setdefault(x.group(1), x.group(3))
    return _orig_scan(repo, src)


m.scan_fe_calls = scan_fe_calls

# 3. Honor S1 classification in preflight-memory: files the user classified "[A] Báo nhầm" (name only matched
#    password/token/credential) are readable. Only reason "name-keyword" is lifted; env/key/dump/config stay blocked.
import json
mem = json.load(open(os.environ["PREFLIGHT_MEMORY"]))
allow = {f.split("/", 1)[1] for s in mem.get("sensitive", []) if s["classification"].startswith("[A] Báo nhầm")
         for f in s["files"]}
_orig_sens = m.sensitive_reason


def sensitive_reason(rel):
    why = _orig_sens(rel)
    return None if why == "name-keyword" and rel.replace(os.sep, "/") in allow else why


m.sensitive_reason = sensitive_reason
sys.argv[0] = kit
m.main()
