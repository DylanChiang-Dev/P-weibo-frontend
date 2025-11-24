import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/Dialog"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { updatePost } from "@/lib/api"
import { toast } from "sonner"
import type { Post, PostImage, PostVideo } from "@/types"
import { X, Upload, Image as ImageIcon, Video as VideoIcon, Lock, Globe } from "lucide-react"
import { UPLOAD_LIMITS } from "@/config/api"
import { validateImageFile, validateVideoFile, validateImageCount, validateVideoCount } from "@/lib/validation"

interface EditPostDialogProps {
    post: Post
    isOpen: boolean
    onClose: () => void
    onSuccess: (updatedPost: Post) => void
}

export const EditPostDialog: React.FC<EditPostDialogProps> = ({ post, isOpen, onClose, onSuccess }) => {
    const [content, setContent] = useState(post.content)
    const [createdAt, setCreatedAt] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Media state
    const [existingImages, setExistingImages] = useState<PostImage[]>(post.images || [])
    const [existingVideos, setExistingVideos] = useState<PostVideo[]>(post.videos || [])
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
    const [deletedVideoIds, setDeletedVideoIds] = useState<number[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [newVideos, setNewVideos] = useState<File[]>([])
    const [visibility, setVisibility] = useState<'public' | 'private'>(post.visibility || 'public')

    useEffect(() => {
        if (isOpen) {
            setContent(post.content)
            setExistingImages(post.images || [])
            setExistingVideos(post.videos || [])
            setDeletedImageIds([])
            setDeletedVideoIds([])
            setNewImages([])
            setNewVideos([])
            setVisibility(post.visibility || 'public')

            // Format date for datetime-local input
            const date = new Date(post.created_at)
            const localIsoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
            setCreatedAt(localIsoString)
        }
    }, [isOpen, post])

    const handleDeleteImage = (imageId: number) => {
        setDeletedImageIds([...deletedImageIds, imageId])
        setExistingImages(existingImages.filter(img => img.id !== imageId))
    }

    const handleDeleteVideo = (videoId: number) => {
        setDeletedVideoIds([...deletedVideoIds, videoId])
        setExistingVideos(existingVideos.filter(vid => vid.id !== videoId))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        // Validate count
        const currentCount = existingImages.length + newImages.length
        const countError = validateImageCount(files.length, currentCount)
        if (countError) {
            toast.error(countError)
            return
        }

        // Validate each file
        const validFiles: File[] = []
        for (const file of files) {
            const error = validateImageFile(file)
            if (error) {
                toast.error(error)
                continue
            }
            validFiles.push(file)
        }

        if (validFiles.length > 0) {
            setNewImages([...newImages, ...validFiles])
        }
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        // Validate count
        const currentCount = existingVideos.length + newVideos.length
        const countError = validateVideoCount(files.length, currentCount)
        if (countError) {
            toast.error(countError)
            return
        }

        // Validate each file
        const validFiles: File[] = []
        for (const file of files) {
            const error = validateVideoFile(file)
            if (error) {
                toast.error(error)
                continue
            }
            validFiles.push(file)
        }

        if (validFiles.length > 0) {
            setNewVideos([...newVideos, ...validFiles])
        }
    }

    const handleRemoveNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index))
    }

    const handleRemoveNewVideo = (index: number) => {
        setNewVideos(newVideos.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const date = new Date(createdAt)
            const isoString = date.toISOString()

            const res = await updatePost(post.id, {
                content,
                created_at: isoString,
                visibility,
                delete_images: deletedImageIds.length > 0 ? deletedImageIds : undefined,
                delete_videos: deletedVideoIds.length > 0 ? deletedVideoIds : undefined,
                images: newImages.length > 0 ? newImages : undefined,
                videos: newVideos.length > 0 ? newVideos : undefined,
            })

            if (res.success && res.data) {
                toast.success("貼文已更新")
                onSuccess(res.data)
                onClose()
            } else {
                toast.error(res.error || "更新失敗")
            }
        } catch (error) {
            toast.error("發生錯誤")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden bg-white rounded-xl shadow-2xl">
                <DialogHeader className="px-6 py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white sticky top-0 z-10">
                    <DialogTitle className="text-lg font-semibold text-gray-900">編輯貼文</DialogTitle>
                    <Button variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 p-0">
                        <X className="h-4 w-4 text-gray-500" />
                    </Button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        {/* Content */}
                        <div className="space-y-2">
                            <textarea
                                className="w-full min-h-[120px] p-0 border-none focus:ring-0 resize-none text-base text-gray-800 placeholder:text-gray-400"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="分享你的想法..."
                            />
                        </div>

                        {/* Media Grid */}
                        {(existingImages.length > 0 || existingVideos.length > 0 || newImages.length > 0 || newVideos.length > 0) && (
                            <div className="grid grid-cols-4 gap-2">
                                {/* Existing Images */}
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative aspect-square group rounded-lg overflow-hidden bg-gray-50">
                                        <img src={img.file_path} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {/* Existing Videos */}
                                {existingVideos.map((vid) => (
                                    <div key={vid.id} className="relative aspect-square group rounded-lg overflow-hidden bg-gray-900">
                                        <video src={vid.file_path} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <VideoIcon className="h-6 w-6 text-white/50" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteVideo(vid.id)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {/* New Images */}
                                {newImages.map((file, index) => (
                                    <div key={`new-img-${index}`} className="relative aspect-square group rounded-lg overflow-hidden bg-gray-50 border-2 border-green-500/20">
                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {/* New Videos */}
                                {newVideos.map((file, index) => (
                                    <div key={`new-vid-${index}`} className="relative aspect-square group rounded-lg overflow-hidden bg-gray-900 border-2 border-green-500/20">
                                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <VideoIcon className="h-6 w-6 text-white/50" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewVideo(index)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            {/* Settings Group */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Date Picker */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">發布時間</label>
                                    <Input
                                        type="datetime-local"
                                        value={createdAt}
                                        onChange={(e) => setCreatedAt(e.target.value)}
                                        className="h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                {/* Visibility Toggle */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">可見性</label>
                                    <div className="flex bg-gray-100 p-1 rounded-lg h-9">
                                        <button
                                            type="button"
                                            onClick={() => setVisibility('public')}
                                            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md transition-all ${visibility === 'public'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <Globe className="h-3.5 w-3.5" />
                                            公開
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVisibility('private')}
                                            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md transition-all ${visibility === 'private'
                                                ? 'bg-white text-orange-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <Lock className="h-3.5 w-3.5" />
                                            私密
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Actions */}
                            <div className="flex gap-3">
                                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors text-sm font-medium">
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                    <ImageIcon className="h-4 w-4" />
                                    <span>添加圖片</span>
                                </label>
                                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors text-sm font-medium">
                                    <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" />
                                    <VideoIcon className="h-4 w-4" />
                                    <span>添加視頻</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
                            取消
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                            {isLoading ? "保存中..." : "保存更改"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
