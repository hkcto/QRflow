# QRflow — Dynamic QR Code SaaS

一次建立、永久可改的動態 QR Code。QR 圖片永遠編碼 `https://<APP_URL>/r/<code>`，之後只改資料庫裡的 `target_url`，已印出的 QR 不需要更換。

- 前端 / 後端：Next.js 15 App Router、TypeScript、TailwindCSS v4、Server Actions
- 資料庫 / 認證：Supabase Postgres + Google OAuth（僅 Google 登入）
- QR 產生：`qr-code-styling`（瀏覽器端 Canvas / SVG，支援樣式與即時預覽）
- 部署：Vercel

---

## 功能

| 功能 | 狀態 |
|---|---|
| Google 登入 / 登出 | ✅ |
| 受保護的 `/dashboard` | ✅ |
| 建立 QR（Link / Text / Wi-Fi / vCard） | ✅ |
| 列表：名稱、內容摘要、掃描數 | ✅ |
| 編輯名稱 / 目標網址（Link 短碼不變；其他類型鎖定型別） | ✅ |
| 刪除（含二次確認） | ✅ |
| QR 樣式：6 組預設 + 完整外觀（點狀 / 邊角 / 漸層 / 背景圓角 / 圓形） | ✅ |
| QR Logo：PNG / JPEG / WebP 上傳、大小 / 留白 / 清除底點，自動提升容錯至 H | ✅ |
| QR 檢視、複製短鏈或內容、PNG 512 / PNG 1024 / SVG 下載 | ✅ |
| 免登入靜態 QR（Link / Text / Wi-Fi / vCard） | ✅ |
| 匿名掃描計數（原子遞增） | ✅ |
| 深色模式、響應式 | ✅ |
| 功能旗標 `ENABLE_PRO` + `/pricing` | ✅ |
| Stripe / 角色 / 郵件登入 | ❌ 刻意不做 |

---

## 目錄結構

```
QRCode_saas/
├─ .env.example
├─ .env.local               # 本機用，已 gitignore
├─ middleware.ts            # 只刷新 Supabase session
├─ supabase/schema.sql      # 建表 + RLS + RPC（執行一次）
├─ types/database.ts        # 最小型別定義
├─ lib/
│  ├─ auth.ts               # getUser / requireUser
│  ├─ features.ts           # ENABLE_PRO
│  ├─ qr.ts                 # 短碼、短鏈
│  ├─ qr-style.ts           # 樣式型別、預設集、白名單驗證
│  ├─ qr-payload.ts         # 靜態 QR 內容（Link / Text / Wi-Fi / vCard）
│  ├─ qr-content.ts         # 四種 QR 類型、payload 正規化與伺服器驗證
│  ├─ validation.ts         # 表單驗證（無 zod）
│  ├─ types.ts
│  └─ supabase/             # client / server / middleware
├─ components/
│  ├─ qr-form.tsx           # useActionState 表單（內容 + 樣式面板）
│  ├─ qr-content-editor.tsx # 共用內容編輯器（Link / Text / Wi-Fi / vCard）
│  ├─ qr-code.tsx           # 客戶端 qr-code-styling 渲染器
│  ├─ qr-style-editor.tsx   # 樣式面板
│  ├─ qr-download-buttons.tsx
│  ├─ static-qr-tool.tsx    # 免登入靜態 QR 工具
│  ├─ qr-card.tsx
│  ├─ copy-button.tsx
│  ├─ delete-form.tsx
│  └─ theme-toggle.tsx
└─ app/
   ├─ page.tsx              # 落地頁 + Google 登入
   ├─ static-qr/page.tsx    # 免登入靜態 QR（純前端）
   ├─ pricing/page.tsx
   ├─ privacy/page.tsx      # 隱私政策（Google OAuth 發佈需要）
   ├─ terms/page.tsx        # 服務條款（Google OAuth 發佈需要）
   ├─ auth/callback/route.ts
   ├─ r/[code]/route.ts     # 計數 + 307 跳轉
   └─ dashboard/            # 列表、建立、詳情、編輯、actions
```

---

## 1. 安裝與啟動

需求：Node.js 22 LTS 以上、npm。

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

