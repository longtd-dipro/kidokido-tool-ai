// Aggregate all per-role flow.json into a top-level index.md
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ADMIN_ROOT = path.join(ROOT, 'admin');
const USER_ROOT = path.join(ROOT, 'user');

const roles = fs
  .readdirSync(ADMIN_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const lines = [
  '# Screen Flow — Index',
  '',
  '> Toàn bộ ảnh chụp được sinh tự động bằng Playwright (`tools/crawl-admin.js` + `tools/crawl-user.js`).',
  '> Mỗi role admin có folder + `flow.md` riêng, click vào để xem chi tiết + ảnh.',
  '',
  '## Admin (theo role)',
  '',
  '| Role | Account | Sections | Screens | Detail |',
  '|---|---|---:|---:|---|',
];

for (const role of roles) {
  const flowPath = path.join(ADMIN_ROOT, role, 'flow.json');
  if (!fs.existsSync(flowPath)) continue;
  const data = JSON.parse(fs.readFileSync(flowPath, 'utf8'));
  lines.push(
    `| \`${role}\` | \`${data.email}\` | ${data.sections.length} | ${data.screens.length} | [flow.md](admin/${role}/flow.md) |`
  );
}

lines.push('', '## User site', '');
const userFlow = path.join(USER_ROOT, 'flow.json');
if (fs.existsSync(userFlow)) {
  const data = JSON.parse(fs.readFileSync(userFlow, 'utf8'));
  const count = Array.isArray(data) ? data.length : (data.screens?.length ?? 0);
  lines.push(`- Screens: **${count}** — [flow.md](user/flow.md)`);
}

lines.push('', '## SMAREGI_V2 coverage', '');
lines.push(
  '- `barcode-scanner` + `scan-management` chỉ hiển thị khi tenant bật smaregi (xem `src/contexts/SmaregiEnabledContext.tsx:44-52`).',
  '- Kết quả thực tế:',
  '  - `super-admin` (supper@example.com) → thấy được cả 2 (sidebar Super Admin có `MENU_LIST_SUPER_ADMIN`, extra paths bypass gate).',
  '  - `smaregi-v2` (nguyetntm+300) → thấy được cả 2 + `scan-management` có luồng detail/edit.',
  '  - `smaregi-v1` (nguyetntm+200) → tenant cũng bật smaregi → thấy được cả 2.',
  '  - `poss` (nguyetntm+3) → tenant KHÔNG bật smaregi → server trả `/403` cho cả 2 (xác nhận role gate hoạt động).',
);

fs.writeFileSync(path.join(ROOT, 'index.md'), lines.join('\n') + '\n');
console.log('Wrote', path.join(ROOT, 'index.md'));
