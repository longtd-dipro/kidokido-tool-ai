#!/usr/bin/env python3
"""Hướng dẫn sử dụng kit System to Doc — bản gọn, chỉ Luồng 2 (/change-request).

Chạy:  python3 build-guide-cr-docx.py --kit <kit root>
Output: <kit>/docs/Hướng dẫn sử dụng System to Doc.docx (ghi đè)
"""
import argparse, os, sys

try:
    from docx import Document
    from docx.shared import Pt, RGBColor, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
except ImportError:
    sys.stderr.write("thieu python-docx: pip install python-docx\n")
    sys.exit(2)

REPO_URL = "https://github.com/longtd-dipro/kidokido-tool-ai"
FONT = "Arial"


def _font(run, size=11, bold=False, color=None):
    run.font.name = FONT
    run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color.lstrip("#"))


def h(doc, text, level=1):
    p = doc.add_heading(level=level)
    r = p.add_run(text)
    _font(r, size={1: 18, 2: 14, 3: 12}[level], bold=True, color="1F4E79")


def para(doc, text, bold=False, code=False):
    p = doc.add_paragraph()
    r = p.add_run(text)
    if code:
        r.font.name = "Courier New"
        r._element.rPr.rFonts.set(qn("w:eastAsia"), "Courier New")
        r.font.size = Pt(10)
    else:
        _font(r, bold=bold)
    return p


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    _font(p.add_run(text))


def code_block(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.5)
    r = p.add_run(text)
    r.font.name = "Courier New"
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "Courier New")
    r.font.size = Pt(10)