先完成下面 2、3 節取得 Supabase 與 Google 的金鑰，填入 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_PRO=false
```

啟動：

```bash
npm run dev      # http://localhost:3000
npm run build    # 生產建置
npm run lint
```

---

## 2. Supabase 設定

1. 建立專案：<https://supabase.com/dashboard> → **New project**（區域選離使用者最近的）。
2. 開啟 **SQL Editor → New query**，貼上 `supabase/schema.sql` 全文並執行。
   - 這會建立 `qrcodes` 表、索引、`style` / `kind` / `payload` 欄位、4 條 RLS 策略，以及兩個 `SECURITY DEFINER` 函式：
     - `increment_scan(code)`：匿名掃描時原子遞增並回傳目標網址
     - `get_qr_public(code)`：保留給舊版 PNG 端點，現已不再使用（不刪除，避免破壞性變更）

   > **既有專案升級**：若 `qrcodes` 表已存在，只要補跑這一段即可（可重複執行）：
   >
   > ```sql
   > alter table public.qrcodes
   >   add column if not exists style jsonb not null default '{}'::jsonb;
   > alter table public.qrcodes
   >   add column if not exists kind text not null default 'url';
   > alter table public.qrcodes
   >   add column if not exists payload jsonb not null default '{}'::jsonb;
   > ```
   >
   > 未執行遷移前，Link QR 仍可正常建立與編輯（程式會自動退回不寫入樣式 / 類型），但樣式不會保留，Text / Wi-Fi / vCard 會提示先執行 `supabase/schema.sql`。
3. 取得金鑰：**Project Settings → API**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **不要**使用 `service_role` key，本專案不需要。

> 安全設計：`qrcodes` 沒有對 `anon` 開放任何 SELECT 策略，因此匿名者無法透過 PostgREST 列出所有目標網址；唯一的匿名入口是上面兩個受限函式。

### 未來要「暫停」某個 QR

`is_active = false` 後，`/r/<code>` 會回 404：

```sql
update public.qrcodes set is_active = false where code = 'abc1234';
```

---

## 3. Google OAuth 設定

### 3.1 Google Cloud Console

1. <https://console.cloud.google.com/> → 建立或選擇專案。
2. **APIs & Services → OAuth consent screen**：選 External，填 App name、support email、developer email，儲存。
3. **Credentials → Create credentials → OAuth client ID**
   - Application type：**Web application**
   - Authorized redirect URI：
     ```
     https://<PROJECT-REF>.supabase.co/auth/v1/callback
     ```
     （`<PROJECT-REF>` 是 Supabase 專案網址的前段，例如 `abcdefghijkl`）
4. 記下 **Client ID** 與 **Client secret**。

### 3.2 Supabase

1. **Authentication → Providers → Google**：Enable，貼上 Client ID / Secret，Save。
2. **Authentication → URL Configuration**
   - **Site URL**：`http://localhost:3000`（上線後改成 `https://your-domain.com`）
   - **Redirect URLs** 加入：
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     ```

流程：`/` 按「Continue with Google」→ Supabase OAuth → `/auth/callback` 交換 session → `/dashboard`。

---

## 4. 部署到 Vercel

1. 把專案推到 GitHub：

   ```bash
   git init
   git add .
   git commit -m "Dynamic QR code SaaS"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. Vercel → **Add New Project** → 匯入 repo（Framework 會自動偵測 Next.js）。
3. **Environment Variables** 加入：

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |
   | `ENABLE_PRO` | `false` |

4. Deploy。
5. 回到 Supabase **URL Configuration**，把 Site URL 與 Redirect URLs 換成正式網域。
6. 用手機掃一張剛建立的 QR，確認能跳轉且計數增加。

> `NEXT_PUBLIC_APP_URL` 決定 QR 圖片裡編碼的網址。**一旦印出就不要改網域**，否則舊碼會指向舊網域。

> **效能**：`vercel.json` 把 Serverless Function 固定在 `hkg1`（香港），貼近主要使用者，也比預設 `iad1` 更接近 Supabase 的亞洲資料庫。`/`、`/pricing`、`/static-qr` 與法務頁都是靜態預渲染，直接由 CDN 提供；中間件只跑 `/`、`/dashboard/*`、`/auth/*`，公開頁面不會觸發 Supabase 驗證。

---

## 5. 驗收清單

- [ ] Google 登入成功、登出可用
- [ ] 未登入訪問 `/dashboard` 會回首頁
- [ ] 建立 QR 後出現在列表，縮圖與所選樣式一致
- [ ] 登入後可建立 Link / Text / Wi-Fi / vCard 四種類型
- [ ] Text / Wi-Fi / vCard 內容直接編碼，無 `/r/` 短鏈、無掃描計數
- [ ] 編輯已建立的 QR 時類型鎖定，內容與樣式仍可修改
- [ ] 建立時選樣式 → 重新整理後樣式保留
- [ ] 上傳 Logo 後即時預覽、切換預設樣式仍保留 Logo，PNG / SVG 下載都含 Logo
- [ ] 有 Logo 時容錯自動為 H；移除 Logo 後回到 Q
- [ ] 登入與未登入使用同一套樣式面板（漸層、圓角、圓形代碼、Logo 功能一致）
- [ ] 漸層樣式下載 PNG 512 / PNG 1024 / SVG 正常
- [ ] 下載 PNG 512 / PNG 1024 / SVG，手機掃描可跳轉或讀出內容
- [ ] 修改目標網址後，同一張圖跳到新網址，`/r/<code>` 不變
- [ ] 每次掃描 `scan_count + 1`
- [ ] `/static-qr` 未登入可開，四種內容類型都能產生 QR
- [ ] Wi-Fi 與 vCard payload 格式正確（可用手機實測）
- [ ] 複製短鏈可用
- [ ] 刪除後 `/r/<code>` 回 404
- [ ] 第二個帳號看不到別人的 QR（RLS）
- [ ] 手機寬度正常、深色模式可切換且重整後保持
- [ ] `npm run lint` 與 `npm run build` 成功

