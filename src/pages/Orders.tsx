import { useState, useEffect } from "react"
import { Search, Trash2, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"

export default function Orders() {
  const { users, isLoading, fetchUsers, deleteUser } = useUserStore()
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchUsers(search).catch((err) => {
      toast.error(err.message || "Failed to fetch users")
    })
  }, [search, fetchUsers])

  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Deleting user...")
    try {
      await deleteUser(id)
      toast.success("User deleted successfully!", { id: toastId })
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user", { id: toastId })
    }
  }

  return (
    <div className="space-y-6 text-foreground">
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
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-accent/40 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{u.userName}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4 text-foreground">{u.firstName || "-"}</td>
                    <td className="p-4 text-foreground">{u.lastName || "-"}</td>
                    <td className="p-4 text-muted-foreground">{u.phoneNumber || "-"}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="inline-flex rounded-lg p-1.5 hover:bg-destructive/10 text-destructive transition-colors"
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
