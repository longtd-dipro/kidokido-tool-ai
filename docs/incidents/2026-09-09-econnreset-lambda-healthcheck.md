# Incident — `[Prod][NOT_OK] read ECONNRESET`

| | |
|---|---|
| **Ngày** | 2026-09-09 |
| **Alarm** | 13:26 VNT (06:26 UTC / 15:26 JST) |
| **Severity** | **P3** — false positive, prod KHÔNG down |
| **Root cause** | Bug ở Lambda healthcheck, KHÔNG phải app tokiwagi |
| **Impact user** | Không |
| **Fix ETA** | 1h (Lambda code, ngoài repo tokiwagi) |

---

## 🐞 BUG

Bot bắn cảnh báo `[Prod][NOT_OK] read ECONNRESET` — nhưng **prod vẫn hoạt động bình thường**.

**Tần suất**: Lambda `health-check` chạy mỗi 1 phút (cron `*/1 * * * ? *`), nhưng cảnh báo chỉ bắn **sporadic** (thi thoảng, không mỗi phút). Ngày 2026-09-09 quan sát được **1 lần lúc 13:26 VNT**.

Bằng chứng prod OK:
- ECS `web-service-production`: 2/2 tasks healthy, 0 restart 5 ngày
- RDS `mr1bu7ra6a7x3c7`: CPU/Connections/Memory phẳng
- App log 7 ngày (133K records): 0 match `ECONN|ETIMEDOUT|EPIPE`
- Message ngắn (`read ECONNRESET`), KHÔNG kèm JSON body → đi qua catch block Lambda, KHÔNG phải path parse response từ `/api/health` (nếu DB fail thật, message sẽ dài kèm stack trace vì `src/pages/api/health.ts:22` luôn `res.status(200)` và bọc `{status:"NOT_OK", message:<stack>}` vào body)

→ **Alarm là false positive**. Bug nằm ở Lambda monitoring, không phải backend.

> Fact "chỉ 1 lần / ngày" thực ra **củng cố** root cause bên dưới: nếu là config sai (URL, auth, backend chết) sẽ bắn **mỗi phút liên tục**. Sporadic = đúng dấu hiệu race condition.

---

## 🎯 ROOT CAUSE

**Stale HTTP keep-alive socket** giữa Lambda `health-check` và CloudFront.

```
┌────────────────────────────────────────────────────────────────┐
│  Lambda `health-check` (Node.js 20.x)   cron mỗi 60s           │
│                                                                │
│  export const handler = async (event) => {                     │
│    try {                                                       │
│      httpRequest(event.url, "GET")   ◄─── DÍNH LỖI            │
│    } catch (e) {                                               │
│      message = `[NOT OK] ${e.message}`   ◄─── "read ECONNRESET"│
│      sendNotifications(event, message)                         │
│    }                                                           │
│  }                                                             │
└────────────────────────────────────────────────────────────────┘
              │
              │  http.globalAgent (keepAlive=TRUE mặc định từ Node 19+)
              │  giữ socket lại giữa các invocation
              ▼
┌────────────────────────────────────────────────────────────────┐
│  CloudFront edge                                               │
│  idle timeout 5-15s  <<  Lambda cron 60s                       │
│  → CloudFront đóng socket trước khi Lambda dùng lại            │
└────────────────────────────────────────────────────────────────┘
```

### Cơ chế chi tiết

```
T=0s   Lambda gọi httpRequest → tạo socket A → CloudFront trả 200 OK
       Node giữ socket A trong pool (keepAlive=true)

T=60s  Lambda gọi lại (warm start, cùng context)
       CloudFront ĐÃ đóng socket A (idle > 15s) — nhưng Node không biết
       Node reuse socket A → gửi request → CloudFront trả TCP RST
       Node ném Error: "read ECONNRESET"    ◄── EXACT match với message bot
       catch block bắn webhook → ALARM

T=120s Pool phát hiện socket A dead → tạo socket B → OK, không alarm
```

Đây là **classic Node.js keep-alive pitfall** khi cron period > peer idle timeout.

### Vì sao 100% khớp

| Fact | Khớp |
|---|---|
| Message là `read ECONNRESET` (không phải `connect`/`ETIMEDOUT`) | ✅ Prefix `read` = socket đã established rồi bị RST khi đọc — đúng scenario stale reuse |
| Lambda duration max ~2s (không timeout 30s) | ✅ Socket RST bubble lên tức thì |
| App/ECS/RDS clean, chỉ alarm sporadic | ✅ CloudFront đóng trước khi forward → backend không thấy request |
| Node.js 20 (>=19 default keepAlive=true) | ✅ Trúng version range có bug |

