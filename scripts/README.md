# WordPress 遷移工具使用說明

## 快速開始

### 1. 安裝依賴

```bash
cd scripts
npm install
```

### 2. 獲取管理員 Token

登錄 P-Weibo，打開瀏覽器開發者工具（F12），在 Console 輸入：

```javascript
localStorage.getItem('access_token')
```

複製得到的 token。

### 3. 運行遷移

**基本用法**：
```bash
node migrate-wordpress.js \
  --wp-url=https://your-wordpress-site.com \
  --token=YOUR_ADMIN_TOKEN
```

**完整參數**：
```bash
node migrate-wordpress.js \
  --wp-url=https://your-wordpress-site.com \
  --api-url=http://localhost:8080/api \
  --email=admin@example.com \
  --password=your_password \
  --batch=5 \
  --delay=1000 \
  --dry-run
```

## 遠程遷移（部署到公網）

如果您的 P-Weibo 已經部署到公網（例如 `https://p-weibo.com`），您可以在本地運行此腳本，只需修改 `--api-url` 和登錄憑證：

```bash
node migrate-wordpress.js \
  --wp-url=https://x.3331322.xyz \
  --api-url=https://p-weibo.com/api \
  --email=your_admin_email@example.com \
  --password=your_admin_password
```

**注意**：
1. 確保您的網絡可以訪問公網 API。
2. 由於涉及圖片上傳，遠程遷移速度可能受限於您的上傳帶寬。
3. 建議使用 `--batch=1` 或 `--delay=2000` 來避免請求超時。

## 參數說明

| 參數 | 說明 | 默認值 |
|------|------|--------|
| `--wp-url` | WordPress 網站 URL | 必填 |
| `--token` | P-Weibo 管理員 token | 必填 |
| `--api-url` | P-Weibo API 地址 | `http://localhost:8080/api` |
| `--batch` | 批次處理大小 | `5` |
| `--delay` | 每篇貼文間延遲（毫秒） | `1000` |
| `--skip-media` | 跳過媒體下載 | `false` |
| `--dry-run` | 測試模式（不實際上傳） | `false` |

## 使用示例

### 測試運行（不實際上傳）

```bash
node migrate-wordpress.js \
  --wp-url=https://myblog.com \
  --token=abc123 \
  --dry-run
```

### 跳過媒體文件

```bash
node migrate-wordpress.js \
  --wp-url=https://myblog.com \
  --token=abc123 \
  --skip-media
```

### 慢速遷移（避免過載）

```bash
node migrate-wordpress.js \
  --wp-url=https://myblog.com \
  --token=abc123 \
  --batch=3 \
  --delay=2000
```

## 功能特性

✅ 自動獲取所有 WordPress 貼文  
✅ 保留原始發布時間  
✅ 下載並上傳特色圖片  
✅ 提取內容中的圖片（最多 9 張）  
✅ 清理 HTML 標籤  
✅ 批次處理避免過載  
✅ 詳細的進度和統計信息  
✅ 錯誤處理和重試  

## 注意事項

⚠️ **測試先行**：首次運行建議使用 `--dry-run` 測試  
⚠️ **備份數據**：遷移前備份 P-Weibo 數據庫  
⚠️ **網絡穩定**：確保網絡連接穩定  
⚠️ **媒體文件**：大量媒體會佔用存儲空間  
⚠️ **速率限制**：適當調整 batch 和 delay 參數  

## 故障排除

### 401 Unauthorized
Token 無效或過期，重新獲取 token。

### 429 Too Many Requests
降低 batch 大小或增加 delay 時間。

### 媒體下載失敗
檢查 WordPress 媒體庫權限或使用 `--skip-media`。

### 內容為空
WordPress API 可能需要認證，檢查 WordPress 設置。

## 進階：自定義遷移

編輯 `migrate-wordpress.js`，修改 `migratePost` 函數來自定義遷移邏輯。

例如，只遷移特定分類的貼文：

```javascript
const wpPosts = await fetchWordPressPosts();
const filteredPosts = wpPosts.filter(post => 
  post.categories.includes(YOUR_CATEGORY_ID)
);
```
