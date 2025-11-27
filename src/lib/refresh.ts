import { setToken, clearToken } from "./token"

let refreshPromise = null

export async function refreshToken() {
  if (refreshPromise) return refreshPromise
  const p = doRefresh()
  refreshPromise = p
  try {
    const token = await p
    return token
  } finally {
    refreshPromise = null
  }
}

import { getApiUrl } from "@/config/env"
import { API_ENDPOINTS } from "@/config/api"

// ...

async function doRefresh() {
  const url = getApiUrl(API_ENDPOINTS.REFRESH_TOKEN)
  // 不再手動發送 refresh_token，讓瀏覽器自動通過 Cookie 發送
  const res = await fetch(url, {
    method: "POST",
    credentials: "include", // Cookie 會自動包含 refresh_token
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    clearToken()
    // 如果是 400/401/500 錯誤，說明 Refresh Token 無效或後端異常
    // 僅清除本地 Token，不強制跳轉，以免影響公開頁面的瀏覽體驗
    // 由各個頁面或組件自行決定是否需要登入
    throw new Error(json && json.error ? json.error : "Refresh failed")
  }
  // 從響應中提取新的 access_token
  const token = json && json.data?.access_token ? json.data.access_token : ""
  const exp = json && json.data?.access_expires_in ? json.data.access_expires_in : 0
  // 只存儲 access_token，refresh_token 由後端 Cookie 管理
  setToken(token, exp)
  return token
}