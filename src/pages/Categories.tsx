import { useState, useEffect } from "react"
import { useTranslation } from "@/context/I18nContext"
import { Smartphone, Plus, Pencil, Trash2, X, Image, Loader2, Sparkles } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

interface Category {
  id: number
  categoryName: string
  categoryImage: string
  subCategories?: { id: number; subCategoryName: string }[]
}

interface SubCategory {
  id: number
  subCategoryName: string
}

interface Brand {
  id: number
  brandName: string
}

export default function Categories() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"categories" | "brands" | "banners">("categories")

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [brands, setBrands] = useState<Brand[]>([])
  const [isBrandsLoading, setIsBrandsLoading] = useState(false)

  const [newCatOpen, setNewCatOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [catImageFile, setCatImageFile] = useState<File | null>(null)

  const [editCatOpen, setEditCatOpen] = useState(false)
  const [editCatId, setEditCatId] = useState<number | null>(null)
  const [editCatName, setEditCatName] = useState("")
  const [editCatImageFile, setEditCatImageFile] = useState<File | null>(null)
  const [editCatExistingImage, setEditCatExistingImage] = useState("")

  const [newBrandName, setNewBrandName] = useState("")
  const [editBrandOpen, setEditBrandOpen] = useState(false)
  const [editBrandId, setEditBrandId] = useState<number | null>(null)
  const [editBrandName, setEditBrandName] = useState("")

  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [isSubsLoading, setIsSubsLoading] = useState(false)
  const [newSubName, setNewSubName] = useState("")
  const [newSubCategoryId, setNewSubCategoryId] = useState<number | "">("")

  const [editSubOpen, setEditSubOpen] = useState(false)
  const [editSubId, setEditSubId] = useState<number | null>(null)
  const [editSubName, setEditSubName] = useState("")
  const [editSubCategoryId, setEditSubCategoryId] = useState<number | "">("")

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/Category/get-categories")
      const rawData = res.data.data || res.data || []
      setCategories(rawData)
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchSubCategories()
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) {
      toast.error("Please enter a category name")
      return
    }
    if (!catImageFile) {
      toast.error("Please select a category image")
      return
    }

    const toastId = toast.loading("Adding category...")
    try {
      const formData = new FormData()
      formData.append("CategoryName", newCatName.trim())
      formData.append("CategoryImage", catImageFile)

      await api.post("/Category/add-category", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      toast.success("Category added successfully!", { id: toastId })
      setNewCatName("")
      setCatImageFile(null)
      setNewCatOpen(false)
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to add category", { id: toastId })
    }
  }

  const handleEditClick = (cat: Category) => {
    setEditCatId(cat.id)
    setEditCatName(cat.categoryName)
    setEditCatExistingImage(cat.categoryImage)
    setEditCatImageFile(null)
    setEditCatOpen(true)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCatName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    const toastId = toast.loading("Updating category...")
    try {
      let fileToSend = editCatImageFile
      if (!fileToSend && editCatExistingImage) {
        const imageUrl = `${import.meta.env.VITE_API_BASE_URL || "https://store-api.softclub.tj"}/images/${editCatExistingImage}`
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        fileToSend = new File([blob], editCatExistingImage, { type: blob.type || "image/jpeg" })
      }

      if (!fileToSend) {
        toast.error("Category image is required")
        toast.dismiss(toastId)
        return
      }

      const formData = new FormData()
      formData.append("Id", String(editCatId))
      formData.append("CategoryName", editCatName.trim())
      formData.append("CategoryImage", fileToSend)

      await api.put("/Category/update-category", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      toast.success("Category updated successfully!", { id: toastId })
      setEditCatId(null)
      setEditCatName("")
      setEditCatImageFile(null)
      setEditCatExistingImage("")
      setEditCatOpen(false)
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to update category", { id: toastId })
    }
  }

  const handleDeleteCategory = async (id: number) => {
    const toastId = toast.loading("Deleting category...")
    try {
      await api.delete("/Category/delete-category", {
        params: { id }
      })
      toast.success("Category deleted successfully!", { id: toastId })
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category", { id: toastId })
    }
  }

  const fetchBrands = async () => {
    setIsBrandsLoading(true)
    try {
      const res = await api.get("/Brand/get-brands", { params: { PageNumber: 1, PageSize: 100 } })
      const rawData = res.data.data || res.data || []
      setBrands(rawData)
    } catch (err: any) {
      toast.error(err.message || "Failed to load brands")
    } finally {
      setIsBrandsLoading(false)
    }
  }

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName.trim()) {
      toast.error("Please enter a brand name")
      return
    }

    const toastId = toast.loading("Adding brand...")
    try {
      await api.post("/Brand/add-brand", null, {
        params: { BrandName: newBrandName.trim() }
      })
      toast.success("Brand added successfully!", { id: toastId })
      setNewBrandName("")
      fetchBrands()
    } catch (err: any) {
      toast.error(err.message || "Failed to add brand", { id: toastId })
    }
  }

  const handleEditBrandClick = (b: Brand) => {
    setEditBrandId(b.id)
    setEditBrandName(b.brandName)
    setEditBrandOpen(true)
  }

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editBrandName.trim()) {
      toast.error("Please enter a brand name")
      return
    }

    const toastId = toast.loading("Updating brand...")
    try {
      await api.put("/Brand/update-brand", null, {
        params: { Id: editBrandId, BrandName: editBrandName.trim() }
      })
      toast.success("Brand updated successfully!", { id: toastId })
      setEditBrandId(null)
      setEditBrandName("")
      setEditBrandOpen(false)
      fetchBrands()
    } catch (err: any) {
      toast.error(err.message || "Failed to update brand", { id: toastId })
    }
  }

  const handleDeleteBrand = async (id: number) => {
    const toastId = toast.loading("Deleting brand...")
    try {
      await api.delete("/Brand/delete-brand", {
        params: { id }
      })
      toast.success("Brand deleted successfully!", { id: toastId })
      fetchBrands()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete brand", { id: toastId })
    }
  }

  const fetchSubCategories = async () => {
    setIsSubsLoading(true)
    try {
      const res = await api.get("/SubCategory/get-sub-category")
      const rawData = res.data.data || res.data || []
      setSubCategories(rawData)
    } catch (err: any) {
      toast.error(err.message || "Failed to load subcategories")
    } finally {
      setIsSubsLoading(false)
    }
  }

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName.trim()) {
      toast.error("Please enter a subcategory name")
      return
    }
    if (!newSubCategoryId) {
      toast.error("Please select a parent category")
      return
    }

    const toastId = toast.loading("Adding subcategory...")
    try {
      await api.post("/SubCategory/add-sub-category", null, {
        params: {
          CategoryId: Number(newSubCategoryId),
          SubCategoryName: newSubName.trim()
        }
      })
      toast.success("Subcategory added successfully!", { id: toastId })
      setNewSubName("")
      setNewSubCategoryId("")
      fetchSubCategories()
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to add subcategory", { id: toastId })
    }
  }

  const handleEditSubClick = (sub: SubCategory, parentCatId?: number) => {
    setEditSubId(sub.id)
    setEditSubName(sub.subCategoryName)
    setEditSubCategoryId(parentCatId || "")
    setEditSubOpen(true)
  }

  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSubName.trim()) {
      toast.error("Please enter a subcategory name")
      return
    }
    if (!editSubCategoryId) {
      toast.error("Please select a parent category")
      return
    }

    const toastId = toast.loading("Updating subcategory...")
    try {
      await api.put("/SubCategory/update-sub-category", null, {
        params: {
          Id: editSubId,
          CategoryId: Number(editSubCategoryId),
          SubCategoryName: editSubName.trim()
        }
      })
      toast.success("Subcategory updated successfully!", { id: toastId })
      setEditSubId(null)
      setEditSubName("")
      setEditSubCategoryId("")
      setEditSubOpen(false)
      fetchSubCategories()
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to update subcategory", { id: toastId })
    }
  }

  const handleDeleteSubCategory = async (id: number) => {
    const toastId = toast.loading("Deleting subcategory...")
    try {
      await api.delete("/SubCategory/delete-sub-category", {
        params: { id }
      })
      toast.success("Subcategory deleted successfully!", { id: toastId })
      fetchSubCategories()
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subcategory", { id: toastId })
    }
  }

  const getParentCategory = (subId: number) => {
    for (const cat of categories) {
      if (cat.subCategories?.some((sub) => sub.id === subId)) {
        return cat
      }
    }
    return null
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex border-b border-border">
        {(["categories", "brands", "banners"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`categories.tab${tab.charAt(0).toUpperCase() + tab.slice(1) as "Categories" | "Brands" | "Banners"}`)}
          </button>
        ))}
      </div>

      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold">{t("categories.tabCategories")}</h2>
            <button
              onClick={() => {
                setNewCatName("")
                setCatImageFile(null)
                setNewCatOpen(true)
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{t("categories.addCategory")}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Smartphone className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No categories found</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group relative rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-blue-600/40 hover:shadow-md transition-all"
                >
                  <div className="rounded-xl overflow-hidden bg-accent h-16 w-16 flex items-center justify-center text-muted-foreground group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-colors mb-3">
                    {cat.categoryImage ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || "https://store-api.softclub.tj"}/images/${cat.categoryImage}`}
                        alt={cat.categoryName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Smartphone className="h-8 w-8" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground truncate max-w-full">{cat.categoryName}</span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="rounded-md p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="rounded-md p-1 hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "brands" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold mb-4">{t("categories.tabBrands")}</h2>
            {isBrandsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : brands.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No brands found</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3 pr-2">ID</th>
                      <th className="pb-3 pr-2">{t("categories.brandName")}</th>
                      <th className="pb-3 text-right">{t("categories.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {brands.map((b) => (
                      <tr key={b.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 font-semibold text-foreground pr-2">{b.id}</td>
                        <td className="py-3 text-muted-foreground pr-2">{b.brandName}</td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditBrandClick(b)}
                            className="inline-flex rounded-lg p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(b.id)}
                            className="inline-flex rounded-lg p-1 hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t("categories.brandPanelTitle")}</h3>
            <form onSubmit={handleAddBrand} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("categories.brandName")}</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {t("categories.addBrand")}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "banners" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
            <h2 className="text-sm font-semibold mb-4">{t("categories.tabBanners")}</h2>
            {isSubsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : subCategories.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <Smartphone className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No subcategories found</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3 pr-2">ID</th>
                      <th className="pb-3 pr-2">Subcategory Name</th>
                      <th className="pb-3 pr-2">Parent Category</th>
                      <th className="pb-3 text-right">{t("categories.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {subCategories.map((sub) => {
                      const parent = getParentCategory(sub.id)
                      return (
                        <tr key={sub.id} className="hover:bg-accent/40 transition-colors">
                          <td className="py-3 font-semibold text-foreground pr-2">{sub.id}</td>
                          <td className="py-3 text-muted-foreground pr-2">{sub.subCategoryName}</td>
                          <td className="py-3 text-muted-foreground pr-2">
                            {parent ? parent.categoryName : "Unmapped"}
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditSubClick(sub, parent?.id)}
                              className="inline-flex rounded-lg p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubCategory(sub.id)}
                              className="inline-flex rounded-lg p-1 hover:bg-destructive/10 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold">{t("categories.addBanner")}</h3>
            <form onSubmit={handleAddSubCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Parent Category</label>
                <select
                  required
                  value={newSubCategoryId}
                  onChange={(e) => setNewSubCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {t("categories.addBtn")}
              </button>
            </form>
          </div>
        </div>
      )}

      {newCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleAddCategory} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{t("categories.addCategory")}</h3>
              <button
                type="button"
                onClick={() => {
                  setNewCatOpen(false)
                  setNewCatName("")
                  setCatImageFile(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t("categories.newCategoryName")}</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t("categories.iconFile")}</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-blue-600/40 transition-colors">
                  <Image className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">
                    {catImageFile ? catImageFile.name : "Select Image File"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCatImageFile(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewCatOpen(false)
                  setNewCatName("")
                  setCatImageFile(null)
                }}
                className="h-8 rounded border border-border px-3 text-xs font-semibold hover:bg-accent"
              >
                {t("categories.cancelBtn")}
              </button>
              <button
                type="submit"
                className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-sm"
              >
                {t("categories.addBtn")}
              </button>
            </div>
          </form>
        </div>
      )}

      {editCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleUpdateCategory} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Category</h3>
              <button
                type="button"
                onClick={() => {
                  setEditCatOpen(false)
                  setEditCatId(null)
                  setEditCatName("")
                  setEditCatImageFile(null)
                  setEditCatExistingImage("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t("categories.newCategoryName")}</label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t("categories.iconFile")}</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-blue-600/40 transition-colors">
                  <Image className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">
                    {editCatImageFile ? editCatImageFile.name : "Keep existing image (or click to change)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditCatImageFile(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditCatOpen(false)
                  setEditCatId(null)
                  setEditCatName("")
                  setEditCatImageFile(null)
                  setEditCatExistingImage("")
                }}
                className="h-8 rounded border border-border px-3 text-xs font-semibold hover:bg-accent"
              >
                {t("categories.cancelBtn")}
              </button>
              <button
                type="submit"
                className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {editBrandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleUpdateBrand} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Brand</h3>
              <button
                type="button"
                onClick={() => {
                  setEditBrandOpen(false)
                  setEditBrandId(null)
                  setEditBrandName("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">{t("categories.brandName")}</label>
                <input
                  type="text"
                  required
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditBrandOpen(false)
                  setEditBrandId(null)
                  setEditBrandName("")
                }}
                className="h-8 rounded border border-border px-3 text-xs font-semibold hover:bg-accent"
              >
                {t("categories.cancelBtn")}
              </button>
              <button
                type="submit"
                className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {editSubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleUpdateSubCategory} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Subcategory</h3>
              <button
                type="button"
                onClick={() => {
                  setEditSubOpen(false)
                  setEditSubId(null)
                  setEditSubName("")
                  setEditSubCategoryId("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={editSubName}
                  onChange={(e) => setEditSubName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Parent Category</label>
                <select
                  required
                  value={editSubCategoryId}
                  onChange={(e) => setEditSubCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditSubOpen(false)
                  setEditSubId(null)
                  setEditSubName("")
                  setEditSubCategoryId("")
                }}
                className="h-8 rounded border border-border px-3 text-xs font-semibold hover:bg-accent"
              >
                {t("categories.cancelBtn")}
              </button>
              <button
                type="submit"
                className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
