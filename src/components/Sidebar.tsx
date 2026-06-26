import { useEffect } from "react"
import { useTranslation } from "@/context/I18nContext"
import { LayoutDashboard, ClipboardList, ShoppingBag, Tags, LogOut, ShoppingCart, X } from "lucide-react"
import { useUserStore } from "@/store/userStore"

interface SidebarProps {
  currentView: string
  setView: (view: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onLogout: () => void
}

export default function Sidebar({ currentView, setView, isOpen, setIsOpen, onLogout }: SidebarProps) {
  const { t } = useTranslation()
  const { totalCount, fetchUsers } = useUserStore()

  useEffect(() => {
    fetchUsers().catch(() => {})
  }, [currentView, fetchUsers])

  const menuItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { id: "orders", label: t("nav.orders"), icon: ClipboardList, badge: totalCount },
    { id: "products", label: t("nav.products"), icon: ShoppingBag },
    { id: "categories", label: t("nav.categories"), icon: Tags }
  ]

  const handleNav = (id: string) => {
    setView(id)
    setIsOpen(false)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ${
          isOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"
        }`}
      >
        <div className={`flex h-16 items-center border-b border-border ${isOpen ? "justify-between px-6" : "justify-center px-2"}`}>
          <div className={`flex items-center gap-2 font-bold text-lg ${isOpen ? "" : "lg:justify-center"}`}>
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
            </div>
            <span className={`text-foreground ${isOpen ? "block" : "lg:hidden"}`}>
              fast<span className="text-blue-600">cart</span>
            </span>
          </div>
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-accent hover:text-accent-foreground lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className={`flex-1 space-y-1 py-6 overflow-y-auto ${isOpen ? "px-4" : "px-2"}`}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center transition-colors ${
                  isOpen ? "w-full justify-between px-3 py-2 text-sm font-medium rounded-lg" : "w-full lg:w-10 lg:h-10 justify-center lg:mx-auto py-2 rounded-lg"
                } ${
                  isActive
                    ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
              >
                <div className={`flex items-center ${isOpen ? "gap-3" : "gap-0 lg:justify-center"}`}>
                  <Icon className="h-5 w-5" />
                  <span className={`${isOpen ? "block" : "lg:hidden"}`}>{item.label}</span>
                </div>
                {isOpen && item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-blue-600/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className={`border-t border-border ${isOpen ? "p-4" : "py-4 px-2"}`}>
          <button
            onClick={onLogout}
            className={`flex items-center text-destructive hover:bg-destructive/10 transition-colors ${
              isOpen ? "w-full gap-3 px-3 py-2 text-sm font-medium rounded-lg" : "w-full lg:w-10 lg:h-10 justify-center lg:mx-auto py-2 rounded-lg"
            }`}
          >
            <LogOut className="h-5 w-5" />
            <span className={`${isOpen ? "block" : "lg:hidden"}`}>{t("nav.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
