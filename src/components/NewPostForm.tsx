import React, { useState } from "react"
import { createPost } from "../lib/api"
import { Button } from "./ui/Button"
import { Card, CardContent, CardHeader } from "./ui/Card"
import { ImagePlus, X, Video, Lock, Globe } from "lucide-react"
import { toast } from "sonner"
import { QueryProvider } from "./QueryProvider"
import { UPLOAD_LIMITS } from "@/config/api"
import { validateVideoFile, validateVideoCount, validateImageFile, validateImageCount } from "@/lib/validation"

const NewPostFormContent: React.FC = () => {
    const [content, setContent] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [videos, setVideos] = useState<File[]>([])
    const [visibility, setVisibility] = useState<'public' | 'private'>('public')
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files)
            const validImages: File[] = []
            
            // Validate each image
            for (const img of newImages) {
                const error = validateImageFile(img)
                if (error) {
                    toast.error(error)
                } else {
                    validImages.push(img)
                }
            }
            
            // Check total count
            const totalImages = [...files, ...validImages]
            const countError = validateImageCount(totalImages)
            if (countError) {
                toast.error(countError)
                // Only add images up to the limit
                const remaining = UPLOAD_LIMITS.MAX_IMAGES - files.length
                if (remaining > 0) {
                    setFiles(prev => [...prev, ...validImages.slice(0, remaining)])
                }
                return
            }
            
            setFiles(prev => [...prev, ...validImages])
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newVideos = Array.from(e.target.files)
            const validVideos: File[] = []
            
            // Validate each video
            for (const video of newVideos) {
                const error = validateVideoFile(video)
                if (error) {
                    toast.error(error)
                } else {
                    validVideos.push(video)
                }
            }
            
            // Check total count
            const totalVideos = [...videos, ...validVideos]
            const countError = validateVideoCount(totalVideos)
            if (countError) {
                toast.error(countError)
                // Only add videos up to the limit
                const remaining = UPLOAD_LIMITS.MAX_VIDEOS - videos.length
                if (remaining > 0) {
                    setVideos(prev => [...prev, ...validVideos.slice(0, remaining)])
                }
                return
            }
            
            setVideos(prev => [...prev, ...validVideos])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError("")

        const res = await createPost(content, files, videos, visibility)
        if (res.success) {
            toast.success("發布成功")
            window.location.href = "/"
        } else {
            setError(res.error || "Failed to create post")
            toast.error(res.error || "Failed to create post")
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-6">
            <CardHeader>
                <h1 className="text-xl font-bold">發布新帖子</h1>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        className="w-full min-h-[150px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        placeholder="分享你的想法..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Image Upload */}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                            <ImagePlus className="h-5 w-5" />
                            <span>添加圖片</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>

                        {/* Video Upload */}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                            <Video className="h-5 w-5" />
                            <span>添加視頻</span>
                            <input
                                type="file"
                                multiple
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoChange}
                            />
                        </label>

                        {/* Visibility Selector */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${visibility === 'public'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <Globe className="h-5 w-5" />
                                <span>公開</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${visibility === 'private'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <Lock className="h-5 w-5" />
                                <span>僅自己可見</span>
                            </button>
                        </div>
                    </div>

                    {/* Selected Files Summary */}
                    {(files.length > 0 || videos.length > 0) && (
                        <div className="text-sm text-gray-500">
                            已選擇: {files.length} 張圖片, {videos.length} 個視頻
                        </div>
                    )}

                    {/* Image Previews */}
                    {files.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {files.map((f, i) => (
                                <div key={`img-${i}`} className="relative h-24 w-full bg-gray-100 rounded-md overflow-hidden group">
                                    <img
                                        src={URL.createObjectURL(f)}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Video Previews */}
                    {videos.length > 0 && (
                        <div className="space-y-2 mt-2">
                            {videos.map((v, i) => (
                                <div key={`vid-${i}`} className="relative bg-gray-50 rounded-md p-2 flex items-center justify-between border border-gray-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-10 w-10 bg-black rounded flex items-center justify-center flex-shrink-0">
                                            <Video className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="truncate text-sm text-gray-700">
                                            <div className="font-medium truncate">{v.name}</div>
                                            <div className="text-xs text-gray-500">{(v.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                            取消
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "發布中..." : "發布"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export const NewPostForm: React.FC = () => {
    return (
        <QueryProvider>
            <NewPostFormContent />
        </QueryProvider>
    )
}

