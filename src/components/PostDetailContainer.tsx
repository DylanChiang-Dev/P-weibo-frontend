import React, { useEffect, useState } from "react"
import { getPost, likePost, deletePost, getMe, getComments } from "../lib/api"
import type { Post, User, Comment } from "../types"
import { PostItem } from "./PostItem"
import { CommentList } from "./CommentList"
import { toast } from "sonner"

interface PostDetailContainerProps {
    initialPost: Post
}

export const PostDetailContainer: React.FC<PostDetailContainerProps> = ({ initialPost }) => {
    const [post, setPost] = useState<Post>(initialPost)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [loadingComments, setLoadingComments] = useState(true)

    useEffect(() => {
        getMe().then((res) => {
            if (res.success && res.data) {
                setCurrentUser(res.data)
            }
        })

        // Fetch comments
        getComments(initialPost.id).then((res) => {
            if (res.success && res.data) {
                setComments(res.data)
            }
            setLoadingComments(false)
        })
    }, [])

    const handleLike = async (id: number) => {
        const res = await likePost(id)
        if (res.success && res.data) {
            setPost((prev) => ({ ...prev, like_count: res.data!.count }))
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return
        const res = await deletePost(id)
        if (res.success) {
            toast.success("刪除成功")
            window.location.href = "/"
        } else {
            toast.error("刪除失敗")
        }
    }

    return (
        <div>
            <PostItem
                post={post}
                currentUser={currentUser}
                onLike={handleLike}
                onDelete={handleDelete}
            />
            <CommentList postId={post.id} initialComments={comments} loading={loadingComments} />
        </div>
    )
}
