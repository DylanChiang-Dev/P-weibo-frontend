import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
    size?: "sm" | "md" | "lg"
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
        primary: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 active:scale-95 transition-all focus-visible:ring-blue-600",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
        ghost: "hover:bg-gray-100 text-gray-700",
        outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
    }

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base",
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
