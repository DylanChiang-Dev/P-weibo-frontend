/**
 * React Query Provider Component
 * 用於包裹應用以提供 React Query 功能
 */

import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"

interface QueryProviderProps {
    children: React.ReactNode
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
