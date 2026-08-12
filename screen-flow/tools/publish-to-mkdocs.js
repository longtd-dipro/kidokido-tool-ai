// Copy per-role screen-flow output into docs/screens/roles/ for MkDocs.
// - Each role: docs/screens/roles/<role>.md + docs/screens/roles/<role>/screenshots/…
// - Rewrites image paths inside the .md so MkDocs finds them.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCREEN_FLOW = path.join(ROOT, 'screen-flow');
const DOCS_ROOT = path.join(ROOT, 'docs', 'screens', 'roles');

const ADMIN_ROLES = fs.readdirSync(path.join(SCREEN_FLOW, 'admin'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const jobs = [
  ...ADMIN_ROLES.map((r) => ({ src: path.join(SCREEN_FLOW, 'admin', r), out: r, kind: 'admin' })),
  { src: path.join(SCREEN_FLOW, 'user'), out: 'user', kind: 'user' },
];

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const sp = path.join(src, f);
    const dp = path.join(dst, f);
    const st = fs.statSync(sp);
    if (st.isDirectory()) copyDir(sp, dp);
    else fs.copyFileSync(sp, dp);
  }
}

fs.mkdirSync(DOCS_ROOT, { recursive: true });

for (const job of jobs) {
  const flowMd = path.join(job.src, 'flow.md');
  if (!fs.existsSync(flowMd)) {
    console.log(`  skip ${job.out}: no flow.md`);
    continue;
  }
  const roleDir = path.join(DOCS_ROOT, job.out);
  const shotsSrc = path.join(job.src, 'screenshots');
  const shotsDst = path.join(roleDir, 'screenshots');
  fs.rmSync(shotsDst, { recursive: true, force: true });
  copyDir(shotsSrc, shotsDst);

  // Copy + rewrite md — image paths need to prefix with `<role>/` because
  // the md sits at docs/screens/roles/<role>.md while shots are at
  // docs/screens/roles/<role>/screenshots/…
  let md = fs.readFileSync(flowMd, 'utf8');
  md = md.replace(/]\(screenshots\//g, `](${job.out}/screenshots/`);
  md = `> ← [Về Index Screen Flow](../index.md)\n\n` + md;
  fs.writeFileSync(path.join(DOCS_ROOT, `${job.out}.md`), md);
  console.log(`  wrote docs/screens/roles/${job.out}.md + ${fs.readdirSync(shotsDst).length} screenshots`);
}

// Top-level index
const indexLines = [
  '# Màn hình thực tế — Fresh Crawl (theo role)',
  '',
  '> Được sinh tự động bằng Playwright (`screen-flow/tools/crawl-admin.js` + `crawl-user.js`).',
  '> Mỗi role admin có sidebar/menu khác nhau nên số screens khác nhau.',
  '',
  '## Admin',
  '',
];

for (const r of ADMIN_ROLES) {
  const flowJson = path.join(SCREEN_FLOW, 'admin', r, 'flow.json');
  if (!fs.existsSync(flowJson)) continue;
  const data = JSON.parse(fs.readFileSync(flowJson, 'utf8'));
  indexLines.push(`- **[${r}](roles/${r}.md)** — \`${data.email}\` — ${data.screens.length} screens`);
}

indexLines.push('', '## User site', '');
const userJson = path.join(SCREEN_FLOW, 'user', 'flow.json');
if (fs.existsSync(userJson)) {
  const raw = JSON.parse(fs.readFileSync(userJson, 'utf8'));
  const count = Array.isArray(raw) ? raw.length : (raw.screens?.length ?? 0);
  indexLines.push(`- **[User](roles/user.md)** — nguyetntm+10@dipro.vn — ${count} screens`);
}

indexLines.push('', '## SMAREGI_V2 coverage', '');
indexLines.push(
  '- `barcode-scanner` + `scan-management` chỉ hiển thị khi tenant bật smaregi (`src/contexts/SmaregiEnabledContext.tsx:44-52`).',
  '- **`smaregi-v2`** (nguyetntm+300) có đầy đủ: kiosk fullscreen, kiosk tabs, camera scan, logout confirm, scan-management detail/edit.',
  '- **`poss`** không có smaregi → 2 route trả `/403` (xác nhận role gate đúng).',
);

fs.writeFileSync(path.join(ROOT, 'docs', 'screens', 'index.md'), indexLines.join('\n') + '\n');
console.log(`  wrote docs/screens/index.md`);

console.log('\nDone.');
