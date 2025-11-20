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

async function doRefresh() {
  const base = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080"
  // 不再手動發送 refresh_token，讓瀏覽器自動通過 Cookie 發送
  const res = await fetch(`${base}/api/token/refresh`, {
    method: "POST",
    credentials: "include", // Cookie 會自動包含 refresh_token
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    clearToken()
    throw new Error(json && json.error ? json.error : "Refresh failed")
  }
  // 從響應中提取新的 access_token
  const token = json && json.data?.access_token ? json.data.access_token : ""
  const exp = json && json.data?.access_expires_in ? json.data.access_expires_in : 0
  // 只存儲 access_token，refresh_token 由後端 Cookie 管理
  setToken(token, exp)
  return token
}