// Test setup file
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {}
    return {
        getItem: function (key: string) {
            return store[key] || null
        },
        setItem: function (key: string, value: string) {
            store[key] = value.toString()
        },
        removeItem: function (key: string) {
            delete store[key]
        },
        clear: function () {
            store = {}
        }
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock import.meta.env
// 注意：Vitest 會自動處理 import.meta.env，但我們需要確保 PUBLIC_API_BASE 有值
// 這裡我們通過 mock getApiUrl 函數所在的模塊來解決，或者直接設置環境變量
// 由於 import.meta 是只讀的，我們嘗試 mock src/config/env.ts

vi.mock('@/config/env', async () => {
    const actual = await vi.importActual('@/config/env')
    return {
        ...actual,
        getApiUrl: (path: string) => {
            if (path.startsWith("http")) return path
            return `http://localhost:8080${path}`
        }
    }
})


