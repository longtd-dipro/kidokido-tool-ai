// Consolidated admin crawl — one pass, per-role output folder.
// Captures: list, tabs, detail (first row), edit-from-detail, create-form, delete-confirm.
// Also includes explicit fallback paths that may be hidden from the sidebar
// depending on the role's smaregi state (barcode-scanner, scan-management).
//
// Usage:
//   node crawl-admin.js \
//     --email=nguyetntm+300@dipro.vn --password=123123Ad \
//     --out=admin/smaregi-v2 --role=smaregi-v2 \
//     --secretQ='本社オフィスのドアの色は？' --secretA=赤色 \
//     [--headless=true|false]

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function arg(name, def) {
  const pre = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(pre));
  return found ? found.slice(pre.length) : def;
}

const BASE = arg('base', 'https://dhxkf93d45vp4.cloudfront.net');
const BASIC_AUTH = { username: arg('basicUser', 'admin'), password: arg('basicPass', '123123') };
const LOGIN_EMAIL = arg('email');
const LOGIN_PASSWORD = arg('password');
const SECRET_QUESTION = arg('secretQ', '本社オフィスのドアの色は？');
const SECRET_ANSWER = arg('secretA', '赤色');
const ROLE = arg('role', 'admin');
const HEADLESS = arg('headless', 'true') !== 'false';
const OUT_DIR = path.resolve(__dirname, '..', arg('out', `admin/${ROLE}`));
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');

// Explicit paths that may not appear in sidebar for some roles but exist as pages.
// The SmaregiEnabledContext filters barcode-scanner + scan-management out of the
// sidebar when smaregi is disabled — but the route itself still renders.
const EXTRA_PATHS = [
  'barcode-scanner',
  'scan-management',
  'disclaimer-management',
  'waiting-time-management',
];

if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
  console.error('Missing --email / --password');
  process.exit(1);
}

fs.mkdirSync(SHOT_DIR, { recursive: true });

const found = [];
let shotCounter = 0;

async function shot(page, section, kind, label) {
  shotCounter += 1;
  const safeSection = section.replace(/[^\w-]+/g, '_');
  const safeLabel = label.replace(/[^\w-]+/g, '_').slice(0, 40);
  const file = `${String(shotCounter).padStart(3, '0')}-${safeSection}-${kind}-${safeLabel}.png`;
  try {
    await page.screenshot({ path: path.join(SHOT_DIR, file), fullPage: true });
    found.push({ section, kind, label, url: page.url(), screenshot: `screenshots/${file}` });
    console.log(`  [shot] ${section}/${kind}/${label} -> ${file}`);
  } catch (e) {
    console.log(`  [shot-FAIL] ${section}/${kind}/${label}: ${e.message.split('\n')[0]}`);
  }
}

async function resetTo(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(1200);
}

