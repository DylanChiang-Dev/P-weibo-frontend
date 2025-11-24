import React, { useEffect, useRef } from "react"
import { usePostsInfinite, useLikePost, useDeletePost, usePinPost, useUnpinPost } from "@/hooks/usePostsQuery"
import { useCurrentUser } from "@/hooks/useUserQuery"
import { PostItem } from "./PostItem"
import { PostSkeleton } from "./PostSkeleton"
import { toast } from "sonner"
import { QueryProvider } from "./QueryProvider"

const PostListContent: React.FC = () => {
    const observerTarget = useRef<HTMLDivElement>(null)

    // Use React Query hooks
    const { data: currentUser } = useCurrentUser()
    const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading } =
        usePostsInfinite(10)
    const likeMutation = useLikePost()
    const deleteMutation = useDeletePost()
    const pinMutation = usePinPost()
    const unpinMutation = useUnpinPost()

    // Flatten pages into posts array
    const posts = data?.pages.flatMap((page) => page.items) ?? []

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 1.0 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleLike = (id: number) => {
        likeMutation.mutate(id)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return

        try {
            await deleteMutation.mutateAsync(id)
            toast.success("刪除成功")
        } catch (error) {
            toast.error("刪除失敗")
        }
    }

    const handlePin = async (id: number, isPinned: boolean) => {
        if (!confirm(isPinned ? "取消置頂?" : "置頂此貼文?")) return

        try {
            if (isPinned) {
                await unpinMutation.mutateAsync(id)
                toast.success("已取消置頂")
            } else {
                await pinMutation.mutateAsync(id)
                toast.success("已置頂")
            }
        } catch (error) {
            toast.error("操作失敗")
        }
    }

    const handleUpdate = () => {
        // React Query will automatically refetch when mutations succeed
        // No manual refetching needed!
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            </div>
        )
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
                        onPin={handlePin}
                        onUpdate={handleUpdate}
                    />
                ))}
                {isFetchingNextPage && (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                )}
            </div>

            <div ref={observerTarget} className="h-10 flex items-center justify-center mt-4">
                {!isFetching && !hasNextPage && posts.length > 0 && (
                    <span className="text-gray-400 text-sm">No more posts</span>
                )}
            </div>
        </div>
    )
}

export const PostList: React.FC = () => {
    return (
        <QueryProvider>
            <PostListContent />
        </QueryProvider>
    )
}
