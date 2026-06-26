import { useState } from "react"
import { useTranslation, type Locale } from "@/context/I18nContext"
import { useTheme } from "@/context/ThemeContext"
import { Menu, Search, Sun, Moon, Globe, Bell, User } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

interface HeaderProps {
  onMenuToggle: () => void
  currentView: string
  sidebarOpen: boolean
}

export default function Header({ onMenuToggle, currentView, sidebarOpen }: HeaderProps) {
  const { locale, setLocale, t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { userName } = useAuthStore()
  const [langOpen, setLangOpen] = useState(false)

  const viewTitles: Record<string, string> = {
    dashboard: t("nav.dashboard"),
    orders: t("nav.orders"),
    products: t("nav.products"),
    categories: t("nav.categories")
  }

  const languages: { code: Locale; name: string }[] = [
    { code: "en", name: "English" },
    { code: "ru", name: "Русский" },
    { code: "tg", name: "Тоҷикӣ" }
  ]

  return (
    <header className={`fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6 text-foreground transition-all duration-300 ${
      sidebarOpen ? "left-0 lg:left-64" : "left-0 lg:left-16"
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold truncate max-w-[120px] sm:max-w-none">{viewTitles[currentView] || ""}</h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative hidden max-w-xs md:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("header.search")}
            className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 rounded-lg p-2 hover:bg-accent hover:text-accent-foreground"
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs uppercase font-semibold">{locale}</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 mt-2 z-20 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code)
                      setLangOpen(false)
                    }}
                    className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      locale === lang.code ? "bg-accent font-semibold" : ""
                    }`}
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
          className="rounded-lg p-2 hover:bg-accent hover:text-accent-foreground"
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        <button className="relative rounded-lg p-2 hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        <div className="flex items-center gap-2 border-l border-border pl-3 lg:pl-4">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-semibold text-foreground">{userName || "Randhir kumar"}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  )
}
