import { create } from "zustand"
import api from "@/lib/api"

export interface Role {
  id: string
  name: string
}

export interface UserProfile {
  id: string
  userId: string
  userName: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  userRoles?: Role[]
}

interface UserState {
  users: UserProfile[]
  roles: Role[]
  totalCount: number
  isLoading: boolean
  fetchUsers: (query?: string) => Promise<void>
  fetchRoles: () => Promise<void>
  deleteUser: (id: string) => Promise<void>
  addRoleToUser: (userId: string, roleId: string) => Promise<void>
  removeRoleFromUser: (userId: string, roleId: string) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  roles: [],
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
      let extracted: any[] = []
      if (Array.isArray(rawData)) {
        extracted = rawData
      } else if (rawData && typeof rawData === "object") {
        const items = rawData.items || rawData.data || rawData.profiles || []
        if (Array.isArray(items)) {
          extracted = items
        }
      }
      
      // Ensure all users have both id and userId defined
      const mappedUsers: UserProfile[] = extracted.map((u: any) => ({
        ...u,
        id: u.userId || u.id,
        userId: u.userId || u.id
      }))

      const total = response.data.totalRecord || response.data.totalCount || mappedUsers.length
      set({ users: mappedUsers, totalCount: total, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },
  fetchRoles: async () => {
    try {
      const response = await api.get("/UserProfile/get-user-roles")
      const rawData = response.data.data || response.data || []
      set({ roles: rawData })
    } catch (err) {
      throw err
    }
  },
  deleteUser: async (id) => {
    try {
      await api.delete("/UserProfile/delete-user", {
        params: { id }
      })
      set((state) => {
        const newUsers = state.users.filter((u) => u.userId !== id && u.id !== id)
        return {
          users: newUsers,
          totalCount: Math.max(0, state.totalCount - 1)
        }
      })
    } catch (err) {
      throw err
    }
  },
  addRoleToUser: async (userId, roleId) => {
    try {
      await api.post("/UserProfile/addrole-from-user", null, {
        params: { UserId: userId, RoleId: roleId }
      })
      // Update local store state reactively
      set((state) => {
        const newUsers = state.users.map((u) => {
          if (u.userId === userId) {
            const roleObj = state.roles.find((r) => r.id === roleId)
            const exists = u.userRoles?.some((r) => r.id === roleId)
            if (roleObj && !exists) {
              return {
                ...u,
                userRoles: [...(u.userRoles || []), roleObj]
              }
            }
          }
          return u
        })
        return { users: newUsers }
      })
    } catch (err) {
      throw err
    }
  },
  removeRoleFromUser: async (userId, roleId) => {
    try {
      await api.delete("/UserProfile/remove-role-from-user", {
        params: { UserId: userId, RoleId: roleId }
      })
      // Update local store state reactively
      set((state) => {
        const newUsers = state.users.map((u) => {
          if (u.userId === userId) {
            return {
              ...u,
              userRoles: (u.userRoles || []).filter((r) => r.id !== roleId)
            }
          }
          return u
        })
        return { users: newUsers }
      })
    } catch (err) {
      throw err
    }
  }
}))

