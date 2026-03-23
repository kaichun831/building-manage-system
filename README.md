# 大廈管理委員會系統

> 基於 Next.js 15 + Firebase / Supabase 的全端大廈管理平台，支援住戶管理、議題提報、公告、會議紀錄、財務管理等功能。

---

## 功能特色

| 模組 | 功能說明 |
|------|----------|
| 🔐 認證系統 | 住戶註冊／登入、記住帳號、忘記密碼（Email 重設連結） |
| 📢 公告系統 | 管理員發布公告，登入頁即可預覽最新 10 筆 |
| 📋 議題管理 | 住戶提報議題（7 種分類），管理員可編輯／刪除／變更狀態 |
| 🏛️ 主委管理 | 委任主委、歷任紀錄、任期顯示 |
| 👥 住戶成員 | 住戶列表（本人置頂）、個人資料編輯、管理員可刪除住戶 |
| 📅 會議紀錄 | 新增／編輯會議，出席者多選（含全選），列表顯示出席 tag |
| 💰 財務管理 | 支出紀錄、收據圖片上傳（自動壓縮）、作廢功能（需填原因）、統計卡片 |
| 📝 操作日誌 | 管理員所有異動操作自動寫入 `logs` collection |

---

## 技術架構

- **前端**: React 18 + Next.js 15 (App Router)
- **後端**: Next.js API Routes (Server-side)
- **資料庫**: Firebase Firestore 或 Supabase（透過 `DB_PROVIDER` 切換）
- **圖片儲存**: Firebase Storage 或 AWS S3（透過 `UPLOAD_PROVIDER` 切換）
- **認證**: JWT（jose）+ bcryptjs 密碼雜湊
- **Email**: AWS SES（忘記密碼寄信）
- **樣式**: Tailwind CSS
- **部署**: Docker + AWS EC2 + Cloudflare（DNS / HTTPS）

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.sample .env.local
# 編輯 .env.local 填入實際值
```

### 3. 初始化資料庫

**Firebase：**
```bash
node scripts/init-firebase.js
```

**Supabase：**
```bash
# 先在 Supabase SQL Editor 執行 scripts/supabase-schema.sql
node scripts/init-supabase.js
```

兩個指令都會建立：
- ✅ 管理員帳號（帳號：`admin` / 密碼：`password`）
- ✅ 歡迎公告

> ⚠️ **請於首次登入後立即修改 admin 密碼**

### 4. 啟動開發伺服器

```bash
npm run dev
```

---

## 環境變數說明

完整範本請參考 `.env.sample`，以下為各區塊說明：

### JWT
| 變數 | 說明 |
|------|------|
| `JWT_SECRET` | 至少 32 字元的隨機字串 |

### Firebase Client（前端）
| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 專案 API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 專案 ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |

### Firebase Admin（後端）
| 變數 | 說明 |
|------|------|
| `FIREBASE_PROJECT_ID` | Firebase 專案 ID |
| `FIREBASE_CLIENT_EMAIL` | 服務帳戶 Email |
| `FIREBASE_PRIVATE_KEY` | 服務帳戶私鑰 |

### 資料庫切換
| 變數 | 值 | 說明 |
|------|-----|------|
| `DB_PROVIDER` | `firebase`（預設）| 使用 Firebase Firestore |
| `DB_PROVIDER` | `supabase` | 使用 Supabase |
| `SUPABASE_URL` | — | Supabase 專案 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Supabase Service Role Key |

### 圖片上傳切換
| 變數 | 值 | 說明 |
|------|-----|------|
| `UPLOAD_PROVIDER` | `firebase`（預設）| 上傳至 Firebase Storage |
| `UPLOAD_PROVIDER` | `s3` | 上傳至 AWS S3 |
| `AWS_S3_REGION` | — | S3 Bucket 所在區域 |
| `AWS_S3_BUCKET` | — | S3 Bucket 名稱 |
| `AWS_S3_ACCESS_KEY_ID` | — | IAM Access Key ID |
| `AWS_S3_SECRET_ACCESS_KEY` | — | IAM Secret Access Key |
| `AWS_CLOUDFRONT_URL` | — | CloudFront CDN URL（選填） |

### AWS SES（郵件）
| 變數 | 說明 |
|------|------|
| `AWS_SES_REGION` | SES 所在區域（建議 `ap-northeast-1`） |
| `AWS_SES_ACCESS_KEY_ID` | IAM Access Key ID |
| `AWS_SES_SECRET_ACCESS_KEY` | IAM Secret Access Key |
| `AWS_SES_FROM_EMAIL` | 寄件人 Email（需在 SES 驗證網域） |

### 系統網址
| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_BASE_URL` | 系統對外網址，用於重設密碼信件連結 |

---

## 權限說明

