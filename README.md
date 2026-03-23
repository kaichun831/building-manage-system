# 大廈管理委員會系統

> 基於 Next.js 15 + Firebase 的全端大廈管理平台，支援住戶管理、議題提報、公告、會議紀錄、財務管理等功能。

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
| 📝 操作日誌 | 管理員所有異動操作自動寫入 Firebase `logs` collection |

---

## 技術架構

- **前端**: React 18 + Next.js 15 (App Router)
- **後端**: Next.js API Routes (Server-side)
- **資料庫**: Firebase Firestore
- **儲存**: Firebase Storage（收據圖片）
- **認證**: JWT（jose）+ bcryptjs 密碼雜湊
- **Email**: Nodemailer（忘記密碼寄信）
- **樣式**: Tailwind CSS
- **部署**: Cloudflare Pages

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製以下內容建立 `.env.local`：

```env
# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Firebase Client（前端用）
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin（後端用）
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"

# SMTP 郵件（忘記密碼功能）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 系統網址（重設密碼連結用）
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Firebase 設定

1. 前往 [Firebase Console](https://console.firebase.google.com/) 建立專案
2. 啟用 **Firestore Database**
3. 啟用 **Storage**
4. 在「專案設定 > 一般」取得 Web 應用程式配置（填入 `NEXT_PUBLIC_*`）
5. 在「專案設定 > 服務帳戶」產生私密金鑰（填入 `FIREBASE_*`）

### 4. 初始化資料庫

```bash
node scripts/init-firebase.js
```

此指令會建立：
- ✅ 管理員帳號（帳號：`admin` / 密碼：`password`）
- ✅ 初始主委資料（若不存在）
- ✅ 歡迎公告（若不存在）

> ⚠️ **請於首次登入後立即修改 admin 密碼**

### 5. 啟動開發伺服器

```bash
npm run dev
```

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
| POST | `/api/upload` | 上傳圖片至 Firebase Storage |

---

## 建置與部署

```bash
# 建置
npm run build

# 部署到 Cloudflare Pages
npm run pages:build
npm run pages:deploy
```

### Cloudflare Pages 設定

1. 安裝 Wrangler CLI：`npm install -g wrangler`
2. 登入：`wrangler login`
3. 在 Cloudflare Dashboard 設定所有環境變數（同 `.env.local`）

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
│   │   └── upload/
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
│   ├── db.ts             # Firestore CRUD
│   ├── firebase.ts       # 客戶端 Firebase
│   ├── mailer.ts         # Nodemailer
│   └── useAuth.ts        # 客戶端 Auth Hook
├── scripts/
│   └── init-firebase.js  # 初始化腳本
└── types/
    └── index.ts          # TypeScript 型別定義
```

---

## 注意事項

- `.env.local` 及 Firebase 私鑰 JSON 已加入 `.gitignore`，**請勿提交至版本控制**
- 首次部署後請執行 `node scripts/init-firebase.js` 初始化資料
- Gmail SMTP 需使用「應用程式密碼」而非帳號密碼
