import { create } from "zustand"
import api from "@/lib/api"

export interface UserProfile {
  id: string
  userName: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

interface UserState {
  users: UserProfile[]
  totalCount: number
  isLoading: boolean
  fetchUsers: (query?: string) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  totalCount: 0,
  isLoading: false,
  fetchUsers: async (query = "") => {
    set({ isLoading: true })
    try {
      const response = await api.get("/UserProfile/get-user-profiles", {
        params: {
          UserName: query || undefined,
          PageNumber: 1,
          PageSize: 100
        }
      })
      const rawData = response.data.data || response.data
      let extracted: UserProfile[] = []
      if (Array.isArray(rawData)) {
        extracted = rawData
      } else if (rawData && typeof rawData === "object") {
        const items = rawData.items || rawData.data || rawData.profiles || []
        if (Array.isArray(items)) {
          extracted = items
        }
      }
      const total = response.data.totalRecord || response.data.totalCount || extracted.length
      set({ users: extracted, totalCount: total, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },
  deleteUser: async (id) => {
    try {
      await api.delete("/UserProfile/delete-user", {
        params: { id }
      })
      set((state) => {
        const newUsers = state.users.filter((u) => u.id !== id)
        return {
          users: newUsers,
          totalCount: Math.max(0, state.totalCount - 1)
        }
      })
    } catch (err) {
      throw err
    }
  }
}))
