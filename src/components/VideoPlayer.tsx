import React from "react"

interface VideoPlayerProps {
    src: string
    thumbnail?: string | null
    className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, thumbnail, className = "" }) => {
    return (
        <video
            src={src}
            poster={thumbnail || undefined}
            controls
            preload="metadata"
            className={`w-full rounded-sm bg-black ${className}`}
            style={{ maxHeight: "400px" }}
        >
            您的瀏覽器不支持視頻播放。
        </video>
    )
}
