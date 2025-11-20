const ACCESS_TOKEN_KEY = "accessToken"
const EXPIRES_AT_KEY = "expiresAt"

export function setToken(token: string, expiresIn: number) {
  if (typeof window === "undefined") return
  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
}

export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

export function isExpired() {
  if (typeof window === "undefined") return true
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY)
  return expiresAt ? Date.now() > Number(expiresAt) : true
}

export function getExpiresIn() {
  if (typeof window === "undefined") return 0
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY)
  return expiresAt ? Math.max(0, Number(expiresAt) - Date.now()) : 0
}