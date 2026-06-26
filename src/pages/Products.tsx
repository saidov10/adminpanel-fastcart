import { useState, useEffect } from "react"
import { useTranslation } from "@/context/I18nContext"
import { ShoppingBag, Plus, Search, Image, X, ChevronRight, Check, Pencil, Trash2, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

export default function Products() {
  const { t } = useTranslation()
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  
  const [viewMode, setViewMode] = useState<"list" | "form">("list")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [stockFilter, setStockFilter] = useState("All")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => {
      clearTimeout(handler)
    }
  }, [search])
  
  const [isProductsLoading, setIsProductsLoading] = useState(false)
  const [editProductId, setEditProductId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    brandId: "",
    colorId: "",
    subCategoryId: "",
    price: "",
    hasDiscount: false,
    discountPrice: "",
    quantity: "",
    code: "",
    weight: "",
    size: ""
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  // New Color Modal states
  const [showAddColorModal, setShowAddColorModal] = useState(false)
  const [newColorName, setNewColorName] = useState("")
  const [isAddingColor, setIsAddingColor] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const loadData = async () => {
    try {
      const [catRes, brandRes, colorRes] = await Promise.all([
        api.get("/Category/get-categories"),
        api.get("/Brand/get-brands", { params: { PageNumber: 1, PageSize: 100 } }),
        api.get("/Color/get-colors", { params: { PageNumber: 1, PageSize: 100 } })
      ])
      setCategories(catRes.data.data || catRes.data || [])
      setBrands(brandRes.data.data || brandRes.data || [])
      setColors(colorRes.data.data || colorRes.data || [])
    } catch (err: any) {
      toast.error("Failed to load categories/brands/colors: " + err.message)
    }
  }

  const fetchProducts = async () => {
    setIsProductsLoading(true)
    try {
      const res = await api.get("/Product/get-products", {
        params: {
          PageNumber: 1,
          PageSize: 100,
          ProductName: debouncedSearch || undefined,
          CategoryId: catFilter === "All" ? undefined : Number(catFilter)
        }
      })
      const prodData = res.data.data?.products || res.data?.products || []
      setProducts(prodData)
    } catch (err: any) {
      toast.error(err.message || "Failed to load products")
    } finally {
      setIsProductsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [debouncedSearch, catFilter])

  const handleCreateColor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColorName.trim()) {
      toast.error("Please enter a color name")
      return
    }

    setIsAddingColor(true)
    const toastId = toast.loading("Creating color...")
    try {
      const res = await api.post("/Color/add-color", null, {
        params: { ColorName: newColorName.trim() }
      })
      toast.success("Color created successfully!", { id: toastId })
      setNewColorName("")
      setShowAddColorModal(false)
      
      // Reload colors list
      const colorRes = await api.get("/Color/get-colors", { params: { PageNumber: 1, PageSize: 100 } })
      const updatedColors = colorRes.data.data || colorRes.data || []
      setColors(updatedColors)

      // Auto-select newly created color
      const newColorId = res.data.data || (updatedColors.find((c: any) => c.colorName.toLowerCase() === newColorName.trim().toLowerCase())?.id)
      if (newColorId) {
        setFormData((prev) => ({ ...prev, colorId: String(newColorId) }))
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || "Failed to create color"
      toast.error(serverMessage, { id: toastId })
    } finally {
      setIsAddingColor(false)
    }
  }

  const handleEditProductClick = async (p: any) => {
    const toastId = toast.loading("Loading product details...")
    try {
      const res = await api.get("/Product/get-product-by-id", { params: { id: p.id } })
      const fullProduct = res.data.data || res.data
      
      setEditProductId(fullProduct.id)
      setFormData({
        productName: fullProduct.productName || "",
        description: fullProduct.description || "",
        brandId: String(fullProduct.brandId || ""),
        colorId: String(fullProduct.colorId || ""),
        subCategoryId: String(fullProduct.subCategoryId || ""),
        price: String(fullProduct.price || ""),
        hasDiscount: !!fullProduct.hasDiscount,
        discountPrice: String(fullProduct.discountPrice || ""),
        quantity: String(fullProduct.quantity || ""),
        code: fullProduct.code || "",
        weight: fullProduct.weight || "",
        size: fullProduct.size || ""
      })
      setSelectedFiles([])
      setViewMode("form")
      toast.dismiss(toastId)
    } catch (err: any) {
      const serverMessage = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || "Failed to load product details"
      toast.error(serverMessage, { id: toastId })
    }
  }

  const handleDeleteProduct = async (id: number) => {
    const toastId = toast.loading("Deleting product...")
    try {
      await api.delete("/Product/delete-product", { params: { id } })
      toast.success("Product deleted successfully!", { id: toastId })
      fetchProducts()
    } catch (err: any) {
      const serverMessage = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || "Failed to delete product"
      toast.error(serverMessage, { id: toastId })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productName.trim()) return toast.error("Product name is required")
    if (!formData.brandId) return toast.error("Brand is required")
    if (!formData.colorId) return toast.error("Color is required")
    if (!formData.subCategoryId) return toast.error("Subcategory is required")
    if (!formData.price) return toast.error("Price is required")
    if (!formData.quantity) return toast.error("Quantity is required")
    if (!formData.code.trim()) return toast.error("SKU/Code is required")
    
    if (formData.hasDiscount) {
      if (!formData.discountPrice) {
        return toast.error("Discount price is required when discount is enabled")
      }
      const priceNum = Number(formData.price)
      const discountNum = Number(formData.discountPrice)
      if (isNaN(discountNum) || discountNum <= 0) {
        return toast.error("Discount price must be a valid number greater than 0")
      }
      if (discountNum >= priceNum) {
        return toast.error("Discount price must be less than the regular price")
      }
    }

    if (!editProductId && selectedFiles.length === 0) {
      return toast.error("At least one product image is required")
    }

    const toastId = toast.loading(editProductId ? "Updating product..." : "Adding product...")
    try {
      if (editProductId) {
        await api.put("/Product/update-product", null, {
          params: {
            Id: editProductId,
            BrandId: Number(formData.brandId),
            ColorId: Number(formData.colorId),
            ProductName: formData.productName.trim(),
            Description: formData.description.trim(),
            Quantity: Number(formData.quantity),
            Weight: formData.weight || undefined,
            Size: formData.size || undefined,
            Code: formData.code.trim(),
            Price: Number(formData.price),
            HasDiscount: formData.hasDiscount,
            DiscountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
            SubCategoryId: Number(formData.subCategoryId)
          }
        })

        if (selectedFiles.length > 0) {
          const imgFormData = new FormData()
          imgFormData.append("ProductId", String(editProductId))
          selectedFiles.forEach((file) => {
            imgFormData.append("Files", file)
          })
          await api.post("/Product/add-image-to-product", imgFormData, {
            headers: { "Content-Type": "multipart/form-data" }
          })
        }

        toast.success("Product updated successfully!", { id: toastId })
      } else {
        const addFormData = new FormData()
        selectedFiles.forEach((file) => {
          addFormData.append("Images", file)
        })
        addFormData.append("BrandId", formData.brandId)
        addFormData.append("ColorId", formData.colorId)
        addFormData.append("ProductName", formData.productName.trim())
        addFormData.append("Description", formData.description.trim())
        addFormData.append("Quantity", formData.quantity)
        addFormData.append("Price", formData.price)
        addFormData.append("HasDiscount", String(formData.hasDiscount))
        addFormData.append("DiscountPrice", formData.hasDiscount ? formData.discountPrice : "0")
        addFormData.append("SubCategoryId", formData.subCategoryId)
        addFormData.append("Code", formData.code.trim())
        if (formData.weight) addFormData.append("Weight", formData.weight)
        if (formData.size) addFormData.append("Size", formData.size)

        await api.post("/Product/add-product", addFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        })

        toast.success("Product added successfully!", { id: toastId })
      }

      setShowSuccessModal(true)
      fetchProducts()
    } catch (err: any) {
      const serverMessage = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || "Failed to save product"
      toast.error(serverMessage, { id: toastId })
    }
  }

  const resetForm = () => {
    setFormData({
      productName: "",
      description: "",
      brandId: "",
      colorId: "",
      subCategoryId: "",
      price: "",
      hasDiscount: false,
      discountPrice: "",
      quantity: "",
      code: "",
      weight: "",
      size: ""
    })
    setSelectedFiles([])
    setEditProductId(null)
  }

  const filteredProducts = products.filter((p) => {
    const matchesStock =
      stockFilter === "All" ||
      (stockFilter === "inStock" && p.quantity > 0) ||
      (stockFilter === "outOfStock" && p.quantity === 0)
    return matchesStock
  })

  return (
    <div className="space-y-6 text-foreground">
      {viewMode === "list" ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetForm()
                  setViewMode("form")
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t("products.add")}</span>
              </button>
            </div>
          </div>

          {products.length === 0 && search === "" && catFilter === "All" && stockFilter === "All" && !isProductsLoading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 text-slate-400 dark:text-slate-500 mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{t("products.empty")}</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                Upload image, set inventory metrics, and assign tags to catalog your digital products.
              </p>
              <button
                onClick={() => {
                  resetForm()
                  setViewMode("form")
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{t("products.add")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4 items-center">
                <div className="col-span-2 relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("products.search")}
                    className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-4 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                >
                  <option value="All">{t("products.category")}: {t("products.all")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                >
                  <option value="All">{t("products.stockStatus")}: {t("products.all")}</option>
                  <option value="inStock">{t("products.inStock")}</option>
                  <option value="outOfStock">{t("products.outOfStock")}</option>
                </select>
              </div>

              {isProductsLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 text-slate-400 dark:text-slate-500 mb-4">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">No products found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    There are no products matching your search or active filters. Try changing your filters.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                          <th className="p-4">Thumbnail</th>
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Color</th>
                          <th className="p-4">{t("products.price")}</th>
                          <th className="p-4">{t("products.stock")}</th>
                          <th className="p-4">{t("products.status")}</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                            <td className="p-4">
                              {p.image ? (
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL || "https://store-api.softclub.tj"}/images/${p.image}`}
                                  alt={p.productName}
                                  className="h-9 w-9 rounded-lg object-cover bg-accent border border-border"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground border border-border">
                                  <Image className="h-4 w-4" />
                                </div>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-foreground">{p.productName}</td>
                            <td className="p-4 text-muted-foreground">{p.categoryName}</td>
                            <td className="p-4 text-muted-foreground">
                              {p.color ? (
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="h-3.5 w-3.5 rounded-full border border-border/80 shadow-xs"
                                    style={{ backgroundColor: p.color }}
                                  />
                                  <span>{p.color}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/60">-</span>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-foreground">
                              {p.hasDiscount && p.discountPrice > 0 ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground">${p.discountPrice.toLocaleString()}</span>
                                    <span className="rounded bg-red-500/15 text-red-500 px-1 py-0.5 text-[9px] font-bold">
                                      -{Math.round(((p.price - p.discountPrice) / p.price) * 100)}%
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground line-through">${p.price.toLocaleString()}</div>
                                </div>
                              ) : (
                                <span className="font-semibold text-foreground">${p.price?.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground">{p.quantity}</td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                  p.quantity > 0
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-destructive/10 text-destructive dark:bg-destructive/20"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${p.quantity > 0 ? "bg-emerald-500" : "bg-destructive"}`} />
                                {t(p.quantity > 0 ? "products.inStock" : "products.outOfStock")}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="inline-flex rounded-lg p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="inline-flex rounded-lg p-1.5 hover:bg-destructive/10 text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
          )}
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                {t("nav.products")}
              </button>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                {editProductId ? t("products.edit") : t("products.addNew")}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode("list")
                  resetForm()
                }}
                className="h-8 rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:bg-accent text-foreground"
              >
                {t("categories.cancelBtn")}
              </button>
              <button
                type="submit"
                className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs font-semibold shadow-sm transition-colors"
              >
                {editProductId ? "Save" : t("categories.addBtn")}
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold">{t("products.basicInfo")}</h3>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{t("products.title")}</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{t("products.desc")}</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold">{t("products.media")}</h3>
                <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-600/40 transition-colors cursor-pointer flex flex-col items-center">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs font-medium text-foreground">{t("products.dragDrop")}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files)
                        setSelectedFiles((prev) => [...prev, ...filesArray])
                      }
                    }}
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative group h-16 w-16 rounded-lg overflow-hidden border border-border shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold">Properties</h3>
                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g. 1.2kg"
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g. Large"
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold">Categorization</h3>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Subcategory</label>
                  <select
                    required
                    value={formData.subCategoryId}
                    onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                  >
                    <option value="">Select Subcategory</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.categoryName}>
                        {cat.subCategories?.map((sub: any) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.subCategoryName}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Brand</label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brandName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">{t("products.color")}</label>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <select
                        required
                        value={formData.colorId}
                        onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                        className="w-full h-9 rounded-lg border border-input bg-background pl-8 pr-3 py-1 text-xs outline-none focus:border-ring"
                      >
                        <option value="">Select Color</option>
                        {colors.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.colorName}
                          </option>
                        ))}
                      </select>
                      {formData.colorId && (
                        <span
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border border-border/80 shadow-xs"
                          style={{
                            backgroundColor: colors.find((c) => String(c.id) === formData.colorId)?.colorName || "transparent"
                          }}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddColorModal(true)}
                      className="h-9 px-3 rounded-lg border border-input bg-background hover:bg-accent text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold">{t("products.pricing")}</h3>
                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">{t("products.price")}</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="15.00"
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 col-span-2 py-1">
                    <input
                      type="checkbox"
                      id="hasDiscount"
                      checked={formData.hasDiscount}
                      onChange={(e) => setFormData({ ...formData, hasDiscount: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="hasDiscount" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                      Has Discount
                    </label>
                  </div>
                  {formData.hasDiscount && (
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Discount Price</label>
                      <input
                        type="number"
                        step="0.01"
                        required={formData.hasDiscount}
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        placeholder="12.00"
                        className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold">{t("products.inventory")}</h3>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Code (SKU)</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Stock / Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {showAddColorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleCreateColor} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 text-foreground">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Color</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddColorModal(false)
                  setNewColorName("")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border shadow-md">
                  <input
                    type="color"
                    value={newColorName.startsWith("#") && newColorName.length === 7 ? newColorName : "#3b82f6"}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer border-0 p-0"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{ backgroundColor: newColorName || "transparent" }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Color Name / Hex Code</label>
                  <input
                    type="text"
                    required
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="e.g. Red, Blue, #ff0000"
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-ring"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddColorModal(false)
                  setNewColorName("")
                }}
                className="h-8 rounded border border-border px-3 text-xs font-semibold hover:bg-accent"
              >
                {t("categories.cancelBtn")}
              </button>
              <button
                type="submit"
                disabled={isAddingColor}
                className="h-8 rounded bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-sm"
              >
                {t("categories.addBtn")}
              </button>
            </div>
          </form>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl text-center space-y-4 text-foreground">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-2">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-md font-bold">{t("categories.successHeader")}</h3>
            <p className="text-xs text-muted-foreground">{t("categories.successDesc")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false)
                  setViewMode("list")
                  resetForm()
                }}
                className="flex-1 h-9 rounded border border-border text-xs font-semibold hover:bg-accent"
              >
                {t("categories.successProducts")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false)
                  resetForm()
                }}
                className="flex-1 h-9 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                {t("categories.successAddNew")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
