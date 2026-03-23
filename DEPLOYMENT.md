# 大廈管理系統 — 部署與設定完整指南

> 涵蓋 Docker 打包、AWS EC2 部署、Cloudflare 網域 HTTPS、AWS SES 郵件發送的完整流程。

---

## 目錄

1. [環境需求](#1-環境需求)
2. [本機打包 Docker Image](#2-本機打包-docker-image)
3. [AWS EC2 建立與設定](#3-aws-ec2-建立與設定)
4. [上傳並啟動容器](#4-上傳並啟動容器)
5. [Nginx 反向代理設定](#5-nginx-反向代理設定)
6. [Cloudflare 網域與 HTTPS](#6-cloudflare-網域與-https)
7. [AWS SES 郵件發送設定](#7-aws-ses-郵件發送設定)
8. [環境變數完整清單](#8-環境變數完整清單)
9. [更新部署流程](#9-更新部署流程)
10. [常用管理指令](#10-常用管理指令)

---

## 1. 環境需求

| 工具 | 版本 | 用途 |
|------|------|------|
| Docker Desktop | 最新版 | 本機打包 image |
| Node.js | 20+ | 本機開發 |
| AWS 帳號 | — | EC2 + SES |
| Cloudflare 帳號 | — | 網域 + HTTPS |

---

## 2. 本機打包 Docker Image

### 2-1. 確認 Docker Desktop 已啟動

開啟 Docker Desktop 應用程式，等待左下角顯示 **Engine running**。

### 2-2. 建置 Image

```bash
# 在專案根目錄執行
docker build -t building-management:latest .
```

建置完成後確認：

```bash
docker images | grep building-management
```

### 2-3. 匯出成 tar 檔

```bash
docker save building-management:latest -o building-management.tar
```

> 檔案約 180～200MB，產生在專案根目錄。

---

## 3. AWS EC2 建立與設定

### 3-1. 建立 EC2 執行個體

1. AWS Console → **EC2** → **Launch Instance**
2. 設定如下：

| 項目 | 建議值 |
|------|--------|
| AMI | Amazon Linux 2023 |
| 機型 | t3.small（2 vCPU / 2GB）以上 |
| 儲存 | 20GB gp3 |
| Key Pair | 建立或選擇現有 .pem 金鑰 |

### 3-2. 安全群組 Inbound Rules

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | 你的 IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |

> Port 3000 不需要對外開放，由 Nginx 代理。

### 3-3. 取得 EC2 Public IP

EC2 Dashboard → 點選執行個體 → 複製 **Public IPv4 address**。

---

## 4. 上傳並啟動容器

### 4-1. 上傳 tar 檔到 EC2

```bash
# Windows PowerShell 執行
scp -i "your-key.pem" building-management.tar ec2-user@<EC2_PUBLIC_IP>:~
```

> 也可使用 WinSCP 或 FileZilla 拖曳上傳。

### 4-2. SSH 進入 EC2

```bash
ssh -i "your-key.pem" ec2-user@<EC2_PUBLIC_IP>
```

### 4-3. 安裝 Docker

```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# 重新登入讓群組生效
exit
ssh -i "your-key.pem" ec2-user@<EC2_PUBLIC_IP>
```

### 4-4. 載入 Image

```bash
docker load -i ~/building-management.tar

# 確認載入成功
docker images
```

### 4-5. 建立環境變數檔

```bash
cat > ~/app.env << 'EOF'
# ── JWT ──────────────────────────────────────
JWT_SECRET=your-secret-key-min-32-chars

# ── Firebase Client ───────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# ── Firebase Admin ────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"

# ── Supabase（選填）──────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DB_PROVIDER=firebase

# ── AWS SES ───────────────────────────────────
AWS_SES_REGION=ap-northeast-1
AWS_SES_ACCESS_KEY_ID=your-access-key-id
AWS_SES_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SES_FROM_EMAIL=noreply@your-domain.com

# ── 系統網址 ──────────────────────────────────
NEXT_PUBLIC_BASE_URL=https://your-domain.com
EOF

# 保護檔案權限
chmod 600 ~/app.env
```

### 4-6. 啟動容器

```bash
docker run -d \
  --name building-management \
  --restart unless-stopped \
  --env-file ~/app.env \
  -p 3000:3000 \
  building-management:latest
```

### 4-7. 確認運行狀態

```bash
docker ps
docker logs building-management -f
```

---

## 5. Nginx 反向代理設定

### 5-1. 安裝 Nginx

```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5-2. 建立設定檔

```bash
sudo tee /etc/nginx/conf.d/app.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 5-3. 套用設定

```bash
sudo nginx -t && sudo systemctl reload nginx
```

瀏覽 `http://<EC2_PUBLIC_IP>` 確認可以連線。

---

## 6. Cloudflare 網域與 HTTPS

### 6-1. 新增 DNS A Record

1. Cloudflare Dashboard → 選擇你的網域
2. **DNS** → **Records** → **Add record**

| Type | Name | Content | Proxy status |
|------|------|---------|--------------|
| A | `@`（根網域）或 `app`（子網域） | EC2 Public IP | ✅ Proxied（橘色） |

> 雲朵圖示必須是**橘色 Proxied**，灰色不會套用 HTTPS。

### 6-2. 設定 SSL/TLS 模式

1. Cloudflare Dashboard → 你的網域 → **SSL/TLS** → **Overview**
2. 選擇 **Flexible**

```
用戶 ──HTTPS──▶ Cloudflare ──HTTP──▶ EC2 Nginx Port 80
```

### 6-3. 開啟強制 HTTPS

1. **SSL/TLS** → **Edge Certificates**
2. 開啟以下兩項：

| 設定 | 狀態 |
|------|------|
| Always Use HTTPS | ✅ On |
| Automatic HTTPS Rewrites | ✅ On |

### 6-4. 等待生效

DNS 傳播約需 **1～5 分鐘**，完成後瀏覽 `https://your-domain.com` 應顯示鎖頭圖示。

---

## 7. AWS SES 郵件發送設定

### 7-1. 驗證網域

1. AWS Console → **SES** → **Verified identities** → **Create identity**
2. 選 **Domain**，輸入你的 Cloudflare 網域
3. 取得 AWS 提供的 DNS 記錄

### 7-2. 在 Cloudflare 新增 DNS 記錄

> ⚠️ 以下所有 SES 相關記錄必須設為 **DNS only（灰色）**，不可 Proxied

**DKIM（3 筆 CNAME，名稱和內容以 AWS 提供為準）**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `xxxxxx._domainkey` | `xxxxxx.dkim.amazonses.com` | ☁️ DNS only |
| CNAME | `xxxxxx._domainkey` | `xxxxxx.dkim.amazonses.com` | ☁️ DNS only |
| CNAME | `xxxxxx._domainkey` | `xxxxxx.dkim.amazonses.com` | ☁️ DNS only |

**SPF（TXT Record）**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| TXT | `@` | `v=spf1 include:amazonses.com ~all` | ☁️ DNS only |

### 7-3. 等待 SES 驗證

回到 AWS SES → Verified identities，等狀態變成 **Verified ✅**（約 5 分鐘）。

### 7-4. 申請移出 Sandbox

> SES 預設 Sandbox 模式只能寄給已驗證信箱，需申請移出才能寄給任意信箱。

1. AWS SES → **Account dashboard**
2. 點 **Request production access**
3. 填寫：
   - Mail type：**Transactional**
   - 說明：系統密碼重設信件，用戶觸發
4. 送出後約 **24 小時**核准

### 7-5. 建立 IAM 使用者

1. AWS Console → **IAM** → **Users** → **Create user**
2. 使用者名稱：`building-management-ses`
3. **Attach policies directly** → 搜尋並勾選 `AmazonSESFullAccess`
4. 建立完成後 → **Security credentials** → **Create access key**
5. 選 **Application running outside AWS** → 記下：
   - `Access Key ID`
   - `Secret Access Key`

### 7-6. 更新 EC2 環境變數

```bash
# 編輯 app.env
nano ~/app.env

# 確認以下四行已填入正確值
# AWS_SES_REGION=ap-northeast-1
# AWS_SES_ACCESS_KEY_ID=your-access-key-id
# AWS_SES_SECRET_ACCESS_KEY=your-secret-access-key
# AWS_SES_FROM_EMAIL=noreply@your-domain.com
```

### 7-7. 重啟容器套用設定

```bash
docker stop building-management && docker rm building-management

docker run -d \
  --name building-management \
  --restart unless-stopped \
  --env-file ~/app.env \
  -p 3000:3000 \
  building-management:latest
```

### 7-8. 測試寄信

在系統登入頁點「忘記密碼」，輸入已註冊的 email，確認是否收到重設信件。

---

## 8. 環境變數完整清單

`~/app.env` 完整範本：

```env
# ── JWT ──────────────────────────────────────────────────
JWT_SECRET=your-secret-key-min-32-chars

# ── Firebase Client（前端）────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# ── Firebase Admin（後端）────────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"

# ── Supabase（DB_PROVIDER=supabase 時啟用）───────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DB_PROVIDER=firebase

# ── AWS SES ───────────────────────────────────────────────
AWS_SES_REGION=ap-northeast-1
AWS_SES_ACCESS_KEY_ID=your-access-key-id
AWS_SES_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SES_FROM_EMAIL=noreply@your-domain.com

# ── 系統網址 ──────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

---

## 9. 更新部署流程

每次有新版本時，在本機執行：

```bash
# 1. 重新建置 image
docker build -t building-management:latest .

# 2. 匯出 tar
docker save building-management:latest -o building-management.tar

# 3. 上傳到 EC2
scp -i "your-key.pem" building-management.tar ec2-user@<EC2_PUBLIC_IP>:~

# 4. SSH 進入 EC2
ssh -i "your-key.pem" ec2-user@<EC2_PUBLIC_IP>

# 5. 載入新 image 並重啟
docker load -i ~/building-management.tar
docker stop building-management && docker rm building-management
docker run -d \
  --name building-management \
  --restart unless-stopped \
  --env-file ~/app.env \
  -p 3000:3000 \
  building-management:latest
```

---

## 10. 常用管理指令

```bash
# 查看容器狀態
docker ps

# 查看即時 log
docker logs building-management -f

# 查看最後 100 行 log
docker logs building-management --tail 100

# 重啟容器
docker restart building-management

# 停止容器
docker stop building-management

# 進入容器 shell
docker exec -it building-management sh

# 查看 Nginx 狀態
sudo systemctl status nginx

# 重載 Nginx 設定
sudo systemctl reload nginx

# 查看 Nginx log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 架構總覽

```
用戶瀏覽器
    │
    │ HTTPS
    ▼
Cloudflare（SSL 終止 + CDN + DDoS 防護）
    │
    │ HTTP
    ▼
EC2 Nginx Port 80（反向代理）
    │
    │ localhost
    ▼
Docker Container Port 3000（Next.js App）
    │
    ├──▶ Firebase Firestore / Supabase（資料庫）
    ├──▶ Firebase Storage（圖片儲存）
    └──▶ AWS SES（郵件發送）
```
