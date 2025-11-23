import React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={() => onOpenChange(false)}
            />
            {/* Content Container */}
            <div className="relative z-50 w-full max-w-lg p-4">
                {children}
            </div>
        </div>
    )
}

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div
            className={cn(
                "bg-white rounded-lg shadow-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>
            {children}
        </div>
    )
}

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
    return (
        <h2 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
            {children}
        </h2>
    )
}

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={cn("px-6 py-4 bg-gray-50 flex items-center justify-end gap-2", className)} {...props}>
            {children}
        </div>
    )
}
