import React from "react"
import { Toaster as Sonner } from "sonner"

export const Toaster: React.FC = () => {
    return (
        <Sonner
            position="top-center"
            richColors
            closeButton
            theme="light"
        />
    )
}
