import { getToken } from "./token"
import { refreshToken } from "./refresh"

export async function apiRequest(path: string, opts: RequestInit = {}) {
  // On server (SSR), use full URL. On client, use relative path to leverage Vite proxy.
  const isServer = import.meta.env.SSR
  const base = isServer ? (import.meta.env.PUBLIC_API_BASE || "http://localhost:8080") : ""
  const url = path.startsWith("http") ? path : `${base}${path}`
  const headers = new Headers(opts.headers || {})
  const isProtected = shouldAttachAuth(path, opts)
  if (isProtected) {
    const token = getToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }
  const init: RequestInit = { credentials: 'include' as RequestCredentials, ...opts, headers }
  let res = await fetch(url, init)
  if (res.status === 401 && isProtected) {
    try {
      await refreshToken()
      const token2 = getToken()
      if (token2) headers.set("Authorization", `Bearer ${token2}`)
      res = await fetch(url, { ...opts, headers })
    } catch (e) {
      throw e
    }
  }
  const json = await safeJson(res)
  if (!res.ok) {
    const err = (json && json.error) || res.statusText || "Request failed"
    throw new Error(err)
  }
  return json
}

function shouldAttachAuth(path, opts) {
  const p = typeof path === "string" ? path : ""
  if (p.includes("/api/token/refresh") || p.includes("/api/logout")) return false
  return true
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}