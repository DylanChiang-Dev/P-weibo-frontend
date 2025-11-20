import React, { useState, useEffect } from "react"
import { getMe, updateProfile } from "../lib/api"
import type { User } from "../types"
import { Card, CardContent, CardHeader } from "./ui/Card"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { User as UserIcon, Upload, Camera } from "lucide-react"
import { toast } from "sonner"

export const SettingsForm: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)
    const [displayName, setDisplayName] = useState("")
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getMe().then((res) => {
            if (res.success && res.data) {
                setUser(res.data)
                setDisplayName(res.data.displayName || "")
                setAvatarPreview(res.data.avatar || null)
            }
            setLoading(false)
        })
    }, [])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // 檢查文件大小（限制 5MB）
            if (file.size > 5 * 1024 * 1024) {
                toast.error("圖片大小不能超過 5MB")
                return
            }

            // 檢查文件類型
            if (!file.type.startsWith("image/")) {
                toast.error("請上傳圖片文件")
                return
            }

            setAvatarFile(file)

            // 創建預覽
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        console.log("[SettingsForm] Submitting update...", { displayName, hasAvatar: !!avatarFile })

        try {
            const res = await updateProfile({
                displayName,
                avatar: avatarFile || undefined
            })

            console.log("[SettingsForm] Result:", res)

            if (res.success) {
                toast.success("設置已保存")
                // 更新本地狀態
                if (res.data) {
                    setUser(res.data)
                    setDisplayName(res.data.displayName || "")
                    setAvatarPreview(res.data.avatar || null)
                    // 重新加載頁面以更新 Navbar 等組件
                    setTimeout(() => window.location.reload(), 1000)
                }
            } else {
                toast.error(res.error || "保存失敗")
            }
        } catch (error) {
            console.error("[SettingsForm] Unexpected error:", error)
            toast.error("保存失敗: 發生意外錯誤")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">個人資料設置</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 頭像設置 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-12 w-12" />
                                )}
                            </div>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                <Camera className="h-4 w-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500">
                            點擊相機圖標上傳新頭像（最大 5MB）
                        </p>
                    </div>

                    {/* 顯示名稱 */}
                    <Input
                        label="顯示名稱"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="輸入您的昵稱"
                        maxLength={50}
                    />

                    {/* Email（只讀） */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="text"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* 提示信息 - 已移除，因為後端已實現 */}
                    {/* <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>注意：</strong> 設置功能需要後端 API 支持。
              <br />
              請實現 <code className="bg-yellow-100 px-1 rounded">PUT /api/users/me</code> 端點。
            </p>
          </div> */}

                    {/* 按鈕 */}
                    <div className="flex gap-3">
                        <Button type="submit" disabled={saving}>
                            {saving ? "保存中..." : "保存更改"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            取消
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
