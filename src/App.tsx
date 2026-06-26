import { useState, lazy, Suspense, useEffect } from "react"
import { I18nProvider, useTranslation } from "@/context/I18nContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { useAuthStore } from "@/store/authStore"
import { Toaster } from "sonner"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

const Login = lazy(() => import("@/pages/Login"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Orders = lazy(() => import("@/pages/Orders"))
const Products = lazy(() => import("@/pages/Products"))
const Categories = lazy(() => import("@/pages/Categories"))

function LoadingSpinner() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent" />
    </div>
  )
}

function MainApp() {
  const { isAuthenticated, logout } = useAuthStore()
  const { t } = useTranslation()
  const [currentView, setView] = useState(() => {
    const hash = window.location.hash.replace("#/", "")
    const validViews = ["dashboard", "orders", "products", "categories"]
    return validViews.includes(hash) ? hash : "dashboard"
  })
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)

  useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = `#/${currentView}`
      const titleKey = `nav.${currentView}` as any
      document.title = `${t(titleKey)} - FastCart`
    } else {
      document.title = "Login - FastCart"
    }
  }, [currentView, isAuthenticated, t])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "")
      const validViews = ["dashboard", "orders", "products", "categories"]
      if (validViews.includes(hash)) {
        setView(hash)
      }
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSpinner /></div>}>
        <Login />
      </Suspense>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <Sidebar
        currentView={currentView}
        setView={setView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={logout}
      />

      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-16 pl-0"}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} currentView={currentView} sidebarOpen={sidebarOpen} />

        <main className="flex-1 p-4 lg:p-6 mt-16 bg-background">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {currentView === "dashboard" && <Dashboard />}
              {currentView === "orders" && <Orders />}
              {currentView === "products" && <Products />}
              {currentView === "categories" && <Categories />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <MainApp />
        <Toaster position="top-center" richColors />
      </I18nProvider>
    </ThemeProvider>
  )
}