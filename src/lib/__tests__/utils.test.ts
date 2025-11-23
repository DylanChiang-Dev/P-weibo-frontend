/**
 * Example unit tests for utility functions
 */

import { describe, it, expect } from "vitest"
import { resolveMediaUrl, formatRelativeTime, cn, formatFileSize } from "@/lib/utils"

describe("resolveMediaUrl", () => {
    it("should return null for null or undefined input", () => {
        expect(resolveMediaUrl(null)).toBeNull()
        expect(resolveMediaUrl(undefined)).toBeNull()
    })

    it("should return the same URL if it starts with http", () => {
        const url = "https://example.com/image.jpg"
        expect(resolveMediaUrl(url)).toBe(url)
    })

    it("should resolve relative paths", () => {
        const path = "/uploads/image.jpg"
        const result = resolveMediaUrl(path)
        expect(result).toContain("/uploads/image.jpg")
    })

    it("should handle absolute server paths", () => {
        const path = "/var/www/project/storage/uploads/video.mp4"
        const result = resolveMediaUrl(path)
        expect(result).toContain("/uploads/video.mp4")
        expect(result).not.toContain("/var/www")
    })
})

describe("formatRelativeTime", () => {
    it("should return '剛剛' for recent times", () => {
        const now = new Date()
        const result = formatRelativeTime(now.toISOString())
        expect(result).toBe("剛剛")
    })

    it("should format minutes correctly", () => {
        const past = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        const result = formatRelativeTime(past.toISOString())
        expect(result).toBe("5 分鐘前")
    })

    it("should format hours correctly", () => {
        const past = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        const result = formatRelativeTime(past.toISOString())
        expect(result).toBe("3 小時前")
    })
})

describe("cn", () => {
    it("should merge class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar")
    })

    it("should filter out falsy values", () => {
        expect(cn("foo", false, "bar", null, undefined)).toBe("foo bar")
    })

    it("should handle conditional classes", () => {
        const isActive = true
        expect(cn("base", isActive && "active")).toBe("base active")
    })
})

describe("formatFileSize", () => {
    it("should format bytes", () => {
        expect(formatFileSize(0)).toBe("0 B")
        expect(formatFileSize(500)).toBe("500.00 B")
    })

    it("should format kilobytes", () => {
        expect(formatFileSize(1024)).toBe("1.00 KB")
        expect(formatFileSize(5120)).toBe("5.00 KB")
    })

    it("should format megabytes", () => {
        expect(formatFileSize(1048576)).toBe("1.00 MB")
        expect(formatFileSize(5242880)).toBe("5.00 MB")
    })
})
