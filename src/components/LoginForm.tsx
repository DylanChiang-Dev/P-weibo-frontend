import React, { useState } from "react"
import { login } from "../lib/api"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card, CardContent, CardHeader } from "./ui/Card"
import { toast } from "sonner"

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError("")

        const res = await login(email, password)
        if (res.success) {
            window.location.href = "/"
            toast.success("登入成功")
        } else {
            setError(res.error || "Login failed")
            toast.error(res.error || "Login failed")
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
                <h1 className="text-2xl font-bold text-center">登入</h1>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="密碼"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "登入中..." : "登入"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