def build(out_path):
    doc = Document()
    for s in doc.sections:
        s.left_margin = Cm(2); s.right_margin = Cm(2)
        s.top_margin = Cm(2); s.bottom_margin = Cm(2)

    h(doc, "Hướng dẫn sử dụng kit System to Doc — Luồng 2 (Change Request)", 1)
    para(doc, "Kit này giúp phân tích ảnh hưởng của một yêu cầu thay đổi (Change Request) lên hệ thống đã khảo sát. "
              "Hướng dẫn chỉ tập trung vào Luồng 2 — lệnh /change-request. "
              "Giả định bạn đã có sẵn baseline (kết quả Luồng 1) trong thư mục outputs/.")

    h(doc, "1. Tải kit", 2)
    para(doc, "Clone từ GitHub:")
    code_block(doc, f"git clone {REPO_URL}\ncd kidokido-tool-ai")
    para(doc, "Hoặc tải .zip từ trang GitHub (nút Code → Download ZIP) rồi giải nén.")
    para(doc, "Nguồn:", bold=True)
    bullet(doc, REPO_URL)

    h(doc, "2. Cài đặt", 2)
    para(doc, "Yêu cầu máy:", bold=True)
    bullet(doc, "Python 3.9 trở lên")
    bullet(doc, "Node.js 18 trở lên (cho hook PII và render Figma)")
    bullet(doc, "Claude Code CLI (https://claude.com/claude-code)")

    para(doc, "Cài thư viện (kit tự cài khi chạy, nhưng có thể chạy trước):", bold=True)
    code_block(doc, "python3 .claude/skills/system-analyst/scripts/ensure-env.py --flow 2")
    para(doc, "Lệnh trên kiểm và tự cài openpyxl, python-docx, Playwright, Chromium nếu thiếu. "
              "Không cần làm gì thủ công. Nếu cần vẽ Figma, thêm cờ --figma để kit kết nối Figma MCP; "
              "lần đầu sẽ nhắc bạn mở /mcp trong Claude Code rồi bấm Authenticate.")

    h(doc, "3. Chuẩn bị đầu vào", 2)
    para(doc, "Chuẩn bị 2 thứ:")
    bullet(doc, "Baseline: thư mục outputs/ver<N>_… (kết quả của Luồng 1). Nếu chưa có, chạy /analyze-system trước.")
    bullet(doc, "Yêu cầu thay đổi (CR): một trong ba cách dưới đây.")

    para(doc, "Ba cách đưa CR:", bold=True)
    bullet(doc, "Cách A — Bỏ file vào thư mục inputs/cr/<tên-ngắn>/ (hỗ trợ .md, .docx, .xlsx, .pdf, ảnh)")
    bullet(doc, "Cách B — Dán nội dung trực tiếp vào chat")
    bullet(doc, "Cách C — Gửi đường link (Google Drive, Backlog, Slack)")

    h(doc, "4. Chạy lệnh /change-request", 2)
    para(doc, "Trong Claude Code CLI, gõ:")
    code_block(doc, "/change-request inputs/cr/<tên-ngắn>/request.md")
    para(doc, "Hoặc không có file, dán nội dung:")
    code_block(doc, "/change-request\n(sau đó dán nội dung CR)")

    para(doc, "Agent sẽ tự:")
    bullet(doc, "Đọc baseline mới nhất trong outputs/ để biết hệ thống đang có gì")
    bullet(doc, "Tạo thư mục mới outputs/CR-<id>_<DDMMYY>_<slug>/ (ví dụ CR-005_101126_gmo-cloud-migration/)")
    bullet(doc, "Phân tích ảnh hưởng theo 6 trục: màn hình, API, cơ sở dữ liệu, nghiệp vụ, liên kết bên thứ 3, mockup")
    bullet(doc, "Hỏi bạn các câu cần quyết (thường 2–5 câu): mã CR, phạm vi output, có vẽ Figma không, có xuất 見積書 không")
    bullet(doc, "Sinh output + chạy gate tự động + báo cáo tóm tắt cuối lượt")

    h(doc, "5. Output nhận được", 2)
    para(doc, "Trong thư mục outputs/CR-<id>_<DDMMYY>_<slug>/:", bold=True)

    table = doc.add_table(rows=1, cols=2)
    table.style = "Light Grid Accent 1"
    hdr = table.rows[0].cells
    for c, t in zip(hdr, ["File", "Nội dung"]):
        _font(c.paragraphs[0].add_run(t), bold=True, color="FFFFFF")
        tcPr = c._tc.get_or_add_tcPr()
        shd = OxmlElement("w:shd"); shd.set(qn("w:fill"), "1F4E79"); tcPr.append(shd)
    rows = [
        ("CR-<id>_Impact.xlsx", "Bảng phân tích ảnh hưởng — 7 sheet: Tổng hợp, Báo giá nội bộ, Màn hình, API, Cơ sở dữ liệu, Figma, Hỏi khách"),
        ("CR-<id>_見積書.xlsx", "Báo giá chi tiết tiếng Nhật gửi khách — 詳細見積書 + 前提条件・留意事項"),
        ("README.md", "Danh sách output + trạng thái gate"),
        ("run-log.md", "Nhật ký chạy — baseline đã dùng, câu hỏi còn chờ, rủi ro ưu tiên 1"),
        ("input/", "Bản CR gốc đã che thông tin cá nhân (email, SĐT)"),
        ("_internal/", "Dữ liệu máy đọc (cr.json, estimate.json, cr-figma.json, JS vẽ Figma). Không gửi khách."),
    ]
    for name, desc in rows:
        c = table.add_row().cells
        _font(c[0].paragraphs[0].add_run(name), bold=True)
        _font(c[1].paragraphs[0].add_run(desc))

    h(doc, "6. 7 sheet trong CR-<id>_Impact.xlsx", 2)
    bullet(doc, "Tổng hợp (Summary): công số nội bộ, số đối tượng thay đổi, link tới các sheet chi tiết")
    bullet(doc, "Báo giá nội bộ (Estimation): từng hạng mục × công số × loại thao tác, dùng để nội bộ duyệt trước khi tính lên 見積書")
    bullet(doc, "Màn hình (Screen): các màn có thay đổi hoặc bị ảnh hưởng (NEW / UPD / DEL / IMPACT)")
    bullet(doc, "API: các API có thay đổi hoặc bị ảnh hưởng")
    bullet(doc, "Cơ sở dữ liệu (Database): bảng / cột có thay đổi")
    bullet(doc, "Figma: danh sách file Figma cần cập nhật")
    bullet(doc, "Hỏi khách (Q&A): câu hỏi cần khách trả lời trước khi chốt phạm vi")

    h(doc, "7. 見積書 (CR-<id>_見積書.xlsx)", 2)
    para(doc, "Bản báo giá chi tiết tiếng Nhật, định dạng chuẩn gửi khách Nhật. Hai sheet chính:")
    bullet(doc, "詳細見積書 — bảng chức năng × công số (要件定義, UI/UX, 実装, テスト, 管理) × 人日 × 人月")
    bullet(doc, "前提条件・留意事項 — tiền đề, ảnh hưởng tới hệ thống hiện tại, việc khách cần chuẩn bị, rủi ro")

    para(doc, "Lưu ý:", bold=True)
    bullet(doc, "Đơn giá mặc định ở trạng thái DRAFT. PM / Tech Lead phải duyệt (chuyển sang APPROVED) trong "
                ".claude/config/function-rates.json trước khi gửi khách.")
    bullet(doc, "見積書 chỉ chứa thông tin khách cần thấy. Không copy mã nội bộ (IMP-, CQ-, SC-), không copy đơn giá nội bộ.")

    h(doc, "8. Kết quả Figma (nếu có vẽ)", 2)
    para(doc, "Khi agent sinh xong, bạn sẽ có các file JS trong _internal/figma-js/. "
              "Chạy từng file bằng use_figma trong Claude Code — agent hướng dẫn chính xác câu lệnh cuối lượt. "
              "Sau đó agent tự chạy verify-cr-figma.py để đóng gate.")

    h(doc, "9. Khi nào cần chạy lại?", 2)
    bullet(doc, "Khách đổi yêu cầu → sửa file CR trong inputs/cr/<slug>/ rồi chạy lại /change-request với cùng mã CR; "
                "kit ghi đè vào thư mục cũ, bản cũ được đẩy vào _internal/history/.")
    bullet(doc, "Baseline thay đổi (ver mới) → /change-request tự chọn baseline mới nhất.")
    bullet(doc, "Đơn giá vừa được duyệt → chỉ cần chạy lại lệnh build (agent gợi ý trong run-log).")

    h(doc, "10. Khi gặp lỗi", 2)
    bullet(doc, "Hook PII chặn ghi file: kit đang bảo vệ không cho lọt dữ liệu thật ra output. Che bằng dữ liệu mẫu.")
    bullet(doc, "Gate V-CR / V-EST FAIL: đọc file _internal/gates/ để biết dòng nào sai. Không được tự chấm PASS bằng mắt.")
    bullet(doc, "Thiếu baseline: chạy /analyze-system trước, rồi quay lại /change-request.")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    doc.save(out_path)
    print(f"Ghi: {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kit", required=True)
    args = ap.parse_args()
    out = os.path.join(args.kit, "docs", "Hướng dẫn sử dụng System to Doc.docx")
    build(out)


if __name__ == "__main__":
    main()
