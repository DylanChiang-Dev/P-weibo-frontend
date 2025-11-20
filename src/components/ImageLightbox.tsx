import React, { useState } from "react"
import { X } from "lucide-react"

interface ImageLightboxProps {
    images: { file_path: string }[]
    initialIndex: number
    onClose: () => void
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
                <X className="h-8 w-8" />
            </button>

            {/* Image Counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                    >
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Image */}
            <img
                src={images[currentIndex].file_path}
                alt="Full size"
                className="max-w-[90vw] max-h-[90vh] object-contain"
            />
        </div>
    )
}
