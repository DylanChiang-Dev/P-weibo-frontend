import React, { useState, useEffect } from "react"
import { Heart, MessageSquare, Pin, Pencil, Lock } from "lucide-react"
import { EditPostDialog } from "./EditPostDialog"
import type { Post, User, Comment } from "@/types"
import { Button } from "./ui/Button"
import { createComment, getComments } from "../lib/api"
import { getToken } from "../lib/token"
import { refreshToken } from "../lib/refresh"
import { ImageLightbox } from "./ImageLightbox"
import { VideoPlayer } from "./VideoPlayer"
import { toast } from "sonner"

interface PostItemProps {
    post: Post
    currentUser?: User | null
    onLike: (id: number) => void
    onDelete: (id: number) => void
    onPin: (id: number, isPinned: boolean) => void
    onUpdate?: () => void
}

export const PostItem: React.FC<PostItemProps> = ({ post, currentUser, onLike, onDelete, onPin, onUpdate }) => {
    const isAuthor = currentUser?.id === post.author.id
    const [isCommenting, setIsCommenting] = useState(false)
    const [commentContent, setCommentContent] = useState("")
    const [localComments, setLocalComments] = useState<Comment[]>([])
    const [localCommentCount, setLocalCommentCount] = useState(post.comment_count)
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Check if user is admin
    const isAdmin = currentUser?.role === 'admin' || currentUser?.email === '3331322@gmail.com'
    const canEdit = isAuthor || isAdmin

    // Optimistic Like State
    const [isLiked, setIsLiked] = useState(post.is_liked || false)
    const [likeCount, setLikeCount] = useState(post.like_count)

    // Sync with props if they change (e.g. re-fetch)
    useEffect(() => {
        setLocalCommentCount(post.comment_count)
        // If backend provides is_liked, use it. Otherwise check localStorage.
        const savedLikes = JSON.parse(localStorage.getItem("liked_posts") || "[]")
        const isLikedLocal = savedLikes.includes(post.id)

        setIsLiked(post.is_liked || isLikedLocal)

        // Fix: If locally liked but backend returns 0 (not synced), force count to at least 1
        // This ensures "1 likes" is displayed even if backend didn't persist the like yet
        const backendCount = post.like_count
        const displayCount = (isLikedLocal && backendCount === 0) ? 1 : backendCount
        setLikeCount(displayCount)
    }, [post.comment_count, post.is_liked, post.like_count, post.id])

    // Fetch comments on mount if there are any
    useEffect(() => {
        if (post.comment_count > 0) {
            setIsLoadingComments(true)
            getComments(post.id).then(res => {
                if (res.success && res.data) {
                    setLocalComments(res.data)
                }
                setIsLoadingComments(false)
            })
        }
    }, [post.id, post.comment_count])

    // Image Grid Logic
    const getImageGridClass = (count: number) => {
        if (count === 1) return "grid-cols-1 max-w-[300px]"
        if (count === 4) return "grid-cols-2 max-w-[200px]" // 2x2 for 4 images
        return "grid-cols-3 max-w-[300px]" // 3 columns for others
    }

    const handleLike = async () => {
        // Optimistic Update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1)

        // Update LocalStorage
        const savedLikes = JSON.parse(localStorage.getItem("liked_posts") || "[]")
        if (newIsLiked) {
            if (!savedLikes.includes(post.id)) savedLikes.push(post.id)
        } else {
            const idx = savedLikes.indexOf(post.id)
            if (idx > -1) savedLikes.splice(idx, 1)
        }
        localStorage.setItem("liked_posts", JSON.stringify(savedLikes))

        // Call API (Parent handler)
        // Note: We don't await here to keep UI responsive, but ideally parent should handle error
        onLike(post.id)
    }

    const handlePin = async () => {
        onPin(post.id, post.is_pinned || false)
    }

    // Guest Nickname State
    const [guestNickname, setGuestNickname] = useState("")

    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) return

        // Optimistic update first
        const guestUser: User = {
            id: 0,
            email: "guest@example.com",
            displayName: guestNickname.trim() || "Guest",
            avatar: undefined
        }

        const newComment: Comment = {
            id: Date.now(), // Temp ID
            content: commentContent,
            created_at: new Date().toISOString(),
            author: currentUser || guestUser
        }

        setLocalComments([...localComments, newComment])
        setLocalCommentCount(prev => prev + 1)
        setCommentContent("")
        // Don't clear nickname so they can reuse it
        setIsCommenting(false)

        // Ensure we have a token if we are logged in
        if (currentUser && !getToken()) {
            try {
                await refreshToken()
            } catch (e) {
                console.warn("Failed to refresh token before comment:", e)
                // For now let it proceed, apiRequest might handle 401 or backend will reject.
            }
        }

        // Send to backend with authorName for guests
        // Logic: Always send authorName if we have a user, as a fallback.
        // If the token is valid, backend uses the token's user.
        // If the token is invalid/missing, backend uses this authorName (Guest mode).
        let authorName: string | undefined = undefined

        if (!currentUser) {
            authorName = guestNickname.trim() || "Guest"
        } else {
            // Always send the user's name. This fixes the "400 Author name required" error
            // when the token is present but invalid/expired.
            authorName = currentUser.displayName || currentUser.email.split('@')[0]
        }

        const res = await createComment(post.id, commentContent, authorName)
        if (!res.success) {
            console.warn("Comment failed to save to backend:", res.error)
            // Could revert optimistic update here if needed
        }
    }

    const handleImageClick = (index: number) => {
        setLightboxIndex(index)
        setLightboxOpen(true)
    }

    return (
        <div className="flex gap-3 mb-8 border-b border-gray-50 pb-6 last:border-none relative">
            {/* Left: Avatar */}
            <div className="flex-shrink-0">
                <a href={`/users/${encodeURIComponent(post.author.email)}`}>
                    {post.author.avatar ? (
                        <img
                            src={post.author.avatar}
                            alt={post.author.displayName}
                            className="h-10 w-10 rounded-md object-cover bg-gray-100"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            {(post.author.displayName || post.author.email)[0].toUpperCase()}
                        </div>
                    )}
                </a>
            </div>

            {/* Right: Content */}
            <div className="flex-1 min-w-0">
                {/* Name */}
                <div className="flex items-center gap-2 mb-1">
                    <a href={`/users/${encodeURIComponent(post.author.email)}`} className="block text-[#576b95] font-bold text-[15px] leading-snug hover:underline">
                        {post.author.displayName || post.author.email.split('@')[0]}
                    </a>
                    {post.is_pinned && (
                        <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Pin className="h-3 w-3" /> 置頂
                        </span>
                    )}
                </div>

                {/* Text Content */}
                <p className="text-[15px] text-gray-900 leading-normal mb-2.5 whitespace-pre-wrap">{post.content}</p>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                    <div className={`grid gap-1 mb-2.5 ${getImageGridClass(post.images.length)}`}>
                        {post.images.slice(0, 9).map((img, idx) => (
                            <div
                                key={idx}
                                className={`relative overflow-hidden bg-gray-100 rounded-sm cursor-pointer hover:opacity-90 transition-opacity ${post.images.length === 1 ? '' : 'aspect-square'
                                    }`}
                                onClick={() => handleImageClick(idx)}
                            >
                                <img
                                    src={img.file_path}
                                    alt="Post image"
                                    loading="lazy"
                                    className={`${post.images.length === 1
                                        ? 'w-full max-h-[500px] object-cover object-top'
                                        : 'w-full h-full object-cover'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Lightbox */}
                {lightboxOpen && post.images && (
                    <ImageLightbox
                        images={post.images}
                        initialIndex={lightboxIndex}
                        onClose={() => setLightboxOpen(false)}
                    />
                )}

                {/* Videos - displayed after images */}
                {post.videos && post.videos.length > 0 && (
                    <div className="space-y-2 mb-2.5">
                        {post.videos.map((video, idx) => (
                            <VideoPlayer
                                key={idx}
                                src={video.file_path}
                                thumbnail={video.thumbnail_path}
                            />
                        ))}
                    </div>
                )}

                {/* Meta & Actions */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{new Date(post.created_at).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }).replace(/\//g, '-')}</span>

                        {/* Private Indicator */}
                        {isAuthor && post.visibility === 'private' && (
                            <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                <Lock className="h-3 w-3" />
                                <span>僅自己可見</span>
                            </span>
                        )}

                        {isAuthor && (
                            <>
                                <button onClick={() => onDelete(post.id)} className="text-[#576b95] hover:underline">
                                    删除
                                </button>
                                <button onClick={handlePin} className="text-[#576b95] hover:underline">
                                    {post.is_pinned ? "取消置頂" : "置頂"}
                                </button>
                                <button onClick={() => setIsEditOpen(true)} className="text-[#576b95] hover:underline">
                                    編輯
                                </button>
                            </>
                        )}
                    </div>

                    {/* Action Button (Simplified) */}
                    <div className="flex items-center gap-4">
                        <button onClick={handleLike} className="group">
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-[#576b95]"}`} />
                        </button>
                        <button onClick={() => setIsCommenting(!isCommenting)}>
                            <MessageSquare className="h-4 w-4 text-[#576b95]" />
                        </button>
                    </div>
                </div>

                {/* Inline Comment Input */}
                {isCommenting && (
                    <div className="mb-3">
                        {/* Guest Nickname Input */}
                        {!currentUser && (
                            <div className="mb-2">
                                <input
                                    type="text"
                                    value={guestNickname}
                                    onChange={(e) => setGuestNickname(e.target.value)}
                                    placeholder="您的暱稱 (選填)"
                                    className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-[#576b95] focus:border-[#576b95] outline-none w-32"
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="評論..."
                                className="flex-1 bg-gray-100 border-none rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#576b95]"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                            />
                            <Button size="sm" onClick={handleCommentSubmit} disabled={!commentContent.trim()} type="button">
                                發送
                            </Button>
                        </div>
                    </div>
                )}

                {/* Likes & Comments Bubble */}
                {(likeCount > 0 || localCommentCount > 0) && (
                    <div className="bg-[#f7f7f7] rounded-[4px] p-2 text-[13px] relative mt-1">
                        {/* Triangle Arrow */}
                        <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#f7f7f7] rotate-45"></div>

                        {/* Likes */}
                        {likeCount > 0 && (
                            <div className="flex items-center gap-1.5 text-[#576b95] border-b border-gray-200/50 pb-1.5 mb-1.5 last:border-none last:mb-0 last:pb-0">
                                <Heart className="h-3 w-3 stroke-[2.5px]" />
                                <span className="font-medium">{likeCount} likes</span>
                            </div>
                        )}

                        {/* Comments List */}
                        {(localCommentCount > 0) && (
                            <div className="text-gray-800 space-y-1">
                                {isLoadingComments && localComments.length === 0 && (
                                    <div className="text-gray-400 italic">加載評論中...</div>
                                )}

                                {/* Local Comments (Optimistic) */}
                                {localComments.map((comment) => (
                                    <div key={comment.id}>
                                        <span className="text-[#576b95] font-medium">
                                            {comment.author.displayName || comment.author.email.split('@')[0]}
                                        </span>
                                        : {comment.content}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            {isEditOpen && (
                <EditPostDialog
                    post={post}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={() => {
                        if (onUpdate) onUpdate()
                    }}
                />
            )}
        </div>
    )
}
