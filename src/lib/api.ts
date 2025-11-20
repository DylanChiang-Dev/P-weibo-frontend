import { apiRequest } from "./http"
import { setToken, clearToken, getToken } from "./token"
import type { User, Post, AuthResponse, ApiResponse, PaginatedList, Comment } from "../types"

function extract<T>(json: any): T | undefined {
  if (json && typeof json === "object" && "data" in json) return json.data as T
  return json as T
}

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const isServer = import.meta.env.SSR
  const base = isServer ? (import.meta.env.PUBLIC_API_BASE || "http://localhost:8080") : ""
  const res = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const err = (json && json.error) || res.statusText || "Login failed"
    return { success: false, error: err }
  }
  const data = extract<AuthResponse>(json)
  if (data) {
    // 只存儲 access_token，refresh_token 由後端 Cookie 管理
    setToken(data.access_token, data.access_expires_in)
  }
  return { success: true, data }
}

export async function logout(): Promise<ApiResponse<void>> {
  const isServer = import.meta.env.SSR
  const base = isServer ? (import.meta.env.PUBLIC_API_BASE || "http://localhost:8080") : ""
  const res = await fetch(`${base}/api/logout`, { method: "POST", credentials: "include" })
  clearToken()
  return { success: res.ok }
}

function mapUser(data: any): User {
  if (!data) return data

  let avatar = data.avatar_path || data.avatar
  if (avatar && !avatar.startsWith("http")) {
    const base = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080"
    // Ensure we don't have double slashes if avatar starts with /
    if (avatar.startsWith("/")) avatar = avatar.substring(1)
    // If avatar doesn't start with uploads/, assume it needs it? 
    // Actually, based on error http://localhost:3000/uploads/avatars/..., 
    // the backend likely returns "uploads/avatars/..." or "/uploads/avatars/...".
    // So we just prepend base.
    avatar = `${base}/${avatar}`
  }

  return {
    ...data,
    displayName: data.display_name || data.displayName,
    avatar
  }
}

