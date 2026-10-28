#!/usr/bin/env python3
"""ver3 = ver2 cr.json + cr_item / option (kit moi) + tach dong chi mot phan la 拡張案 (IMP-018 -> +IMP-080, IMP-074 -> +IMP-081)."""
import copy, json, sys
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf8"))
d["meta"]["cr_version"] = "ver3_051026_CR-001-group-booking-r2"
d["meta"]["customer"] = "株式会社TOKIWAGI"
d["meta"]["recommendation"] = d["meta"]["recommendation"].replace(
    "Chia giai đoạn: 最小改修案 = các dòng KHÔNG ghi '拡張案' trong Ghi chú MD; 拡張案 = các dòng có ghi '拡張案' ",
    "Chia giai đoạn: 最小改修案 = các dòng option = FALSE; 拡張案 = các dòng option = TRUE (sheet Estimation) ")
ITEM = {1: [1, 2, 23, 32, 47, 56, 65], 2: [3, 5, 17, 24, 29, 33, 46, 55], 3: [6, 7, 16, 20, 21, 22, 25, 26, 28, 34, 35, 44, 45, 48, 67, 68, 69, 74],
        4: [9, 10, 19, 36, 37, 38, 39, 40, 70, 72, 73], 5: [11, 14, 27, 41, 50, 79], 6: [4, 8, 49, 51, 53, 54, 78, 81],
        7: [12, 13, 15, 30, 43, 57, 58, 59, 60, 61, 63, 64, 75, 76, 77], 8: [18, 42, 52, 62, 66, 80], 9: [31, 71]}
OPT = {5, 16, 26, 35, 40, 51, 52, 73, 80, 81}
imps = {i["id"]: i for i in d["impacts"]}
# tach IMP-018: admin 2FA (最小) + nguoi phu trach (拡張案)
a = imps["IMP-018"]; b = copy.deepcopy(a)
a.update(item="API 二要素認証 (admin)", change="Gửi / kiểm mã xác thực khi admin đăng nhập; ghi nhớ thiết bị đã xác thực",
         qty=1, md_note="Cách 2FA chờ CQ-013", question="CQ-013", conflict_detail="Cách 2FA (email / TOTP) chưa chốt")
b.update(id="IMP-080", item="API xác thực bổ sung người phụ trách đoàn (拡張案)",
         change="Gửi / kiểm mã khi người phụ trách đăng nhập thiết bị mới / thao tác quan trọng", qty=1,
         why_change="CR-001.8: xác thực bổ sung cho người phụ trách đoàn (phương án mở rộng)",
         md_note="拡張案 — phụ thuộc CQ-007", question="CQ-007", conflict_detail="Phạm vi xác thực bổ sung chưa chốt")
# tach IMP-074: 5 man 最小 + 2 man 拡張案
c = imps["IMP-074"]; e = copy.deepcopy(c)
c.update(change="5 màn mới (đăng ký đoàn, trang đặt chỗ đoàn, xác nhận + thanh toán, thông tin đoàn, 領収書) theo Design System WEB-02",
         qty=5, md_note="")
e.update(id="IMP-081", item="Mockup màn mới WEB-02 (拡張案)", change="2 màn mới (người phụ trách, nhập mã xác thực bổ sung) theo Design System WEB-02",
         qty=2, md_note="拡張案 — phụ thuộc CQ-015 / CQ-007", question="CQ-015;CQ-007")
d["impacts"] += [b, e]
num = lambda iid: int(iid.split("-")[1])
for i in d["impacts"]:
    n = num(i["id"])
    i["cr_item"] = next("CR-001.%d" % k for k, v in ITEM.items() if n in v)
    i["option"] = n in OPT
json.dump(d, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(len(d["impacts"]), "impacts ·", sum(i["option"] for i in d["impacts"]), "option")
