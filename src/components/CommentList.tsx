import React, { useState, useEffect } from "react"
import { createComment } from "../lib/api"
import { Button } from "./ui/Button"
import { Card, CardContent } from "./ui/Card"
import { User as UserIcon } from "lucide-react"
import { toast } from "sonner"

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

    // Update comments when initialComments changes
    useEffect(() => {
        setComments(initialComments)
    }, [initialComments])

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
                                    <span className="font-medium text-sm">{comment.author.displayName || comment.author.email}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-800 text-sm pl-8">{comment.content}</p>
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
