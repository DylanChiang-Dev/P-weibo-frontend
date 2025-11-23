/**
 * Custom React Query hooks for User
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMe, getUserProfile, updateProfile } from "@/lib/api"
import type { User } from "@/types"

// Query Keys
export const userKeys = {
    all: ["users"] as const,
    me: () => [...userKeys.all, "me"] as const,
    profile: (email: string) => [...userKeys.all, "profile", email] as const,
}

/**
 * Hook for current user
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: userKeys.me(),
        queryFn: async () => {
            const result = await getMe()
            if (!result.success) {
                return null // Not logged in
            }
            return result.data || null
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}

/**
 * Hook for user profile
 */
export function useUserProfile(email: string) {
    return useQuery({
        queryKey: userKeys.profile(email),
        queryFn: async () => {
            const result = await getUserProfile(email)
            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to fetch user profile")
            }
            return result.data
        },
    })
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { displayName?: string; avatar?: File }) => {
            const result = await updateProfile(data)
            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to update profile")
            }
            return result.data
        },
        onSuccess: (data) => {
            // Update current user cache
            queryClient.setQueryData<User>(userKeys.me(), data)
            // Invalidate profile cache for this user
            if (data.email) {
                queryClient.invalidateQueries({ queryKey: userKeys.profile(data.email) })
            }
        },
    })
}
