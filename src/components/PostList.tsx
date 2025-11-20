import React, { useEffect, useState, useRef, useCallback } from "react"
import { listPosts, likePost, deletePost, getMe } from "../lib/api"
import { refreshToken } from "../lib/refresh"
import { getToken } from "../lib/token"
import type { Post, User } from "../types"
import { PostItem } from "./PostItem"
import { PostSkeleton } from "./PostSkeleton"
import { Button } from "./ui/Button"
import { toast } from "sonner"

export const PostList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const observerTarget = useRef<HTMLDivElement>(null)

    const fetchUser = async () => {
        const res = await getMe()
        if (res.success && res.data) {
            setCurrentUser(res.data)
            // If we have user data (via cookie) but no access token (e.g. new tab/cleared storage),
            // try to refresh the token to ensure we can make authenticated requests.
            if (!getToken()) {
                try {
                    await refreshToken()
                    console.log("Access token restored via refresh")
                } catch (e) {
                    console.warn("Failed to restore access token:", e)
                }
            }
        }
    }

    const loadPosts = useCallback(async (cursor?: string) => {
        if (loading) return
        setLoading(true)
        const res = await listPosts({ limit: 10, cursor })
        if (res.success && res.data) {
            console.log("Fetched posts:", res.data!.items)
            setPosts((prev) => (cursor ? [...prev, ...res.data!.items] : res.data!.items))
            setNextCursor(res.data.next_cursor)
        }
        setLoading(false)
    }, [loading])

    useEffect(() => {
        fetchUser()
        loadPosts()
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextCursor && !loading) {
                    loadPosts(nextCursor)
                }
            },
            { threshold: 1.0 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [nextCursor, loading, loadPosts])

    const handleLike = async (id: number) => {
        const res = await likePost(id)
        if (res.success && res.data) {
            setPosts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, like_count: res.data!.count } : p))
            )
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return
        const res = await deletePost(id)
        if (res.success) {
            toast.success("刪除成功")
            setPosts((prev) => prev.filter((p) => p.id !== id))
        } else {
            toast.error("刪除失敗")
        }
    }

    const handleUpdate = () => {
        // Reload the first page to reflect changes (like pinning)
        // Ideally we should reload the current view, but reloading first page is simplest for now
        // to ensure pinned post moves to top.
        setPosts([]) // Clear to force refresh or just reload
        setNextCursor(null)
        loadPosts()
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostItem
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onLike={handleLike}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                    />
                ))}
                {loading && (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                )}
            </div>

            <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
                {!loading && !nextCursor && posts.length > 0 && (
                    <span className="text-gray-400 text-sm">No more posts</span>
                )}
            </div>
        </div>
    )
}

