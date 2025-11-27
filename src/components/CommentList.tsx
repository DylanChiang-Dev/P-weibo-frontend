import React, { useState, useEffect } from "react"
import { createComment, deleteComment } from "../lib/api"
import { Button } from "./ui/Button"
import { Card, CardContent } from "./ui/Card"
import { User as UserIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/useUserQuery"

// Since the API doesn't explicitly return comments in a list endpoint,
// we assume they might be part of the Post object or we need to handle them locally for now.
// However, based on typical patterns, we'll design this to accept a list of comments if available,
// or just handle the creation part and show optimistically.

// Update: The user provided API doc doesn't show comments in Post object.
// But typically a "Get Post" endpoint would return them.
// We will define a Comment interface here for now.

interface Comment {
    id: number
    content: string
    created_at: string
    author: {
        id: number
        email: string
        displayName?: string
        avatar?: string
    }
}

interface CommentListProps {
    postId: number
    initialComments?: Comment[] // Optional for now
    loading?: boolean
}

export const CommentList: React.FC<CommentListProps> = ({ postId, initialComments = [], loading = false }) => {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
    const { data: currentUser } = useCurrentUser()

    // Update comments when initialComments changes
    useEffect(() => {
        setComments(initialComments)
    }, [initialComments])

    // Debug logging
    useEffect(() => {
        if (currentUser) {
            console.log("Current User:", currentUser)
            console.log("User Role:", currentUser.role)
            console.log("Is Admin?", currentUser.role === 'admin')
        }
    }, [currentUser])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || submitting) return
        setSubmitting(true)

        const res = await createComment(postId, newComment)
        if (res.success) {
            // Since the API doesn't return the created comment object in the doc example (just success: true),
            // we might need to fetch the post again or just fake it if we had the user info.
            // For now, let's reload the page to see the new comment if the backend supports it.
            toast.success("評論成功")
            window.location.reload()
        } else {
            toast.error("評論失敗")
        }
        setSubmitting(false)
    }

    const handleDelete = async (commentId: number) => {
        const res = await deleteComment(commentId)
        if (res.success) {
            toast.success("刪除成功")
            setComments(prev => prev.filter(c => c.id !== commentId))
            setDeleteConfirmId(null)
        } else {
            // 根据错误类型显示不同的提示
            const errorMsg = res.error || "未知錯誤"

            if (errorMsg === "Not Found" || errorMsg.includes("404")) {
                toast.error("無權刪除此評論（後端權限配置問題）")
            } else if (errorMsg === "Internal Server Error" || errorMsg.includes("500")) {
                toast.error("後端處理錯誤，請通知開發者查看後端日誌")
            } else if (errorMsg === "Forbidden" || errorMsg.includes("403")) {
                toast.error("無權限執行此操作")
            } else {
                toast.error("刪除失敗: " + errorMsg)
            }
            setDeleteConfirmId(null)
        }
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">評論</h3>

            <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">暫無評論</p>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.id} className="bg-gray-50">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        {comment.author.avatar ? (
                                            <img
                                                src={comment.author.avatar}
                                                alt={comment.author.displayName || comment.author.email}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                <UserIcon className="h-4 w-4 text-gray-500" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{comment.author.displayName || comment.author.email}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 text-sm mt-1">{comment.content}</p>
                                        </div>
                                    </div>

                                    {currentUser && (currentUser.id === comment.author.id || currentUser.role === 'admin') && (
                                        deleteConfirmId === comment.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleDelete(comment.id)
                                                    }}
                                                    className="text-red-500 hover:text-red-600 text-xs px-2 py-0.5 bg-red-50 rounded transition-colors"
                                                >
                                                    確認刪除
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        setDeleteConfirmId(null)
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600 text-xs px-2 py-0.5"
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setDeleteConfirmId(comment.id)
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="刪除評論"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="寫下你的評論..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                />
                <Button type="submit" disabled={loading} size="sm">
                    {loading ? "發送中..." : "發送"}
                </Button>
            </form>
        </div>
    )
}
