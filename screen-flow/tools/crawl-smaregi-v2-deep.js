// Supplementary crawl for Admin Smaregi V2 tenant — captures V2-only flows.
// Order matters: kiosk mode traps navigation, so it runs LAST.
//
// Booking-management list is empty by default (filter status=入場中); we click
// リセット + 検索する first so rows appear before extracting action buttons.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://dhxkf93d45vp4.cloudfront.net';
const EMAIL = process.env.SM_V2_EMAIL || 'nguyetntm+300@dipro.vn';
const PASSWORD = process.env.SM_V2_PASSWORD || '123123Ad';
const SECRET_Q = '本社オフィスのドアの色は？';
const SECRET_A = '赤色';
const HEADLESS = process.env.HEADED === '1' ? false : true;

const OUT_DIR = path.resolve(__dirname, '..', 'admin/smaregi-v2');
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const flowPath = path.join(OUT_DIR, 'flow.json');
const existing = fs.existsSync(flowPath) ? JSON.parse(fs.readFileSync(flowPath, 'utf8')) : { screens: [], sections: [] };
// Keep only shots numbered 001-099 (from generic crawl-admin.js run)
const baseScreens = (existing.screens || []).filter((s) => {
  const m = s.screenshot.match(/screenshots\/(\d+)-/);
  return m && parseInt(m[1], 10) < 100;
});
const found = [...baseScreens];
let shotCounter = 200;

// Also cleanup any 200-range shots from the previous failed run
for (const f of fs.readdirSync(SHOT_DIR)) {
  const m = f.match(/^(\d+)-/);
  if (m && parseInt(m[1], 10) >= 200) {
    fs.unlinkSync(path.join(SHOT_DIR, f));
  }
}

async function shot(page, section, kind, label) {
  shotCounter += 1;
  const safeSection = section.replace(/[^\w-]+/g, '_');
  const safeLabel = label.replace(/[^\w-]+/g, '_').slice(0, 40);
  const file = `${shotCounter}-${safeSection}-${kind}-${safeLabel}.png`;
  try {
    await page.screenshot({ path: path.join(SHOT_DIR, file), fullPage: true });
    found.push({ section, kind, label, url: page.url(), screenshot: `screenshots/${file}` });
    console.log(`  [shot] ${section}/${kind}/${label} -> ${file}`);
    return file;
  } catch (e) {
    console.log(`  [shot-FAIL] ${section}/${kind}/${label}: ${e.message.split('\n')[0]}`);
    return null;
  }
}

async function reset(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(1500);
}

