import React, { useState } from "react"
import { createPost } from "../lib/api"
import { Button } from "./ui/Button"
import { Card, CardContent, CardHeader } from "./ui/Card"
import { ImagePlus, X, Video } from "lucide-react"
import { toast } from "sonner"

export const NewPostForm: React.FC = () => {
    const [content, setContent] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [videos, setVideos] = useState<File[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])])
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newVideos = Array.from(e.target.files)
            // Simple validation for size (100MB limit)
            const validVideos = newVideos.filter(v => v.size <= 100 * 1024 * 1024)
            if (validVideos.length !== newVideos.length) {
                toast.error("部分視頻超過 100MB 限制，已自動過濾")
            }
            setVideos(prev => [...prev, ...validVideos])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError("")

        const res = await createPost(content, files, videos)
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
