import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"

const LoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
)

interface LoginProps {
  onLoginSuccess: (data: any) => void
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("saved_user")
    const savedPass = localStorage.getItem("saved_pass")
    const savedRemember = localStorage.getItem("remember_me")

    if (savedUser && savedPass) {
      setUsername(savedUser)
      setPassword(savedPass)
      setRememberMe(savedRemember !== "false")
    } else {
      setRememberMe(savedRemember === "true")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.post("/api/login", { username, password })
      const data = response.data

      if (data.personal?.errorCode || !data.personal?.studentInfo) {
        setError(data.personal?.errorMessage || "로그인에 실패했습니다. 학번과 비밀번호를 확인해주세요.")
        return
      }

      if (rememberMe) {
        localStorage.setItem("remember_me", "true")
        localStorage.setItem("saved_user", username)
        localStorage.setItem("saved_pass", password)
      } else {
        localStorage.removeItem("remember_me")
        localStorage.removeItem("saved_user")
        localStorage.removeItem("saved_pass")
      }

      onLoginSuccess(data)
    } catch (err: any) {
      console.error(err)
      setError("서버 연결에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-white">성적 조회</CardTitle>
          <p className="text-slate-400 text-sm mt-1">수원대학교 포털 로그인</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">학번</Label>
              <Input
                id="username"
                placeholder="학번 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-violet-500"
              />
              <Label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer">
                로그인 정보 저장
              </Label>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-300 bg-red-500/20 border border-red-500/30 rounded-lg">
                {error}
              </div>
            )}

            <Button
              className="w-full bg-violet-600 hover:bg-violet-500 text-white"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  로그인 중...
                </span>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
