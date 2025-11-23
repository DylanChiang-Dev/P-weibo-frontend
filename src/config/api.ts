/**
 * API 端點配置
 */

export const API_ENDPOINTS = {
    // 認證相關
    LOGIN: "/api/login",
    LOGOUT: "/api/logout",
    REFRESH_TOKEN: "/api/token/refresh",
    ME: "/api/me",

    // 貼文相關
    POSTS: "/api/posts",
    POST: (id: number) => `/api/posts/${id}`,
    POST_LIKE: (id: number) => `/api/posts/${id}/like`,
    POST_PIN: (id: number) => `/api/posts/${id}/pin`,
    POST_UNPIN: (id: number) => `/api/posts/${id}/unpin`,
    POST_COMMENTS: (id: number) => `/api/posts/${id}/comments`,

    // 用戶相關
    USER: (email: string) => `/api/users/${email}`,
    UPDATE_PROFILE: "/api/users/me",
} as const

/**
 * 文件上傳限制
 */
export const UPLOAD_LIMITS = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_IMAGES: 9,
    MAX_VIDEOS: 1,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],
} as const

/**
 * 分頁配置
 */
export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
} as const