async function submitSearchWithWideDate(page) {
  // Reset filters so status isn't limiting us
  const resetBtn = page.getByRole('button', { name: 'リセット' }).first();
  if (await resetBtn.count() > 0) {
    await resetBtn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
  }
  // Set start date to a year ago via date input (yyyy/mm/dd placeholder is text input)
  const startDate = page.locator('input[placeholder="yyyy/mm/dd"]').first();
  if (await startDate.count() > 0) {
    try {
      await startDate.click({ timeout: 2000 });
      await startDate.fill('2024/01/01');
      await page.keyboard.press('Tab');
    } catch (_) {}
  }
  const searchBtn = page.getByRole('button', { name: '検索する' }).first();
  if (await searchBtn.count() > 0) {
    await searchBtn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
}

(async () => {
  console.log(`\n=== Deep crawl smaregi-v2 email=${EMAIL} headless=${HEADLESS} ===\n`);
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    httpCredentials: { username: 'admin', password: '123123' },
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // Login
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  if (page.url().includes('/signin')) {
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await page.waitForTimeout(2500);
    try {
      await page.getByText('秘密の質問').first().waitFor({ timeout: 4000 });
      await page.waitForTimeout(800);
      await page.locator('input[role="combobox"]').first().click();
      await page.getByRole('option', { name: SECRET_Q }).click();
      await page.fill('input[name="answer"]', SECRET_A);
      await page.locator('button:has-text("次へ")').first().click();
      await page.waitForTimeout(2000);
    } catch (_) {}
  }
  console.log('  logged in, url =', page.url());
  await page.waitForTimeout(1500);

  // ---------- 1. Scan-management (deep) ----------
  console.log('\n== scan-management (deep) ==');
  await reset(page, `${BASE}/admin/scan-management`);
  await submitSearchWithWideDate(page);
  await shot(page, 'scan-management', 'list', 'after-search');

  const scanDetailBtn = page.locator('button:has(img[alt="detail"]), button[aria-label="details"]').first();
  if (await scanDetailBtn.count() > 0) {
    try {
      await scanDetailBtn.click({ timeout: 4000 });
      await page.waitForTimeout(1500);
      await shot(page, 'scan-management', 'detail-route', 'first-row');

      const edit = page.getByRole('button', { name: '編集する' }).first();
      if (await edit.count() > 0) {
        await edit.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);
        await shot(page, 'scan-management', 'edit-from-detail', 'first-row');
      }
    } catch (e) {
      console.log('  scan detail failed:', e.message.split('\n')[0]);
    }
  } else {
    console.log('  no detail button on scan-management — list may be empty for this tenant');
  }

  // ---------- 2. Booking-management (deep) ----------
  console.log('\n== booking-management (deep) ==');
  await reset(page, `${BASE}/admin/booking-management`);
  await submitSearchWithWideDate(page);
  await shot(page, 'booking-management', 'list', 'after-search');

  // Find first row's action buttons — there are 4 IconButtons per row
  // (0=detail eye, 1=update pencil, 2=delete trash/refund, 3=partial-checkout)
  // Grid rows have data-id attribute
  const firstRow = page.locator('.MuiDataGrid-row').first();
  const rowCount = await firstRow.count();
  console.log('  first row present?', rowCount > 0);

  let firstBookingId = null;
  if (rowCount > 0) {
    // 2a. Detail route (click eye/detail — should navigate to /details/[id])
    const eyeBtn = firstRow.locator('button:has(img[alt="detail"])').first();
    if (await eyeBtn.count() > 0) {
      try {
        await eyeBtn.click({ timeout: 4000 });
        await page.waitForURL(/booking-management\/details\/[^/?]+/, { timeout: 10000 });
        await page.waitForTimeout(1500);
        await shot(page, 'booking-management', 'detail-route', 'first-row');
        const m = page.url().match(/booking-management\/details\/([^/?]+)/);
        if (m) firstBookingId = m[1];
        console.log('  captured booking id:', firstBookingId);
      } catch (e) {
        console.log('  detail-route failed:', e.message.split('\n')[0]);
      }
    }

    // 2b. Password confirm dialog (open update from list — likely triggers password)
    await reset(page, `${BASE}/admin/booking-management`);
    await submitSearchWithWideDate(page);
    const row2 = page.locator('.MuiDataGrid-row').first();
    const btns = row2.locator('button');
    const btnTotal = await btns.count();
    console.log('  action button count in first row:', btnTotal);

    // Try index 1 = update (pencil) — usually 2nd icon
    for (let idx = 1; idx < Math.min(btnTotal, 4); idx++) {
      try {
        const b = btns.nth(idx);
        if (await b.isDisabled().catch(() => true)) continue;
        const alt = await b.locator('img').first().getAttribute('alt').catch(() => null);
        console.log(`  clicking action btn idx=${idx} alt=${alt}`);
        await b.click({ timeout: 3000 });
        await page.waitForTimeout(1800);

        // Password dialog?
        const passInput = page.locator('input[type="password"]').first();
        if (await passInput.count() > 0) {
          await shot(page, 'booking-management', 'password-confirm', `from-action-${alt || idx}`);
          const cancel = page.getByRole('button', { name: /キャンセル|閉じる/ }).first();
          if (await cancel.count() > 0) await cancel.click({ timeout: 3000 }).catch(() => {});
          await page.waitForTimeout(500);
        } else if (/booking-management\/(update|partial-checkout|refund|cancel)/.test(page.url())) {
          const routeName = page.url().match(/booking-management\/(\w+)/)[1];
          await shot(page, 'booking-management', `${routeName}-route`, `from-action-${alt || idx}`);
          await reset(page, `${BASE}/admin/booking-management`);
          await submitSearchWithWideDate(page);
        } else {
          // Modal/dialog opened
          const dialog = page.locator('[role="dialog"], .MuiDialog-root').first();
          if (await dialog.count() > 0) {
            await shot(page, 'booking-management', 'action-dialog', `${alt || idx}`);
            await page.keyboard.press('Escape').catch(() => {});
          }
        }
        // Re-load list for next iteration
        await reset(page, `${BASE}/admin/booking-management`);
        await submitSearchWithWideDate(page);
      } catch (e) {
        console.log(`  action idx=${idx} failed:`, e.message.split('\n')[0]);
      }
    }

    // 2c. Direct navigate to partial-checkout with captured id (may still hit password gate)
    if (firstBookingId) {
      await reset(page, `${BASE}/admin/booking-management/partial-checkout/${firstBookingId}`);
      await shot(page, 'booking-management', 'partial-checkout-route', `id-${firstBookingId}`);
      await reset(page, `${BASE}/admin/booking-management/update/${firstBookingId}`);
      await shot(page, 'booking-management', 'update-route', `id-${firstBookingId}`);
    }
  } else {
    console.log('  booking list empty even after search — tenant may have 0 bookings');
  }

  // ---------- 3. Barcode Scanner — LAST because kiosk traps navigation ----------
  console.log('\n== barcode-scanner (kiosk last) ==');
  await reset(page, `${BASE}/admin/barcode-scanner`);
  await shot(page, 'barcode-scanner', 'normal', 'with-fullscreen-button');

  // Try the tabs on the scanner (バーコードリーダー / カメラスキャン)
  const scannerTabs = page.locator('[role="tab"]');
  const scTabCount = await scannerTabs.count();
  console.log('  scanner tabs:', scTabCount);
  for (let i = 0; i < scTabCount; i++) {
    try {
      const label = (await scannerTabs.nth(i).textContent())?.trim() || `tab${i}`;
      await scannerTabs.nth(i).click({ timeout: 3000 });
      await page.waitForTimeout(800);
      await shot(page, 'barcode-scanner', 'tab', label);
    } catch (_) {}
  }

  // Enter kiosk fullscreen
  const fsBtn = page.getByRole('button', { name: '全画面にする' }).first();
  if (await fsBtn.count() > 0) {
    await fsBtn.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await shot(page, 'barcode-scanner', 'kiosk', 'fullscreen');

    // Kiosk tabs (入場・退場・決済 vs 入場取り消し・退場取り消し)
    const kioskTabs = page.locator('button:has-text("入場"), button:has-text("退場")');
    const ktCount = await kioskTabs.count();
    for (let i = 0; i < Math.min(ktCount, 4); i++) {
      try {
        const label = (await kioskTabs.nth(i).textContent())?.trim().slice(0, 20) || `tab${i}`;
        await kioskTabs.nth(i).click({ timeout: 3000 });
        await page.waitForTimeout(800);
        await shot(page, 'barcode-scanner', 'kiosk-tab', label);
      } catch (_) {}
    }

    // Camera scan sub-tab
    const cameraBtn = page.getByRole('button', { name: 'カメラスキャン' }).first();
    if (await cameraBtn.count() > 0) {
      await cameraBtn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(600);
      await shot(page, 'barcode-scanner', 'kiosk-camera-tab', 'camera');
    }

    // Logout confirm dialog
    const logoutBtn = page.getByRole('button', { name: 'ログアウト' }).first();
    if (await logoutBtn.count() > 0) {
      try {
        await logoutBtn.click({ timeout: 3000 });
        await page.waitForTimeout(800);
        await shot(page, 'barcode-scanner', 'kiosk-logout-confirm', 'dialog');
      } catch (_) {}
    }
  }

  await browser.close();

  const updated = { ...existing, screens: found, deepAppended: true };
  fs.writeFileSync(flowPath, JSON.stringify(updated, null, 2));

  const bySection = {};
  for (const f of found) {
    (bySection[f.section] = bySection[f.section] || []).push(f);
  }
  const md = [
    `# Admin Screen Flow — smaregi-v2 (base + V2 deep)`,
    '',
    `- Account: \`${EMAIL}\``,
    `- Total screens: ${found.length}`,
    '',
    ...Object.entries(bySection).flatMap(([section, items]) => [
      `## ${section}`,
      '',
      ...items.map((it) => `- **${it.kind}** (${it.label}) — \`${new URL(it.url).pathname}\` — ![](${it.screenshot})`),
      '',
    ]),
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'flow.md'), md);
  console.log(`\nDone. Total ${found.length} screens -> ${OUT_DIR}`);
})();
