/**
 * API Integration Tests
 * 
 * 這些測試需要真實的後端服務器運行在 http://localhost:8080
 * 使用命令運行: npm test -- src/test/api-integration.test.ts
 */

import { describe, it, expect } from "vitest"
import {
    login, logout, getMe,
    listPosts, createPost, deletePost, likePost, pinPost, unpinPost,
    createComment, getComments,
    updateProfile, getUserProfile
} from "@/lib/api"
import { getToken } from "@/lib/token"

// 測試數據
const TEST_USER = {
    email: "3331322@gmail.com",
    password: "ca123456789"
}

const TEST_POST = {
    content: "Integration Test Post " + Date.now()
}

describe("API Integration Flow", () => {
    let postId: number

    // 1. 認證測試
    it("should login successfully", async () => {
        const res = await login(TEST_USER.email, TEST_USER.password)
        if (!res.success) {
            console.error("Login failed:", res.error)
        }
        expect(res.success).toBe(true)
        expect(res.data?.access_token).toBeDefined()
        expect(getToken()).toBeDefined()
    })

    it("should get current user profile", async () => {
        const res = await getMe()
        expect(res.success).toBe(true)
        expect(res.data?.email).toBe(TEST_USER.email)
    })

    // 2. 貼文管理測試 (Admin Only)
    it("should create a new post", async () => {
        const res = await createPost(TEST_POST.content, [], [])
        if (!res.success) console.error("Create post failed:", res.error)
        expect(res.success).toBe(true)
        expect(res.data).toBeDefined()
        if (res.data) {
            // 根據 API 定義，這裡返回的是 { post_id: number }
            postId = res.data.post_id
            expect(postId).toBeDefined()
        }
    })

    it("should list posts and find the new post", async () => {
        // 嘗試不帶參數
        const res = await listPosts()
        if (!res.success) console.error("List posts failed:", res.error)
        expect(res.success).toBe(true)
        expect(res.data?.items.length).toBeGreaterThan(0)
        if (postId) {
            const found = res.data?.items.find(p => p.id === postId)
            expect(found).toBeDefined()
        }
    })

    it("should pin the post", async () => {
        if (!postId) return
        const res = await pinPost(postId)
        if (!res.success) console.error("Pin post failed:", res.error)
        expect(res.success).toBe(true)
    })

    it("should unpin the post", async () => {
        if (!postId) return
        const res = await unpinPost(postId)
        if (!res.success) console.error("Unpin post failed:", res.error)
        expect(res.success).toBe(true)
    })

    // 3. 互動測試
    it("should like the post", async () => {
        if (!postId) return
        const res = await likePost(postId)
        if (!res.success) console.error("Like post failed:", res.error)
        expect(res.success).toBe(true)
        expect(res.data?.count).toBeGreaterThanOrEqual(0)
    })

    it("should comment on the post", async () => {
        if (!postId) return
        const res = await createComment(postId, "Test Comment")
        if (!res.success) console.error("Comment failed:", res.error)
        expect(res.success).toBe(true)
    })

    it("should get comments", async () => {
        if (!postId) return
        const res = await getComments(postId)
        if (!res.success) console.error("Get comments failed:", res.error)
        expect(res.success).toBe(true)
        expect(res.data?.length).toBeGreaterThan(0)
        expect(res.data?.[0].content).toBe("Test Comment")
    })

    // 4. 用戶資料測試
    it("should get user profile by email", async () => {
        const res = await getUserProfile(TEST_USER.email)
        if (!res.success) console.error("Get user profile failed:", res.error)
        expect(res.success).toBe(true)
        expect(res.data?.email).toBe(TEST_USER.email)
    })

    it("should update profile (display name)", async () => {
        const newName = "Admin " + Date.now()
        const res = await updateProfile({ displayName: newName })
        if (!res.success) console.error("Update profile failed:", res.error)
        expect(res.success).toBe(true)
        expect(res.data?.displayName).toBe(newName)
    })

    // 5. 清理測試
    it("should delete the post", async () => {
        if (!postId) return
        const res = await deletePost(postId)
        if (!res.success) console.error("Delete post failed:", res.error)
        expect(res.success).toBe(true)
    })

    it("should logout", async () => {
        const res = await logout()
        if (!res.success) console.error("Logout failed:", res.error)
        expect(res.success).toBe(true)
        expect(getToken()).toBeNull()
    })
})
