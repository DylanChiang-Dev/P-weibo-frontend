/**
 * Lazy loading image component
 * 懶加載圖片組件，提升頁面性能
 */

import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
    onClick?: () => void
}

export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className,
    width,
    height,
    onClick,
}) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (!imgRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin: "50px",
            }
        )

        observer.observe(imgRef.current)

        return () => observer.disconnect()
    }, [])

    return (
        <div
            className={cn("relative overflow-hidden bg-gray-100", className)}
            style={{ width, height }}
        >
            {isInView && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={cn(
                        "transition-opacity duration-300",
                        isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    width={width}
                    height={height}
                    onLoad={() => setIsLoaded(true)}
                    onClick={onClick}
                    loading="lazy"
                />
            )}
            {!isLoaded && isInView && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
                </div>
            )}
        </div>
    )
}