---

## 6. 運營後台（Supabase Studio）

不建 Admin UI，直接用 Supabase Studio：

```sql
-- 全站概況
select
  (select count(*) from auth.users) as total_users,
  (select count(*) from public.qrcodes) as total_qrcodes,
  (select coalesce(sum(scan_count), 0) from public.qrcodes) as total_scans;

-- 每位使用者的用量
select u.email,
       count(q.id) as qr_count,
       coalesce(sum(q.scan_count), 0) as total_scans
from auth.users u
left join public.qrcodes q on q.user_id = u.id
group by u.email
order by total_scans desc;

-- 下架違規碼
delete from public.qrcodes where code = 'abc1234';
```

> 不要建立 `public` schema 的統計 view：Supabase 會透過 PostgREST 暴露它，而 view 預設不套用 RLS。若要建，請加 `with (security_invoker = true)` 或放在未暴露的 schema。

---

## 7. 已知限制（刻意取捨）

- **計數沒有防刷**：任何請求（含機器人）都會 +1。可在 `/r/[code]` 過濾常見 bot UA，或加邊緣限流。
- **公開跳轉端點**：可能被用來指向惡意網站。上線後請定期用上面的 SQL 巡查，必要時 `is_active = false` 或刪除。
- **靜態 QR 無法遠端修改**：`/static-qr` 的內容直接寫進圖檔，下載後就固定了；違規內容只能請使用者自行停用。
- **直接編碼類型無掃描計數**：Text / Wi-Fi / vCard 不經過 `/r/<code>`，所以沒有掃描數；修改內容等於換一張新 QR，已印出的舊碼不變。
- **QR 在瀏覽器產生**：因此無法用單一網址取得 PNG（例如 email 內嵌或 OG image）。儀表板與 `/static-qr` 皆為即時渲染。
- **無分頁**：列表一次載入全部。使用者量大時再加 `.range()`。
- **無掃描明細**：只有總數。要按天/裝置統計需另建 `scans` 表。
- **代理/預覽網域**：若沒設 `NEXT_PUBLIC_APP_URL`，會退回 `VERCEL_URL`，QR 內容會指向該網域。

---

## 8. 未來 Stripe 接法（本版未實作）

結構已預留：

1. `lib/features.ts` 的 `features.pro` 作為 UI 開關。
2. `/pricing` 已有 Free / Pro 兩張卡與 disabled CTA。
3. 接入時新增：
   - `subscriptions` 表（`user_id`, `stripe_customer_id`, `status`, `price_id`, `current_period_end`）
   - `/api/stripe/webhook/route.ts`（驗簽後 upsert 訂閱）
   - Checkout Server Action
   - `features.pro` 改為「讀取該使用者的訂閱狀態」，而不是環境變數

---

## 9. 技術備註

- Next.js 15：`cookies()`、`params`、`searchParams` 皆為 Promise。
- `/r/[code]` 設 `dynamic = "force-dynamic"`，避免被 Vercel 快取導致計數不準。
- 短碼：7 位 `[a-z0-9]`，建立時遇唯一鍵衝突（`23505`）自動重試 5 次。
- 目標網址只允許 `http:` / `https:`，避免 `javascript:` 注入。
- QR 內編碼的是 `/r/<code>`，與 `target_url` 完全解耦。
- QR 由 `qr-code-styling` 在瀏覽器繪製（`components/qr-code.tsx` 動態 import），約 4 模組留白；一般固定錯誤修正 `Q`，有 Logo 時自動提升為 `H`。
- Logo 以 data URL 儲存在 `style.logo`，只接受 `png` / `jpeg` / `webp`，長度上限 400k；使用者端先縮放與壓縮，伺服器再以白名單驗證（拒絕 SVG / 遠端 URL）。
- QR 類型與內容存於 `kind` / `payload`；Link 使用 `target_url` + `/r/<code>`，其餘直接編碼。類型建立後鎖定，避免已印出的 QR 失效。
- 樣式與內容都在 Server Action 以白名單驗證（固定 enum + `#rrggbb`，背景可用 `transparent`；內容重新建構 payload 並檢查大小），不信任前端 JSON。
- `qr-code-styling` 型別會引用 `canvas` / `jsdom`，靠 `skipLibCheck` 與 `next.config.ts` 的 webpack alias 避開。
