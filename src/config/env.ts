/**
 * 環境變量配置
 * 統一管理所有環境變量的訪問
 */

/**
 * 獲取 API Base URL
 * @returns API 基礎地址
 */
export function getApiBaseUrl(): string {
    // Check if we're running on the server (SSR) vs in the browser
    const isServer = typeof window === 'undefined'

    if (import.meta.env.DEV) {
        // In SSR, we need a full URL because Node.js fetch can't use relative URLs
        if (isServer) {
            // Use the production API or fallback to localhost
            return import.meta.env.PUBLIC_API_BASE || "http://localhost:4321"
        }
        // In browser, return empty string to use Vite proxy (avoids CORS)
        return ""
    }

    // In production, always use the environment variable
    return import.meta.env.PUBLIC_API_BASE || ""
}

/**
 * 獲取完整 API 端點 URL
 * @param path API 路徑
 * @returns 完整的 URL
 */
export function getApiUrl(path: string): string {
    if (path.startsWith("http")) return path
    let base = getApiBaseUrl()

    // Remove trailing slash from base
    if (base.endsWith("/")) {
        base = base.slice(0, -1)
    }

    // Handle double /api case
    // If base ends with /api and path starts with /api, remove one /api from base
    if (base.endsWith("/api") && path.startsWith("/api")) {
        base = base.slice(0, -4)
    }

    return `${base}${path}`
}

/**
 * 檢查是否為服務端環境
 */
export function isServer(): boolean {
    return import.meta.env.SSR
}

/**
 * 檢查是否為開發環境
 */
export function isDev(): boolean {
    return import.meta.env.DEV
}

/**
 * 檢查是否為生產環境
 */
export function isProd(): boolean {
    return import.meta.env.PROD
}