(async () => {
  console.log(`\n=== Crawl role=${ROLE} email=${LOGIN_EMAIL} headless=${HEADLESS} out=${OUT_DIR} ===\n`);
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    httpCredentials: BASIC_AUTH,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // ---- Login flow ----
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  if (page.url().includes('/signin')) {
    console.log('Logging in...');
    await page.fill('input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[name="password"]', LOGIN_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await page.waitForTimeout(2500);

    // Handle secret-question step (first login for some admins)
    try {
      await page.getByText('秘密の質問').first().waitFor({ timeout: 4000 });
      console.log('  secret-question modal present, answering...');
      await page.waitForTimeout(800);
      await page.locator('input[role="combobox"]').first().click();
      await page.getByRole('option', { name: SECRET_QUESTION }).click();
      await page.fill('input[name="answer"]', SECRET_ANSWER);
      await page.locator('button:has-text("次へ")').first().click();
      await page.waitForURL(/dashboard|admin/, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500);
    } catch (_) {
      // no secret-question, fine
    }
  }
  console.log('  logged in, url =', page.url());
  await page.waitForTimeout(1500);

  // ---- Discover sidebar sections ----
  const hrefs = await page.locator('a[href^="/admin/"]').evaluateAll((as) =>
    as.map((a) => a.getAttribute('href'))
  );
  const discovered = [...new Set(
    hrefs
      .filter(Boolean)
      .map((h) => h.split('?')[0].replace(/^\/admin\//, '').split('/')[0])
      .filter(Boolean)
      .filter((s) => !/logout|signout|signin|change-email|change-password|forgot-password|reset-password|unlock-account/i.test(s))
  )];

  // Always include dashboard entry (its href may be /admin/dashboard or shown separately)
  if (!discovered.includes('dashboard') && await page.locator('a[href="/admin/dashboard"], a[href="/admin"]').count()) {
    discovered.unshift('dashboard');
  }

  const SECTIONS = [...new Set([...discovered, ...EXTRA_PATHS])];
  console.log('Sections to visit:', SECTIONS);

  // ---- Loop through sections ----
  for (const section of SECTIONS) {
    const url = `${BASE}/admin/${section}`;
    console.log(`\n== ${section} ==`);
    try {
      await resetTo(page, url);
    } catch (e) {
      console.log('  nav failed:', e.message.split('\n')[0]);
      continue;
    }

    // If redirected off /admin, skip (role-forbidden)
    if (!page.url().includes(`/admin/${section}`) && !page.url().endsWith(`/admin/${section}`)) {
      // For dashboard the URL may just be /admin — still capture
      if (section !== 'dashboard') {
        console.log('  redirected -> possibly forbidden, url =', page.url());
      }
    }

    await shot(page, section, 'list', 'main');

    // Tabs (role="tab")
    const tabCount = await page.locator('[role="tab"]').count();
    if (tabCount > 1 && tabCount < 12) {
      for (let i = 0; i < tabCount; i++) {
        try {
          const tab = page.locator('[role="tab"]').nth(i);
          const label = (await tab.textContent())?.trim() || `tab${i}`;
          await tab.click({ timeout: 4000 });
          await page.waitForTimeout(900);
          await shot(page, section, 'tab', label);
        } catch (e) {
          console.log('  tab click failed:', e.message.split('\n')[0]);
        }
      }
      await resetTo(page, url).catch(() => {});
    }

    // Detail (view icon) — first row only
    const detailBtn = page.locator(
      'button:has(img[alt="detail"]), button:has(img[alt="details"]), button[aria-label="details"], button[aria-label="view"]'
    ).first();
    if (await detailBtn.count() > 0) {
      try {
        await detailBtn.click({ timeout: 4000 });
        await page.waitForTimeout(1200);
        await shot(page, section, 'detail', 'first-row');

        // Edit-from-detail
        const editFromDetail = page.getByRole('button', { name: '編集する' }).first();
        if (await editFromDetail.count() > 0) {
          try {
            await editFromDetail.click({ timeout: 4000 });
            await page.waitForTimeout(1200);
            await shot(page, section, 'edit-from-detail', 'first-row');
          } catch (e) {
            console.log('  edit-from-detail failed:', e.message.split('\n')[0]);
          }
        }
        await resetTo(page, url).catch(() => {});
      } catch (e) {
        console.log('  detail failed:', e.message.split('\n')[0]);
        await resetTo(page, url).catch(() => {});
      }
    } else {
      // Fallback: inline edit icon
      const editBtn = page.locator('button:has(img[alt="update"]), button[aria-label="update"]').first();
      if (await editBtn.count() > 0) {
        try {
          await editBtn.click({ timeout: 4000 });
          await page.waitForTimeout(1200);
          await shot(page, section, 'edit-form', 'first-row');
          await resetTo(page, url).catch(() => {});
        } catch (e) {
          console.log('  inline-edit failed:', e.message.split('\n')[0]);
        }
      }
    }

    // Create form
    const createBtn = page.locator('button', { hasText: /新規/ }).first();
    if (await createBtn.count() > 0) {
      try {
        await createBtn.click({ timeout: 4000 });
        await page.waitForTimeout(1200);
        await shot(page, section, 'create-form', 'new');
        await resetTo(page, url).catch(() => {});
      } catch (e) {
        console.log('  create failed:', e.message.split('\n')[0]);
      }
    }

    // Delete confirm dialog (first row) — cancel out
    const trashBtn = page.locator('button:has(img[alt="delete"])').first();
    if (await trashBtn.count() > 0) {
      try {
        await trashBtn.click({ timeout: 4000 });
        await page.waitForTimeout(1000);
        await shot(page, section, 'delete-confirm', 'dialog');
        const cancelBtn = page.getByRole('button', { name: /キャンセル|閉じる|いいえ/ }).first();
        if (await cancelBtn.count() > 0) {
          await cancelBtn.click({ timeout: 3000 });
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(400);
        await resetTo(page, url).catch(() => {});
      } catch (e) {
        console.log('  delete-confirm failed:', e.message.split('\n')[0]);
        await page.keyboard.press('Escape').catch(() => {});
        await resetTo(page, url).catch(() => {});
      }
    }
  }

  await browser.close();

  // ---- Write manifests ----
  fs.writeFileSync(
    path.join(OUT_DIR, 'flow.json'),
    JSON.stringify({ role: ROLE, email: LOGIN_EMAIL, sections: SECTIONS, screens: found }, null, 2)
  );

  const bySection = {};
  for (const f of found) {
    bySection[f.section] = bySection[f.section] || [];
    bySection[f.section].push(f);
  }
  const md = [
    `# Admin Screen Flow — ${ROLE}`,
    '',
    `- Account: \`${LOGIN_EMAIL}\``,
    `- Sections visited: ${SECTIONS.length}`,
    `- Screens captured: ${found.length}`,
    '',
    ...Object.entries(bySection).flatMap(([section, items]) => [
      `## ${section}`,
      '',
      ...items.map((it) => `- **${it.kind}** (${it.label}) — \`${new URL(it.url).pathname}\` — ![](${it.screenshot})`),
      '',
    ]),
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'flow.md'), md);
  console.log(`\nDone. ${found.length} screens -> ${OUT_DIR}`);
})();