export async function getMe(): Promise<ApiResponse<User>> {
  try {
    const json = await apiRequest("/api/me")
    const data = extract<any>(json)
    return { success: true, data: data ? mapUser(data) : undefined }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

function mapImage(img: any): any {
  if (!img || !img.file_path) return img
  // 如果已經是 http 開頭，就不動
  if (img.file_path.startsWith("http")) return img

  // 處理絕對路徑，提取文件名
  const filename = img.file_path.split("/").pop()
  const base = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080"
  // 假設後端會在 /uploads/ 下服務這些文件
  return {
    ...img,
    file_path: `${base}/uploads/${filename}`
  }
}

function mapVideo(video: any): any {
  if (!video || !video.file_path) return video
  // 如果已經是 http 開頭，就不動
  if (video.file_path.startsWith("http")) return video

  // 處理絕對路徑，提取文件名
  const filename = video.file_path.split("/").pop()
  const base = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080"
  return {
    ...video,
    file_path: `${base}/uploads/${filename}`,
    thumbnail_path: video.thumbnail_path ? `${base}/uploads/${video.thumbnail_path.split("/").pop()}` : null
  }
}

export async function listPosts(params: { limit?: number; cursor?: string } = {}): Promise<ApiResponse<PaginatedList<Post>>> {
  const q = new URLSearchParams()
  if (params.limit) q.set("limit", String(params.limit))
  if (params.cursor) q.set("cursor", params.cursor)
  const path = `/api/posts?${q.toString()}`
  try {
    const json = await apiRequest(path)
    const list = extract<PaginatedList<Post>>(json)
    if (list && list.items) {
      list.items = list.items.map(post => ({
        ...post,
        author: mapUser(post.author),
        images: post.images ? post.images.map(mapImage) : [],
        videos: post.videos ? post.videos.map(mapVideo) : []
      }))
    }
    return { success: true, data: list }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function getPost(id: number): Promise<ApiResponse<Post>> {
  try {
    const json = await apiRequest(`/api/posts/${id}`)
    const post = extract<Post>(json)
    if (post) {
      post.author = mapUser(post.author)
      post.images = post.images ? post.images.map(mapImage) : []
      post.videos = post.videos ? post.videos.map(mapVideo) : []
    }
    return { success: true, data: post }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function deletePost(id: number): Promise<ApiResponse<void>> {
  try {
    await apiRequest(`/api/posts/${id}`, { method: "DELETE" })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function likePost(id: number): Promise<ApiResponse<{ count: number }>> {
  try {
    const json = await apiRequest(`/api/posts/${id}/like`, { method: "POST" })
    return { success: true, data: extract<{ count: number }>(json) }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function pinPost(id: number): Promise<ApiResponse<void>> {
  try {
    await apiRequest(`/api/posts/${id}/pin`, { method: "POST" })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function unpinPost(id: number): Promise<ApiResponse<void>> {
  try {
    await apiRequest(`/api/posts/${id}/unpin`, { method: "POST" })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function createComment(id: number, content: string, authorName?: string): Promise<ApiResponse<void>> {
  try {
    const body: any = { content }
    if (authorName) {
      body.authorName = authorName
    }
    await apiRequest(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function getComments(postId: number): Promise<ApiResponse<Comment[]>> {
  try {
    const json = await apiRequest(`/api/posts/${postId}/comments`)
    const comments = extract<Comment[]>(json) || []
    return { success: true, data: comments.map(c => ({ ...c, author: mapUser(c.author) })) }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function createPost(content: string, images: File[] = [], videos: File[] = []): Promise<ApiResponse<{ post_id: number }>> {
  const fd = new FormData()
  fd.append("content", content || "")
  for (const f of images) fd.append("images[]", f)
  for (const f of videos) fd.append("videos[]", f)

  try {
    const json = await apiRequest(`/api/posts`, { method: "POST", body: fd })
    return { success: true, data: extract<{ post_id: number }>(json) }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function getUserProfile(email: string): Promise<ApiResponse<User>> {
  try {
    // email is already decoded by the page, don't encode again
    const json = await apiRequest(`/api/users/${email}`)
    const data = extract<any>(json)
    return { success: true, data: data ? mapUser(data) : undefined }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function updateProfile(data: { displayName?: string; avatar?: File }): Promise<ApiResponse<User>> {
  const isServer = import.meta.env.SSR
  const base = isServer ? (import.meta.env.PUBLIC_API_BASE || "http://localhost:8080") : ""
  const formData = new FormData()
  if (data.displayName) formData.append("displayName", data.displayName)
  if (data.avatar) formData.append("avatar", data.avatar)

  const token = getToken()
  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  console.log("[updateProfile] Request:", {
    url: `${base}/api/users/me`,
    method: "POST",
    headers,
    displayName: data.displayName,
    hasAvatar: !!data.avatar,
    avatarName: data.avatar?.name,
    avatarSize: data.avatar?.size
  })

  try {
    const res = await fetch(`${base}/api/users/me`, {
      method: "POST",
      headers,
      body: formData,
    })

    console.log("[updateProfile] Response Status:", res.status, res.statusText)

    const json = await res.json().catch((e) => {
      console.error("[updateProfile] Failed to parse JSON:", e)
      return null
    })

    console.log("[updateProfile] Response Body:", json)

    if (!res.ok) {
      const errorMsg = json && json.error ? json.error : `更新失敗 (${res.status})`
      console.error("[updateProfile] Error:", errorMsg)
      return { success: false, error: errorMsg }
    }
    const userData = extract<any>(json)
    return { success: true, data: userData ? mapUser(userData) : undefined }
  } catch (e: any) {
    console.error("[updateProfile] Exception:", e)
    return { success: false, error: e.message || String(e) }
  }
}