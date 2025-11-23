/**
 * 通用工具函數
 */

/**
 * 處理媒體文件路徑，將相對路徑轉換為絕對 URL
 * @param filePath 文件路徑
 * @returns 完整的 URL
 */
export function resolveMediaUrl(filePath: string | undefined | null): string | null {
    if (!filePath) return null
    if (filePath.startsWith("http")) return filePath

    let base = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080"

    // Static assets are served from root, not /api
    if (base.endsWith("/api")) {
        base = base.slice(0, -4)
    }

    // 處理後端返回的絕對服務器路徑
    let cleanPath = filePath

    // Handle /public/uploads/ (e.g. /www/wwwroot/.../public/uploads/xxx.webp)
    if (cleanPath.includes("/public/uploads/")) {
        cleanPath = "uploads/" + cleanPath.split("/public/uploads/")[1]
    }
    // Handle /storage/uploads/ (Laravel default)
    else if (cleanPath.includes("/storage/uploads/")) {
        cleanPath = "uploads/" + cleanPath.split("/storage/uploads/")[1]
    }
    else if (cleanPath.startsWith("/")) {
        cleanPath = cleanPath.slice(1)
    }

    const cleanBase = base.endsWith("/") ? base : `${base}/`
    return `${cleanBase}${cleanPath}`
}

/**
 * 格式化時間為相對時間
 * @param dateString ISO 8601 時間字符串
 * @returns 相對時間字符串（例如：3 小時前）
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return "剛剛"
    if (minutes < 60) return `${minutes} 分鐘前`
    if (hours < 24) return `${hours} 小時前`
    if (days < 7) return `${days} 天前`
    if (weeks < 4) return `${weeks} 週前`
    if (months < 12) return `${months} 個月前`
    return `${years} 年前`
}

/**
 * 格式化完整日期時間
 * @param dateString ISO 8601 時間字符串
 * @returns 格式化的日期字符串
 */
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

/**
 * 類名合併工具
 * @param classes 類名數組
 * @returns 合併後的類名字符串
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ")
}

/**
 * 延迟函數
 * @param ms 延遲時間（毫秒）
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 防抖函數
 * @param func 要防抖的函數
 * @param wait 等待時間（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * 節流函數
 * @param func 要節流的函數
 * @param limit 時間限制（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return function (...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

/**
 * 複製文本到剪貼板
 * @param text 要複製的文本
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

/**
 * 格式化文件大小
 * @param bytes 字節數
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
