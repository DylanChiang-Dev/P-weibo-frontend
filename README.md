# P-Weibo Frontend - 個人朋友圈

基於 Astro + React 的個人微博/朋友圈應用，採用 WeChat Moments 風格設計。

## 功能特性

- ✅ **單用戶系統**：個人博客模式，僅管理員可發布內容
- ✅ **遊客互動**：訪客可點贊、評論（無需註冊）
- ✅ **多媒體支持**：圖片（最多9張）、視頻上傳與展示
- ✅ **圖片燈箱**：點擊圖片全屏查看，支持左右切換
- ✅ **置頂功能**：管理員可置頂重要貼文
- ✅ **實時互動**：樂觀更新，即時反饋
- ✅ **響應式設計**：完美適配移動端和桌面端

## 技術棧

- **框架**: Astro 4.x (SSR)
- **UI 庫**: React 19
- **樣式**: Tailwind CSS
- **圖標**: Lucide React
- **通知**: Sonner

## 本地開發

### 環境要求

- Node.js 18+
- 後端 API 服務（需單獨部署）

### 安裝依賴

```bash
npm install
```

### 環境變量

創建 `.env` 文件（可選，用於本地開發）：

```env
PUBLIC_API_BASE=http://localhost:8080
```

> **注意**: 開發模式下，前端會通過 Vite Proxy 代理 `/api` 請求到後端，無需配置 CORS。

### 啟動開發服務器

```bash
npm run dev
```

訪問 `http://localhost:3000`

## 部署到 Cloudflare Pages

### 前置準備

1. **安裝 Cloudflare 適配器**

```bash
npm install @astrojs/cloudflare
```

2. **更新 `astro.config.mjs`**

```javascript
import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import react from "@astrojs/react"
import cloudflare from "@astrojs/cloudflare"

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [tailwind(), react()],
})
```

> **重要**: 移除 `vite.server.proxy` 配置（僅用於本地開發）

3. **配置環境變量**

在 Cloudflare Pages 項目設置中添加：

- `PUBLIC_API_BASE`: 您的後端 API 地址（例如 `https://api.yourdomain.com`）

### 部署步驟

#### 方法 1: 通過 Cloudflare Dashboard（推薦）

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** → **Create Application** → **Pages**
3. 連接您的 Git 倉庫（GitHub/GitLab）
4. 配置構建設置：
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 添加環境變量：`PUBLIC_API_BASE`
6. 點擊 **Save and Deploy**

#### 方法 2: 使用 Wrangler CLI

```bash
# 安裝 Wrangler
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 構建項目
npm run build

# 部署
wrangler pages deploy dist
```

### 部署後配置

1. **自定義域名**（可選）
   - 在 Cloudflare Pages 項目設置中添加自定義域名
   - DNS 會自動配置

2. **CORS 配置**
   - 確保後端 API 允許來自您的 Cloudflare Pages 域名的跨域請求
   - 在後端添加 CORS 頭：
     ```
     Access-Control-Allow-Origin: https://your-cf-pages-domain.pages.dev
     Access-Control-Allow-Credentials: true
     ```

## 項目結構

```
src/
├── components/          # React 組件
│   ├── PostItem.tsx    # 貼文卡片
│   ├── PostList.tsx    # 貼文列表
│   ├── NewPostForm.tsx # 發布表單
│   ├── Navbar.tsx      # 導航欄
│   └── ui/             # UI 基礎組件
├── lib/                # 工具函數
│   ├── api.ts          # API 請求封裝
│   ├── http.ts         # HTTP 客戶端
│   └── token.ts        # Token 管理
├── pages/              # Astro 頁面
│   ├── index.astro     # 首頁
│   ├── login.astro     # 登入頁
│   └── settings.astro  # 設置頁
└── types.ts            # TypeScript 類型定義
```

## API 依賴

本項目需要配合後端 API 使用，主要端點：

- `GET /api/posts` - 獲取貼文列表
- `POST /api/posts` - 創建貼文（需認證）
- `POST /api/posts/{id}/like` - 點贊
- `POST /api/posts/{id}/comments` - 評論
- `POST /api/posts/{id}/pin` - 置頂（需認證）
- `GET /api/me` - 獲取當前用戶
- `POST /api/login` - 登入

詳細 API 規範請參考後端文檔。

## 常見問題

### 1. 圖片/視頻無法顯示

- 檢查 `PUBLIC_API_BASE` 是否正確配置
- 確認後端 Nginx 正確配置了 `/uploads/` 靜態文件服務

### 2. 登入後無法發布貼文

- 檢查瀏覽器 Cookie 設置（需允許第三方 Cookie）
- 確認後端 CORS 配置包含 `Access-Control-Allow-Credentials: true`

### 3. 部署後 API 請求失敗

- 確認 Cloudflare Pages 環境變量 `PUBLIC_API_BASE` 已設置
- 檢查後端 CORS 白名單是否包含您的 CF Pages 域名

## 開發注意事項

- **SSR 模式**: 本項目使用 Astro SSR，部分代碼會在服務端執行
- **環境變量**: 以 `PUBLIC_` 開頭的變量會暴露到客戶端
- **代理配置**: 本地開發使用 Vite Proxy，生產環境直接請求後端

## License

MIT
