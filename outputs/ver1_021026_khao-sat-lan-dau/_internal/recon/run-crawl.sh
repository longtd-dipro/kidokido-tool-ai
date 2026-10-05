#!/usr/bin/env bash
# Runner crawl KidoKido ver1 — KHONG chua credential. Basic Auth lay tu env BASIC_USER / BASIC_PASS.
# Chay tu thu muc goc project:  bash outputs/ver1_021026_khao-sat-lan-dau/_internal/recon/run-crawl.sh <login|crawl>
set -euo pipefail
S=.claude/skills/system-analyst/scripts
I=outputs/ver1_021026_khao-sat-lan-dau/_internal
BASE=https://dhxkf93d45vp4.cloudfront.net
BA="--http-user-env BASIC_USER --http-pass-env BASIC_PASS"
: "${BASIC_USER:?Chua export BASIC_USER}"; : "${BASIC_PASS:?Chua export BASIC_PASS}"

login() {  # $1 = file state, $2 = login url, $3 = nhan role
  echo; echo ">>> Dang nhap role [$3] — go tai khoan trong cua so trinh duyet vua mo (toi da 5 phut)"
  node $S/login-site.js --manual --url "$2" --save ".auth/$1.json" --timeout-min 5 $BA
  chmod 600 ".auth/$1.json"
}

EV=${EV_START:-350}   # REPO-01 da dung EV-0001..0349; lan crawl lai admin bat dau sau EV cuoi cua lan truoc
crawl() {  # $1 site, $2 url, $3 role, $4 state|-, $5 max-urls, $6 max-min, $7 primary|extra
  local ss=""; [ "$4" != "-" ] && ss="--storage-state .auth/$4.json"
  local tmp; tmp=$(mktemp)
  node $S/crawl-site.js --site "$1" --url "$2" --out $I --mode "${MODE:-submit-staging}" \
        --role "$3" $ss --max-urls "$5" --max-minutes "$6" --ev-start $EV $BA \
        --seed-file "$I/recon/seed-$1.txt" ${HEADED:+--headed} | tee "$tmp"
  # stdout cuoi la 1 object JSON nhieu dong -> lay tu dong '{' cuoi cung
  EV=$(python3 -c "import json,sys;t=open(sys.argv[1]).read();print(json.loads(t[t.rindex('\n{')+1:] if '\n{' in t else t[t.index('{'):])['next_ev'])" "$tmp")
  rm -f "$tmp"
  if [ "$7" = extra ]; then
    mkdir -p $I/recon/crawl-roles; rm -rf "$I/recon/crawl-roles/$1__$3"
    mv "$I/recon/crawl/$1" "$I/recon/crawl-roles/$1__$3"
  fi
  echo "$1 $3 next_ev=$EV" >> $I/recon/crawl-chain.log
}

case "${1:-}" in
  login)
    login WEB-01-super_admin   $BASE/admin/signin "Super Admin"
    login WEB-01-admin_tenant  $BASE/admin/signin "Admin Tenant (= Admin Smageri V2)"
    login WEB-01-admin_poss    $BASE/admin/signin "Admin POSS (co cau hoi bi mat lan dau)"
    login WEB-01-smaregi_v1    $BASE/admin/signin "Admin Smageri V1"
    login WEB-02-user          $BASE/signin       "User"
    ;;
  crawl)
    : > $I/recon/crawl-chain.log
    # Role phu truoc, role chinh sau cung (role chinh giu o recon/crawl/<site>/)
    # WEB-01: 40+40+40+80 = 200 URL · 5+5+5+14 = 29 phut
    crawl WEB-01 $BASE/admin test_admin_tenant WEB-01-admin_tenant 40 5 extra
    crawl WEB-01 $BASE/admin test_admin_poss   WEB-01-admin_poss   40 5 extra
    crawl WEB-01 $BASE/admin test_smaregi_v1   WEB-01-smaregi_v1   40 5 extra
    crawl WEB-01 $BASE/admin test_super_admin  WEB-01-super_admin  80 14 primary
    crawl WEB-02 $BASE       anonymous         -                   60 10 extra
    crawl WEB-02 $BASE       test_user         WEB-02-user         140 20 primary
    echo "XONG. Chuoi EV: $I/recon/crawl-chain.log"
    ;;
  crawl-admin)
    # Crawl lai WEB-01 READ-ONLY: app goi signOut() (POST) khi role vao man khong co quyen
    # (withAuthentication.tsx#L42-L44) -> read-only chan POST, phien con song, ghi nhan duoc ma tran quyen
    MODE=read-only
    echo "--- crawl-admin (read-only) tu EV $EV" >> $I/recon/crawl-chain.log
    crawl WEB-01 $BASE/admin test_admin_tenant WEB-01-admin_tenant 40 5 extra
    crawl WEB-01 $BASE/admin test_admin_poss   WEB-01-admin_poss   40 5 extra
    crawl WEB-01 $BASE/admin test_smaregi_v1   WEB-01-smaregi_v1   40 5 extra
    crawl WEB-01 $BASE/admin test_super_admin  WEB-01-super_admin  80 14 primary
    echo "XONG crawl-admin"
    ;;
  *) echo "Dung: $0 login | crawl | crawl-admin"; exit 1;;
esac
