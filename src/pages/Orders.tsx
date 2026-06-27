import { useState, useEffect } from "react"
import { Search, Trash2, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"

export default function Orders() {
  const { 
    users, 
    roles, 
    isLoading, 
    fetchUsers, 
    fetchRoles, 
    deleteUser, 
    addRoleToUser, 
    removeRoleFromUser 
  } = useUserStore()
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchUsers(search).catch((err) => {
      toast.error(err.message || "Failed to fetch users")
    })
  }, [search, fetchUsers])

  useEffect(() => {
    fetchRoles().catch((err) => {
      console.error("Failed to fetch roles:", err)
    })
  }, [fetchRoles])

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?")
    if (!isConfirmed) return

    const toastId = toast.loading("Deleting user...")
    try {
      await deleteUser(id)
      toast.success("User deleted successfully!", { id: toastId })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user", { id: toastId })
    }
  }

  const handleToggleRole = async (userId: string, roleId: string, hasRole: boolean) => {
    const toastId = toast.loading(hasRole ? "Removing role..." : "Assigning role...")
    try {
      if (hasRole) {
        await removeRoleFromUser(userId, roleId)
        toast.success("Role removed successfully!", { id: toastId })
      } else {
        await addRoleToUser(userId, roleId)
        toast.success("Role assigned successfully!", { id: toastId })
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update role", { id: toastId })
    }
  }

  return (
    <div className="space-y-6 text-foreground animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-4 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 text-slate-400 dark:text-slate-500 mb-4">
            <User className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No users found</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            There are no users registered matching the filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">First Name</th>
                  <th className="p-4">Last Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Roles</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.userId} className="hover:bg-accent/40 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{u.userName}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4 text-foreground">{u.firstName || "-"}</td>
                    <td className="p-4 text-foreground">{u.lastName || "-"}</td>
                    <td className="p-4 text-muted-foreground">{u.phoneNumber || "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {roles.map((role) => {
                          const hasRole = u.userRoles?.some((r) => r.id === role.id) || false
                          return (
                            <button
                              key={role.id}
                              onClick={() => handleToggleRole(u.userId, role.id, hasRole)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all border ${
                                hasRole
                                  ? role.name.toLowerCase() === "admin"
                                    ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-600/20 cursor-pointer"
                                    : "bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/20 cursor-pointer"
                                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80 border-transparent cursor-pointer"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                hasRole
                                  ? role.name.toLowerCase() === "admin"
                                    ? "bg-indigo-500 animate-pulse"
                                    : "bg-emerald-500 animate-pulse"
                                  : "bg-muted-foreground"
                              }`} />
                              {role.name}
                            </button>
                          )
                        })}
                        {u.userRoles?.filter(r => !roles.some(sysRole => sysRole.id === r.id)).map((role) => (
                          <div
                            key={role.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-600/15 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-500/20 shadow-sm"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                            {role.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(u.userId)}
                        className="inline-flex rounded-lg p-1.5 hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

