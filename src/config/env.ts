/**
 * 環境變量配置
 * 統一管理所有環境變量的訪問
 */

/**
 * 獲取 API Base URL
 * @returns API 基礎地址
 */
export function getApiBaseUrl(): string {
    const isServer = import.meta.env.SSR
    const base = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080"
    return isServer ? base : ""
}

/**
 * 獲取完整 API 端點 URL
 * @param path API 路徑
 * @returns 完整的 URL
 */
export function getApiUrl(path: string): string {
    if (path.startsWith("http")) return path
    const base = getApiBaseUrl()
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
