import { apiRequest } from "./http"
import { setToken, clearToken, getToken } from "./token"
import { getApiUrl } from "@/config/env"
import { API_ENDPOINTS } from "@/config/api"
import { resolveMediaUrl } from "@/lib/utils"
import type { User, Post, AuthResponse, ApiResponse, PaginatedList, Comment } from "@/types"

function extract<T>(json: any): T | undefined {
  if (json && typeof json === "object" && "data" in json) return json.data as T
  return json as T
}

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const url = getApiUrl(API_ENDPOINTS.LOGIN)
  const res = await fetch(url, {
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
  const url = getApiUrl(API_ENDPOINTS.LOGOUT)
  const res = await fetch(url, { method: "POST", credentials: "include" })
  clearToken()
  return { success: res.ok }
}

export async function register(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const url = getApiUrl("/api/register")
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const err = (json && json.error) || res.statusText || "Registration failed"
    return { success: false, error: err }
  }
  const data = extract<AuthResponse>(json)
  if (data) {
    setToken(data.access_token, data.access_expires_in)
  }
  return { success: true, data }
}

function mapUser(data: any): User {
  if (!data) return data

  const avatar = resolveMediaUrl(data.avatar_path || data.avatar)

  return {
    ...data,
    displayName: data.display_name || data.displayName,
    avatar
  }
}

export async function getMe(): Promise<ApiResponse<User>> {
  try {
    const json = await apiRequest(API_ENDPOINTS.ME)
    const data = extract<any>(json)
    return { success: true, data: data ? mapUser(data) : undefined }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

function mapImage(img: any): any {
  if (!img || !img.file_path) return img
  return {
    ...img,
    file_path: resolveMediaUrl(img.file_path)
  }
}

function mapVideo(video: any): any {
  if (!video || !video.file_path) return video
  return {
    ...video,
    file_path: resolveMediaUrl(video.file_path),
    thumbnail_path: resolveMediaUrl(video.thumbnail_path)
  }
}

export async function listPosts(params: { limit?: number; cursor?: string } = {}): Promise<ApiResponse<PaginatedList<Post>>> {
  const q = new URLSearchParams()
  if (params.limit) q.set("limit", String(params.limit))
  if (params.cursor) q.set("cursor", params.cursor)
  const path = `${API_ENDPOINTS.POSTS}?${q.toString()}`
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
    const json = await apiRequest(API_ENDPOINTS.POST(id))
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
    await apiRequest(API_ENDPOINTS.POST(id), { method: "DELETE" })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function likePost(id: number): Promise<ApiResponse<{ count: number }>> {
  try {
    const json = await apiRequest(API_ENDPOINTS.POST_LIKE(id), { method: "POST" })
    return { success: true, data: extract<{ count: number }>(json) }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function pinPost(id: number): Promise<ApiResponse<void>> {
  try {
    await apiRequest(API_ENDPOINTS.POST_PIN(id), { method: "POST" })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function unpinPost(id: number): Promise<ApiResponse<void>> {
  try {
    await apiRequest(API_ENDPOINTS.POST_UNPIN(id), { method: "POST" })
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
    await apiRequest(API_ENDPOINTS.POST_COMMENTS(id), {
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
    const json = await apiRequest(API_ENDPOINTS.POST_COMMENTS(postId))
    const comments = extract<Comment[]>(json) || []
    return { success: true, data: comments.map(c => ({ ...c, author: mapUser(c.author) })) }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function deleteComment(id: number): Promise<ApiResponse<void>> {
  try {
    await apiRequest(API_ENDPOINTS.DELETE_COMMENT(id), { method: "DELETE" })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function createPost(content: string, images: File[] = [], videos: File[] = [], visibility: 'public' | 'private' = 'public'): Promise<ApiResponse<{ post_id: number }>> {
  const fd = new FormData()
  fd.append("content", content || "")
  fd.append("visibility", visibility)
  for (const f of images) fd.append("images[]", f)
  for (const f of videos) fd.append("videos[]", f)

  try {
    const json = await apiRequest(API_ENDPOINTS.POSTS, { method: "POST", body: fd })
    return { success: true, data: extract<{ post_id: number }>(json) }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function getUserProfile(email: string): Promise<ApiResponse<User>> {
  try {
    // email is already decoded by the page, don't encode again
    const json = await apiRequest(API_ENDPOINTS.USER(email))
    const data = extract<any>(json)
    return { success: true, data: data ? mapUser(data) : undefined }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function updateProfile(data: { displayName?: string; avatar?: File }): Promise<ApiResponse<User>> {
  const url = getApiUrl(API_ENDPOINTS.UPDATE_PROFILE)
  const formData = new FormData()
  if (data.displayName) formData.append("displayName", data.displayName)
  if (data.avatar) formData.append("avatar", data.avatar)

  const token = getToken()
  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      const errorMsg = json && json.error ? json.error : `更新失敗 (${res.status})`
      return { success: false, error: errorMsg }
    }
    const userData = extract<any>(json)
    return { success: true, data: userData ? mapUser(userData) : undefined }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function updatePost(
  id: number,
  data: {
    content?: string
    created_at?: string
    visibility?: 'public' | 'private'
    delete_images?: number[]
    delete_videos?: number[]
    images?: File[]
    videos?: File[]
  }
): Promise<ApiResponse<Post>> {
  try {
    // Check if there are any media operations
    const hasMediaOps =
      (data.delete_images && data.delete_images.length > 0) ||
      (data.delete_videos && data.delete_videos.length > 0) ||
      (data.images && data.images.length > 0) ||
      (data.videos && data.videos.length > 0)

    if (hasMediaOps) {
      // Use POST /api/posts/{id}/media for file uploads/media changes
      const formData = new FormData()

      // Add text fields
      if (data.content !== undefined) formData.append('content', data.content)
      if (data.created_at) formData.append('created_at', data.created_at)
      if (data.visibility) formData.append('visibility', data.visibility)

      // Add delete operations
      data.delete_images?.forEach(id => formData.append('delete_images[]', String(id)))
      data.delete_videos?.forEach(id => formData.append('delete_videos[]', String(id)))

      // Add new media files
      data.images?.forEach(file => formData.append('images[]', file))
      data.videos?.forEach(file => formData.append('videos[]', file))

      const json = await apiRequest(API_ENDPOINTS.POST_MEDIA(id), {
        method: "POST",
        body: formData,
      })

      const post = extract<Post>(json)
      if (post) {
        post.author = mapUser(post.author)
        post.images = post.images ? post.images.map(mapImage) : []
        post.videos = post.videos ? post.videos.map(mapVideo) : []
      }
      return { success: true, data: post }
    } else {
      // Use PATCH /api/posts/{id} for text-only updates
      const json = await apiRequest(API_ENDPOINTS.POST(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data.content,
          created_at: data.created_at,
          visibility: data.visibility
        }),
      })
      const post = extract<Post>(json)
      if (post) {
        post.author = mapUser(post.author)
        post.images = post.images ? post.images.map(mapImage) : []
        post.videos = post.videos ? post.videos.map(mapVideo) : []
      }
      return { success: true, data: post }
    }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}