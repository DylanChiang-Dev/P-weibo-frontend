/**
 * 客戶端驗證函數
 */

import { UPLOAD_LIMITS } from "@/config/api"

/**
 * 驗證錯誤類型
 */
export interface ValidationError {
    field: string
    message: string
}

/**
 * 驗證圖片文件
 * @param file 圖片文件
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validateImageFile(file: File): string | null {
    // 檢查文件類型
    if (!UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return `不支持的圖片格式。請上傳 ${UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.join(", ")}`
    }

    // 檢查文件大小
    if (file.size > UPLOAD_LIMITS.MAX_IMAGE_SIZE) {
        const maxSizeMB = UPLOAD_LIMITS.MAX_IMAGE_SIZE / (1024 * 1024)
        return `圖片大小不能超過 ${maxSizeMB}MB`
    }

    return null
}

/**
 * 驗證視頻文件
 * @param file 視頻文件
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validateVideoFile(file: File): string | null {
    // 檢查文件類型
    if (!UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return `不支持的視頻格式。請上傳 ${UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES.join(", ")}`
    }

    // 檢查文件大小
    if (file.size > UPLOAD_LIMITS.MAX_VIDEO_SIZE) {
        const maxSizeMB = UPLOAD_LIMITS.MAX_VIDEO_SIZE / (1024 * 1024)
        return `視頻大小不能超過 ${maxSizeMB}MB`
    }

    return null
}

/**
 * 驗證圖片數量
 * @param images 圖片文件數組
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validateImageCount(images: File[]): string | null {
    if (images.length > UPLOAD_LIMITS.MAX_IMAGES) {
        return `最多只能上傳 ${UPLOAD_LIMITS.MAX_IMAGES} 張圖片`
    }
    return null
}

/**
 * 驗證視頻數量
 * @param videos 視頻文件數組
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validateVideoCount(videos: File[]): string | null {
    if (videos.length > UPLOAD_LIMITS.MAX_VIDEOS) {
        return `最多只能上傳 ${UPLOAD_LIMITS.MAX_VIDEOS} 個視頻`
    }
    return null
}

/**
 * 驗證電子郵件格式
 * @param email 電子郵件地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 驗證密碼強度
 * @param password 密碼
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validatePassword(password: string): string | null {
    if (password.length < 6) {
        return "密碼至少需要 6 個字符"
    }
    return null
}

/**
 * 驗證用戶名
 * @param displayName 用戶名
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validateDisplayName(displayName: string): string | null {
    if (!displayName || displayName.trim().length === 0) {
        return "用戶名不能為空"
    }
    if (displayName.length > 50) {
        return "用戶名不能超過 50 個字符"
    }
    return null
}

/**
 * 驗證貼文內容
 * @param content 貼文內容
 * @returns 驗證錯誤，如果沒有錯誤則返回 null
 */
export function validatePostContent(content: string): string | null {
    if (content.length > 5000) {
        return "內容不能超過 5000 個字符"
    }
    return null
}
