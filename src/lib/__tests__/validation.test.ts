/**
 * Example unit tests for validation functions
 */

import { describe, it, expect } from "vitest"
import {
    validateEmail,
    validatePassword,
    validateDisplayName,
    validatePostContent,
} from "@/lib/validation"

describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
        expect(validateEmail("test@example.com")).toBe(true)
        expect(validateEmail("user.name@domain.co.uk")).toBe(true)
    })

    it("should reject invalid email addresses", () => {
        expect(validateEmail("invalid")).toBe(false)
        expect(validateEmail("@example.com")).toBe(false)
        expect(validateEmail("user@")).toBe(false)
    })
})

describe("validatePassword", () => {
    it("should accept passwords with 6+ characters", () => {
        expect(validatePassword("password123")).toBeNull()
        expect(validatePassword("abcdef")).toBeNull()
    })

    it("should reject passwords with less than 6 characters", () => {
        expect(validatePassword("12345")).toBe("密碼至少需要 6 個字符")
        expect(validatePassword("abc")).toBe("密碼至少需要 6 個字符")
    })
})

describe("validateDisplayName", () => {
    it("should accept valid display names", () => {
        expect(validateDisplayName("John Doe")).toBeNull()
        expect(validateDisplayName("用戶名")).toBeNull()
    })

    it("should reject empty names", () => {
        expect(validateDisplayName("")).toBe("用戶名不能為空")
        expect(validateDisplayName("   ")).toBe("用戶名不能為空")
    })

    it("should reject names longer than 50 characters", () => {
        const longName = "a".repeat(51)
        expect(validateDisplayName(longName)).toBe("用戶名不能超過 50 個字符")
    })
})

describe("validatePostContent", () => {
    it("should accept valid post content", () => {
        expect(validatePostContent("Hello world")).toBeNull()
        expect(validatePostContent("")).toBeNull() // Empty is allowed
    })

    it("should reject content longer than 5000 characters", () => {
        const longContent = "a".repeat(5001)
        expect(validatePostContent(longContent)).toBe("內容不能超過 5000 個字符")
    })
})
