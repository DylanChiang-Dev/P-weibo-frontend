import React, { useEffect, useState } from "react"
import { getMe, logout } from "../lib/api"
import type { User } from "../types"
import { Camera, Settings, LogOut } from "lucide-react"

export const Navbar: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMe().then((res) => {
            if (res.success && res.data) {
                setUser(res.data)
            }
            setLoading(false)
        })
    }, [])

    const handleLogout = async () => {
        await logout()
        window.location.href = "/login"
    }

    return (
        <nav className="bg-[#2c2c2c] sticky top-0 z-50">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="flex items-center justify-between h-12">
                    {/* Title - WeChat Moments style */}
                    <a href="/" className="text-white text-[17px] font-medium">
                        朋友圈
                    </a>

                    {/* Right side - Icon actions only */}
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="h-6 w-16 bg-gray-700 animate-pulse rounded"></div>
                        ) : user ? (
                            <>
                                {/* Camera/New Post */}
                                <a
                                    href="/post/new"
                                    className="text-white hover:text-gray-300 transition-colors"
                                    title="發文"
                                >
                                    <Camera className="h-5 w-5" />
                                </a>

                                {/* Settings */}
                                <a
                                    href="/settings"
                                    className="text-white hover:text-gray-300 transition-colors"
                                    title="設置"
                                >
                                    <Settings className="h-5 w-5" />
                                </a>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="text-white hover:text-gray-300 transition-colors"
                                    title="登出"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <a
                                href="/login"
                                className="text-white text-sm hover:text-gray-300 transition-colors"
                            >
                                登入
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
