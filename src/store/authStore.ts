import { create } from "zustand"
import api from "@/lib/api"

interface AuthState {
  token: string | null
  userName: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userName: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("admin-token") || null,
  userName: localStorage.getItem("admin-username") || null,
  isAuthenticated: !!localStorage.getItem("admin-token"),
  isLoading: false,
  login: async (userName, password) => {
    set({ isLoading: true })
    try {
      const response = await api.post("/Account/login", { userName, password })
      const { data, errors, statusCode } = response.data

      if (statusCode !== 200 || !data) {
        const errMsg = errors && errors.length > 0 ? errors[0] : "Login failed"
        throw new Error(errMsg)
      }

      const rolesResponse = await api.get("/UserProfile/get-user-roles", {
        headers: {
          Authorization: `Bearer ${data}`
        }
      })

      const rolesData = rolesResponse.data.data || rolesResponse.data || []
      let isAdmin = false
      if (Array.isArray(rolesData)) {
        isAdmin = rolesData.some((r) => {
          if (typeof r === "string") {
            return r.trim().toLowerCase() === "admin"
          }
          if (r && typeof r === "object") {
            const val = r.name || r.role || r.roleName
            return val && String(val).trim().toLowerCase() === "admin"
          }
          return false
        })
      } else if (typeof rolesData === "string") {
        isAdmin = rolesData.trim().toLowerCase() === "admin"
      }

      if (!isAdmin) {
        throw new Error("Access denied: Admin role required")
      }

      localStorage.setItem("admin-token", data)
      localStorage.setItem("admin-username", userName)
      set({ token: data, userName, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      const serverMessage = error.response?.data?.errors?.[0] || error.message || "An error occurred"
      throw new Error(serverMessage)
    }
  },
  logout: () => {
    localStorage.removeItem("admin-token")
    localStorage.removeItem("admin-username")
    set({ token: null, userName: null, isAuthenticated: false })
  }
}))