---

## 🛠 FIX

Sửa Lambda `health-check` / `index.mjs` — **1 trong 3 cách**, khuyến nghị **Cách A**:

**Cách A — Tắt keep-alive** (đơn giản, verify được):
```js
import http from "http";
import https from "https";
const httpAgent  = new http.Agent({ keepAlive: false });
const httpsAgent = new https.Agent({ keepAlive: false });

// trong httpRequest(), thêm vào options:
agent: parsedUrl.protocol === "https:" ? httpsAgent : httpAgent,
```

**Cách B — Retry 1 lần khi ECONNRESET** (idempotent-safe cho GET):
```js
try { healthResponse = await httpRequest(event.url, "GET"); }
catch (e) {
  if (e.code === "ECONNRESET" || e.code === "EPIPE") {
    healthResponse = await httpRequest(event.url, "GET"); // retry
  } else throw e;
}
```

**Cách C — Header `Connection: close`**:
```js
headers: { ...headers, "Connection": "close" }
```

---

## 🔗 URL AWS Console để verify

Không có screenshot đính kèm — dev/QA click link mở live console để tự kiểm tra (cần role đọc account `bornelund.co.jp 019348867331`):

| # | Cần xem | URL |
|---|---|---|
| 1 | Lambda code — line 10 `httpRequest`, line 28-29 catch `[NOT OK] ${e.message}` | [Lambda health-check code](https://ap-northeast-1.console.aws.amazon.com/lambda/home?region=ap-northeast-1#/functions/health-check?tab=code) |
| 2 | Runtime settings — warning "Node.js 20.x no longer supported" | Cùng URL trên, scroll xuống Runtime |
| 3 | Test event JSON — payload prod_health-check (url CloudFront, webhookUrl, mentions) | [Lambda Test tab](https://ap-northeast-1.console.aws.amazon.com/lambda/home?region=ap-northeast-1#/functions/health-check?tab=testing) |
| 4 | EventBridge cron `*/1 * * * ? *` | [Scheduler prod_health-check](https://ap-northeast-1.console.aws.amazon.com/scheduler/home?region=ap-northeast-1#schedules/default/prod_health-check) |
| 5 | ECS service events — chỉ "reached a steady state" 5 ngày, 0 restart | [ECS events](https://ap-northeast-1.console.aws.amazon.com/ecs/v2/clusters/web-app-production/services/web-service-production/events?region=ap-northeast-1) |
| 6 | RDS CPU/Connections/Memory phẳng trong window alarm | [CloudWatch RDS metrics](https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#metricsV2:graph=~(metrics~(~(~'AWS*2fRDS~'DatabaseConnections~'DBInstanceIdentifier~'mr1bu7ra6a7x3c7)~(~'.~'CPUUtilization~'.~'.)~(~'.~'FreeableMemory~'.~'.))~region~'ap-northeast-1) |

---

## 📋 Bằng chứng phụ (queries dev tự chạy lại)

```sql
-- 1) App log 7 ngày: 0 match
SOURCE "tokiwagi/prod/logger" START=-604800s END=0s
| filter @message like /(ECONN|ETIMEDOUT|EPIPE|AxiosError|TimeoutError)/
```
→ **0 of 0 matched** trên 133,485 records.

```sql
-- 2) Window alarm 05:50-07:00 UTC: 0 match
SOURCE "tokiwagi/prod/logger" START=2026-09-09T05:50:00Z END=2026-09-09T07:00:00Z
| filter @message like /(health|Prisma|pg_stat|ECONN)/
```
→ **0 of 0 matched** trên 1,586 records.

```sql
-- 3) Lambda log 24h: 0 match (Lambda code không có console.log)
SOURCE "/aws/lambda/health-check" START=-86400s END=0s
| filter @message like /(ECONN|NOT_OK)/
```
→ **0 of 0 matched** — thiếu structured log, đề xuất thêm ở fix P2.

---

## ⚠️ Preventive (khác scope incident)

Trong repo tokiwagi, `src/services/gmo.service.ts` và `src/services/smaregi/smaregi.service.ts` **cùng dùng axios KHÔNG có timeout / retry / custom httpsAgent**. Nếu GMO/Smaregi đóng idle socket, sẽ dính chính lỗi này — tệ hơn vì là tiền/POS realtime.

Đề xuất sprint tới: tạo `src/utils/server/httpClient.ts` với axios-retry cho ECONNRESET/ETIMEDOUT/EPIPE. **KHÔNG retry POST** tạo giao dịch GMO (nguy cơ double charge).

---

*Điều tra: 2026-09-09 14:30-15:45 VNT · dev-agent*
