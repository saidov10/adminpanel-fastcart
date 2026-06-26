import { useState } from "react"
import { useTranslation, type Locale } from "@/context/I18nContext"
import { useTheme } from "@/context/ThemeContext"
import { ShoppingCart, Eye, EyeOff, Globe, Sun, Moon } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"

export default function Login() {
  const { locale, setLocale, t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { login, isLoading } = useAuthStore()
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const languages: { code: Locale; name: string }[] = [
    { code: "en", name: "English" },
    { code: "ru", name: "Русский" },
    { code: "tg", name: "Тоҷикӣ" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading("Logging in...")
    try {
      await login(userName, password)
      toast.success("Successfully logged in!", { id: toastId })
    } catch (err: any) {
      toast.error(err.message || "Login failed", { id: toastId })
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 dark:bg-slate-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-2 font-bold text-xl relative z-10">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/10">
            <ShoppingCart className="h-6 w-6 text-orange-500" />
          </div>
          <span>
            fast<span className="text-blue-500">cart</span>
          </span>
        </div>

        <div className="my-auto space-y-6 relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            {t("login.welcome")}
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your store details, track customer shipments, update product lines, and optimize conversion funnels effortlessly.
          </p>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          &copy; {new Date().getFullYear()} fastcart. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-6 lg:p-12">
        <div className="flex justify-end gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-2 z-20 w-32 rounded-lg border border-border bg-card p-1 shadow-lg">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code)
                        setLangOpen(false)
                      }}
                      className="flex w-full items-center rounded-md px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-lg border border-border p-1.5 hover:bg-accent"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>

        <div className="my-auto mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">{t("login.title")}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-semibold text-muted-foreground">
                {t("login.email")}
              </label>
              <input
                id="username"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="admin"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                  {t("login.password")}
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:underline">
                  {t("login.forgot")}
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-input bg-background pl-3 pr-10 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              ) : (
                t("login.button")
              )}
            </button>
          </form>
        </div>

        <div className="text-center lg:text-left text-xs text-muted-foreground">
          fastcart Admin Portal Version 1.0.0
        </div>
      </div>
    </div>
  )
}
