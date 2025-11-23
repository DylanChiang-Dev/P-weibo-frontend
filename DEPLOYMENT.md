# Cloudflare Pages 部署教程

本教程将指导你如何将 P-Weibo 前端部署到 Cloudflare Pages。

## 📋 前置需求

- ✅ 已有 [Cloudflare](https://dash.cloudflare.com/) 账号
- ✅ 代码已推送到 GitHub 仓库
- ✅ 后端 API 已部署并可访问

---

## 🚀 快速部署

### 步骤 1：连接到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单选择 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 授权 Cloudflare 访问你的 GitHub 账号
5. 选择你的仓库：`DylanChiang-Dev/P-weibo-frontend`

### 步骤 2：配置构建设置

在 **Set up builds and deployments** 页面填写以下配置：

| 配置项 | 值 |
|--------|-----|
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (默认) |
| **Node.js version** | `18` 或更高 |

### 步骤 3：设置环境变量

在 **Environment variables** 部分添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PUBLIC_API_BASE` | `https://your-api-domain.com/api` | 后端 API 地址 |
| `NODE_VERSION` | `18` | Node.js 版本（可选） |

> [!IMPORTANT]
> - `PUBLIC_API_BASE` 必须是完整的 API URL，包括 `/api` 后缀
> - 例如：`https://api.example.com/api` 或 `https://example.com/api`
> - 请确保后端 API 已部署并可正常访问

### 步骤 4：部署

1. 点击 **Save and Deploy**
2. Cloudflare Pages 将自动开始构建和部署
3. 构建完成后，你会获得一个 `*.pages.dev` 域名

---

## 🔧 高级配置

### 自定义域名

部署成功后，你可以配置自定义域名：

1. 在 Cloudflare Pages 项目中，进入 **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入你的域名（例如：`weibo.example.com`）
4. 按照提示配置 DNS 记录：
   - **CNAME 记录**：`weibo` → `your-project.pages.dev`
5. 等待 DNS 生效（通常 5-10 分钟）

### 环境变量管理

你可以为不同的环境设置不同的变量：

1. 进入 **Settings** → **Environment variables**
2. 选择环境：
   - **Production**：生产环境（`main` 分支）
   - **Preview**：预览环境（其他分支）
3. 添加或修改环境变量

**常用环境变量：**

```bash
# 生产环境
PUBLIC_API_BASE=https://api.production.com/api

# 预览环境
PUBLIC_API_BASE=https://api.staging.com/api
```

### 构建配置文件

你也可以在项目根目录创建 `wrangler.toml` 文件来配置部署：

```toml
name = "p-weibo-frontend"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"

[build.upload]
format = "service-worker"

[[env.production]]
vars = { PUBLIC_API_BASE = "https://api.production.com/api" }
```

---

## 🔄 自动部署

### Git 集成

Cloudflare Pages 已自动配置 Git 集成：

- ✅ **推送到 `main` 分支** → 自动部署到生产环境
- ✅ **推送到其他分支** → 自动创建预览部署
- ✅ **每个 PR** → 自动创建预览链接

### 部署钩子

你可以设置 **Deploy Hooks** 来手动触发部署：

1. 进入 **Settings** → **Builds & deployments** → **Deploy hooks**
2. 创建新的 Deploy Hook
3. 使用生成的 URL 触发部署：

```bash
curl -X POST https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID
```

---

## 🐛 常见问题

### 1. 构建失败：`Command not found: astro`

**原因**：Node 版本过低或依赖未安装

**解决方案**：
- 在环境变量中设置 `NODE_VERSION=18`
- 确保 `package.json` 中有正确的依赖

### 2. 运行时错误：`Failed to fetch`

**原因**：`PUBLIC_API_BASE` 配置错误或后端 API 不可访问

**解决方案**：
1. 检查环境变量 `PUBLIC_API_BASE` 是否正确
2. 确保后端 API 已部署并可访问
3. 检查 CORS 配置（后端需要允许你的域名）

### 3. 图片或静态资源 404

**原因**：路径配置问题

**解决方案**：
1. 确保 `astro.config.mjs` 中的 `base` 配置正确
2. 静态资源应放在 `public/` 目录

### 4. 部署成功但页面空白

**原因**：可能是 SSR 适配器问题

**解决方案**：
1. 检查浏览器控制台错误
2. 查看 Cloudflare Pages 的 Functions 日志
3. 确保 `@astrojs/cloudflare` 适配器已正确配置

### 5. 环境变量不生效

**原因**：环境变量设置在构建之后

**解决方案**：
1. 在 Cloudflare Pages 设置环境变量后，需要**重新部署**
2. 进入 **Deployments** → 找到最新部署 → **Retry deployment**

---

## 📊 监控和日志

### 访问日志

1. 进入你的 Cloudflare Pages 项目
2. 点击 **Deployments** 查看部署历史
3. 点击具体的部署查看构建日志

### 实时分析

Cloudflare Pages 提供免费的 **Web Analytics**：

1. 在项目设置中启用 **Web Analytics**
2. 查看访问量、页面性能等数据

### Functions 日志

对于 SSR 页面，你可以查看 Functions 日志：

1. 进入 **Functions** → **Logs**
2. 查看实时请求日志和错误信息

---

## 🎯 性能优化

### 1. 启用缓存

Cloudflare 自动缓存静态资源，你可以配置缓存策略：

在 `public/_headers` 文件中添加：

```
/*
  Cache-Control: public, max-age=3600

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable
```

### 2. 图片优化

使用 Cloudflare Images 或其他 CDN：

```astro
---
const imageUrl = `https://imagedelivery.net/your-account-id/${imageHash}/public`;
---
<img src={imageUrl} alt="Optimized image" />
```

### 3. 压缩

Cloudflare 自动启用 Brotli/Gzip 压缩，无需额外配置。

---

## 🔐 安全配置

### 设置 HTTPS

Cloudflare Pages 默认强制 HTTPS，无需额外配置。

### CORS 配置

如果需要配置 CORS 头，在 `public/_headers` 添加：

```
/api/*
  Access-Control-Allow-Origin: https://your-domain.com
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
```

> [!WARNING]
> 实际的 CORS 配置应该在**后端 API** 中完成，而不是在前端。

---

## 📚 相关资源

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Astro 部署指南](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

---

## 💡 提示

1. **预览部署**：每个推送到非 `main` 分支的提交都会创建预览部署，方便测试
2. **回滚**：可以在 Deployments 页面快速回滚到之前的版本
3. **自定义构建**：可以使用 `wrangler.toml` 进行更高级的配置
4. **免费额度**：Cloudflare Pages 提供非常慷慨的免费额度，足够个人项目使用

---

## 🆘 获取帮助

如果遇到问题：

1. 查看 [Cloudflare Community](https://community.cloudflare.com/)
2. 检查 [Astro Discord](https://astro.build/chat)
3. 查看项目的 [GitHub Issues](https://github.com/DylanChiang-Dev/P-weibo-frontend/issues)

---

**部署愉快！** 🎉