| 操作 | 一般住戶 | 管理員（admin） |
|------|----------|----------------|
| 瀏覽公告 | ✅ | ✅ |
| 提出議題 | ✅ | ✅ |
| 編輯／刪除議題 | ❌ | ✅ |
| 變更議題狀態 | ❌ | ✅ |
| 編輯個人資料 | ✅（僅自己） | ✅ |
| 刪除住戶 | ❌ | ✅ |
| 財務新增 | ✅ | ✅ |
| 財務編輯／刪除／作廢 | ❌ | ✅ |
| 委任主委 | ❌ | ✅ |
| 發布公告 | ❌ | ✅ |

---

## 頁面路由

| 路徑 | 說明 | 需登入 |
|------|------|--------|
| `/login` | 登入（含最新公告預覽） | ❌ |
| `/register` | 住戶註冊 | ❌ |
| `/reset-password` | 重設密碼（Email 連結） | ❌ |
| `/announcements` | 公告列表 | ❌ |
| `/dashboard` | 住戶儀表板 | ✅ |
| `/issues` | 議題管理 | ✅ |
| `/meetings` | 會議紀錄 | ✅ |
| `/finance` | 財務管理 | ✅ |
| `/members` | 住戶成員 ＋ 主委管理 | ✅ |
| `/profile` | 個人資料 ＋ 修改密碼 | ✅ |

---

## API 端點

### 認證
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/register` | 住戶註冊 |
| POST | `/api/auth/login` | 登入，回傳 JWT |
| PUT | `/api/auth/password` | 修改密碼（需登入） |
| POST | `/api/auth/reset-password` | 申請重設密碼（寄信） |
| POST | `/api/auth/reset-password/confirm` | 確認 token 並重設密碼 |

### 資料 CRUD
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET/POST | `/api/announcements` | 公告列表／新增 |
| PUT/DELETE | `/api/announcements/[id]` | 編輯／刪除公告 |
| GET/POST | `/api/issues` | 議題列表／新增 |
| PUT/DELETE | `/api/issues/[id]` | 編輯／刪除議題（admin） |
| GET/POST | `/api/chairman` | 主委列表／委任 |
| PUT/DELETE | `/api/chairman/[id]` | 編輯／移除主委 |
| GET/POST | `/api/meetings` | 會議列表／新增 |
| PUT/DELETE | `/api/meetings/[id]` | 編輯／刪除會議 |
| GET/POST | `/api/finance` | 財務列表／新增 |
| PUT/DELETE/PATCH | `/api/finance/[id]` | 編輯／刪除／作廢（admin） |
| GET | `/api/members` | 住戶列表（需登入） |
| PUT/DELETE | `/api/members/[id]` | 更新資料／刪除住戶 |
| POST | `/api/upload` | 上傳圖片（Firebase Storage 或 S3） |

---

## 專案結構

```
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # 認證相關
│   │   ├── announcements/
│   │   ├── chairman/
│   │   ├── finance/
│   │   ├── issues/
│   │   ├── meetings/
│   │   ├── members/
│   │   └── upload/       # 圖片上傳（Firebase / S3）
│   ├── dashboard/
│   ├── finance/
│   ├── issues/
│   ├── login/
│   ├── meetings/
│   ├── members/
│   ├── profile/
│   ├── register/
│   └── reset-password/
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── auth.ts           # JWT + bcrypt
│   ├── db.ts             # Firebase Firestore CRUD
│   ├── db-supabase.ts    # Supabase CRUD
│   ├── db-provider.ts    # 資料庫切換（DB_PROVIDER）
│   ├── firebase.ts       # 客戶端 Firebase
│   ├── mailer.ts         # AWS SES 寄信
│   └── useAuth.ts        # 客戶端 Auth Hook
├── scripts/
│   ├── init-firebase.js  # Firebase 初始化
│   ├── init-supabase.js  # Supabase 初始化
│   └── supabase-schema.sql # Supabase 資料表 Schema
├── types/
│   └── index.ts          # TypeScript 型別定義
├── .env.sample           # 環境變數範本
├── Dockerfile            # Docker 打包設定
├── docker-compose.yml    # Docker Compose 設定
└── DEPLOYMENT.md         # 完整部署指南
```

---

## 部署

Docker 打包與 AWS EC2 + Cloudflare 完整部署流程請參考 **[DEPLOYMENT.md](./DEPLOYMENT.md)**。

---

## 注意事項

- `.env.local` 及 Firebase 私鑰 JSON 已加入 `.gitignore`，**請勿提交至版本控制**
- 複製 `.env.sample` 為 `.env.local` 後填入實際值
- 首次部署後執行對應的初始化腳本建立 admin 帳號
- AWS SES 預設為 Sandbox 模式，需申請 Production Access 才能寄信給任意信箱
