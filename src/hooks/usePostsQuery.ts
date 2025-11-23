/**
 * Custom React Query hooks for Posts
 */

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { listPosts, getPost, likePost, createPost, deletePost, pinPost, unpinPost, getComments, createComment } from "@/lib/api"
import type { Post } from "@/types"

// Query Keys
export const postKeys = {
    all: ["posts"] as const,
    lists: () => [...postKeys.all, "list"] as const,
    list: (limit?: number) => [...postKeys.lists(), { limit }] as const,
    details: () => [...postKeys.all, "detail"] as const,
    detail: (id: number) => [...postKeys.details(), id] as const,
    comments: (postId: number) => [...postKeys.detail(postId), "comments"] as const,
}

/**
 * Hook for infinite scrolling posts list
 */
export function usePostsInfinite(limit: number = 10) {
    return useInfiniteQuery({
        queryKey: postKeys.list(limit),
        queryFn: async ({ pageParam }) => {
            const result = await listPosts({ limit, cursor: pageParam })
            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to fetch posts")
            }
            return result.data
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    })
}

/**
 * Hook for single post
 */
export function usePost(id: number) {
    return useQuery({
        queryKey: postKeys.detail(id),
        queryFn: async () => {
            const result = await getPost(id)
            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to fetch post")
            }
            return result.data
        },
    })
}

/**
 * Hook for post comments
 */
export function useComments(postId: number) {
    return useQuery({
        queryKey: postKeys.comments(postId),
        queryFn: async () => {
            const result = await getComments(postId)
            if (!result.success) {
                throw new Error(result.error || "Failed to fetch comments")
            }
            return result.data || []
        },
    })
}

/**
 * Hook for liking a post
 */
export function useLikePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: number) => {
            const result = await likePost(postId)
            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to like post")
            }
            return { postId, count: result.data.count }
        },
        onMutate: async (postId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: postKeys.lists() })

            // Optimistically update
            queryClient.setQueriesData<{ pages: { items: Post[] }[] }>({ queryKey: postKeys.lists() }, (old) => {
                if (!old) return old
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        items: page.items.map((post) =>
                            post.id === postId ? { ...post, like_count: post.like_count + 1 } : post
                        ),
                    })),
                }
            })
        },
        onSuccess: ({ postId, count }) => {
            // Update with server data
            queryClient.setQueriesData<{ pages: { items: Post[] }[] }>({ queryKey: postKeys.lists() }, (old) => {
                if (!old) return old
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        items: page.items.map((post) => (post.id === postId ? { ...post, like_count: count } : post)),
                    })),
                }
            })
        },
    })
}

/**
 * Hook for creating a post
 */
export function useCreatePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ content, images, videos }: { content: string; images: File[]; videos: File[] }) => {
            const result = await createPost(content, images, videos)
            if (!result.success) {
                throw new Error(result.error || "Failed to create post")
            }
            return result.data
        },
        onSuccess: () => {
            // Invalidate and refetch posts
            queryClient.invalidateQueries({ queryKey: postKeys.lists() })
        },
    })
}

/**
 * Hook for deleting a post
 */
export function useDeletePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: number) => {
            const result = await deletePost(postId)
            if (!result.success) {
                throw new Error(result.error || "Failed to delete post")
            }
            return postId
        },
        onSuccess: () => {
            // Invalidate and refetch posts
            queryClient.invalidateQueries({ queryKey: postKeys.lists() })
        },
    })
}

/**
 * Hook for pinning a post
 */
export function usePinPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: number) => {
            const result = await pinPost(postId)
            if (!result.success) {
                throw new Error(result.error || "Failed to pin post")
            }
            return postId
        },
        onSuccess: () => {
            // Invalidate and refetch posts
            queryClient.invalidateQueries({ queryKey: postKeys.lists() })
        },
    })
}

/**
 * Hook for unpinning a post
 */
export function useUnpinPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: number) => {
            const result = await unpinPost(postId)
            if (!result.success) {
                throw new Error(result.error || "Failed to unpin post")
            }
            return postId
        },
        onSuccess: () => {
            // Invalidate and refetch posts
            queryClient.invalidateQueries({ queryKey: postKeys.lists() })
        },
    })
}

/**
 * Hook for adding a comment
 */
export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, content, authorName }: { postId: number; content: string; authorName?: string }) => {
            const result = await createComment(postId, content, authorName)
            if (!result.success) {
                throw new Error(result.error || "Failed to create comment")
            }
            return postId
        },
        onSuccess: (postId) => {
            // Invalidate comments for this post
            queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) })
            // Also invalidate posts list to update comment count
            queryClient.invalidateQueries({ queryKey: postKeys.lists() })
        },
    })
}
