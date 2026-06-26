import { useState, useEffect } from "react"
import { useTranslation } from "@/context/I18nContext"
import api from "@/lib/api"
import { ShoppingBag, Tags, Sparkles, Users, TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LiveProduct {
  id: number
  productName: string
  price: number
  quantity: number
  categoryName: string
  color: string
}



interface LiveBrand {
  id: number
  brandName: string
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ products: 0, categories: 0, brands: 0, users: 0 })
  const [recentProducts, setRecentProducts] = useState<LiveProduct[]>([])
  const [topExpensive, setTopExpensive] = useState<LiveProduct[]>([])
  const [brands, setBrands] = useState<LiveBrand[]>([])
  const [activeTooltip, setActiveTooltip] = useState<{ month: string; orders: number; sales: string; x: number; y: number } | null>({
    month: "May",
    orders: 864,
    sales: "$12,450",
    x: 360,
    y: 90
  })

  const chartData = [
    { month: "Jan", orders: 240, sales: "$3,200", x: 40, y: 180 },
    { month: "Feb", orders: 320, sales: "$4,500", x: 120, y: 150 },
    { month: "Mar", orders: 280, sales: "$3,900", x: 200, y: 160 },
    { month: "Apr", orders: 590, sales: "$8,200", x: 280, y: 120 },
    { month: "May", orders: 864, sales: "$12,450", x: 360, y: 90 },
    { month: "Jun", orders: 610, sales: "$9,100", x: 440, y: 115 },
    { month: "Jul", orders: 750, sales: "$10,800", x: 520, y: 100 },
    { month: "Aug", orders: 920, sales: "$13,100", x: 600, y: 70 },
    { month: "Sep", orders: 680, sales: "$9,500", x: 680, y: 110 },
    { month: "Oct", orders: 810, sales: "$11,900", x: 760, y: 95 },
    { month: "Nov", orders: 880, sales: "$12,800", x: 840, y: 80 },
    { month: "Dec", orders: 980, sales: "$14,500", x: 920, y: 60 }
  ]

  const loadData = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get("/Product/get-products", { params: { PageNumber: 1, PageSize: 100 } }),
        api.get("/Category/get-categories"),
        api.get("/Brand/get-brands"),
        api.get("/UserProfile/get-user-profiles", { params: { PageNumber: 1, PageSize: 100 } })
      ])

      const [prodRes, catRes, brandRes, userRes] = results

      let prodCount = 0
      let prodData = []
      if (prodRes.status === "fulfilled") {
        const res = prodRes.value
        prodData = res.data.data?.products || res.data?.products || []
        prodCount = res.data.totalRecord || prodData.length || 0
        setRecentProducts(prodData.slice(0, 5))
        const sortedByPriceDesc = [...prodData].sort((a, b) => b.price - a.price)
        setTopExpensive(sortedByPriceDesc.slice(0, 3))
      } else {
        console.error("Failed to load products:", prodRes.reason)
      }

      let catCount = 0
      if (catRes.status === "fulfilled") {
        const res = catRes.value
        const catData = res.data.data || res.data || []
        catCount = catData.length || 0
      } else {
        console.error("Failed to load categories:", catRes.reason)
      }

      let brandCount = 0
      if (brandRes.status === "fulfilled") {
        const res = brandRes.value
        const brandData = res.data.data || res.data || []
        brandCount = res.data.totalRecord || brandData.length || 0
        setBrands(brandData.slice(0, 5))
      } else {
        console.error("Failed to load brands:", brandRes.reason)
      }

      let userCount = 0
      if (userRes.status === "fulfilled") {
        const res = userRes.value
        const userData = res.data.data || res.data || []
        userCount = res.data.totalRecord || res.data.totalCount || userData.length || 0
      } else {
        console.error("Failed to load user profiles:", userRes.reason)
      }

      setCounts({
        products: prodCount,
        categories: catCount,
        brands: brandCount,
        users: userCount
      })

      const failedEndpoints = []
      if (prodRes.status === "rejected") failedEndpoints.push("products")
      if (catRes.status === "rejected") failedEndpoints.push("categories")
      if (brandRes.status === "rejected") failedEndpoints.push("brands")
      if (userRes.status === "rejected") failedEndpoints.push("users")

      if (failedEndpoints.length > 0) {
        toast.error(`Failed to load some dashboard data: ${failedEndpoints.join(", ")}`)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const metrics = [
    { label: t("dashboard.productsCatalog"), value: counts.products, change: t("dashboard.liveStock"), icon: ShoppingBag, color: "text-blue-500 bg-blue-500/10" },
    { label: t("dashboard.productCategories"), value: counts.categories, change: t("dashboard.mappedSections"), icon: Tags, color: "text-orange-500 bg-orange-500/10" },
    { label: t("dashboard.registeredBrands"), value: counts.brands, change: t("dashboard.manufacturers"), icon: Sparkles, color: "text-emerald-500 bg-emerald-500/10" },
    { label: t("dashboard.registeredUsers"), value: counts.users, change: t("dashboard.activeProfiles"), icon: Users, color: "text-violet-500 bg-violet-500/10" }
  ]

  const linePath = chartData.map((d, i) => `${i === 0 ? "M" : "L"} ${d.x} ${d.y}`).join(" ")
  const areaPath = `${linePath} L 920 220 L 40 220 Z`

  if (loading && counts.products === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-foreground animate-fadeIn">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div key={idx} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <div className={`rounded-lg p-2 ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold">{m.value}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{m.change}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{t("dashboard.revenueChart")}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              <span>{t("dashboard.sales")}</span>
            </div>
          </div>
          <div className="relative flex-1 min-h-[220px]">
            <svg viewBox="0 0 960 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <g className="opacity-10 dark:opacity-20 stroke-border stroke-[1]" strokeDasharray="4 4">
                <line x1="40" y1="60" x2="920" y2="60" />
                <line x1="40" y1="120" x2="920" y2="120" />
                <line x1="40" y1="180" x2="920" y2="180" />
                <line x1="40" y1="220" x2="920" y2="220" />
              </g>

              <path d={areaPath} fill="url(#chartGrad)" />
              <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {chartData.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={activeTooltip?.month === d.month ? "6" : "4"}
                  className="fill-blue-600 stroke-background stroke-2 cursor-pointer transition-all"
                  onMouseEnter={() => setActiveTooltip({ ...d })}
                />
              ))}

              {chartData.map((d, i) => (
                <text
                  key={i}
                  x={d.x}
                  y="238"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {d.month}
                </text>
              ))}

              {activeTooltip && (
                <g transform={`translate(${activeTooltip.x - 60}, ${activeTooltip.y - 65})`}>
                  <rect width="120" height="50" rx="6" className="fill-slate-900 stroke-slate-800 dark:fill-slate-950 dark:stroke-slate-800 stroke shadow-xl" />
                  <text x="10" y="20" className="fill-white text-[10px] font-bold">{activeTooltip.month}</text>
                  <text x="10" y="38" className="fill-slate-300 text-[10px] font-semibold">
                    {activeTooltip.orders} {t("dashboard.ordersCount")} ({activeTooltip.sales})
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-semibold mb-4">{t("dashboard.mostExpensive")}</h2>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {topExpensive.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-bold text-foreground truncate max-w-[140px]">{p.productName}</p>
                  <p className="text-[10px] text-muted-foreground">{p.categoryName || t("dashboard.premiumCatalog")}</p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-orange-600/10 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 px-2 py-0.5 text-[10px] font-semibold">
                    ${p.price.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
          <h2 className="text-sm font-semibold mb-4">{t("dashboard.productPreview")}</h2>
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-3 pr-2">{t("dashboard.productId")}</th>
                  <th className="pb-3 pr-2">{t("dashboard.productName")}</th>
                  <th className="pb-3 pr-2">{t("dashboard.category")}</th>
                  <th className="pb-3 pr-2">{t("dashboard.price")}</th>
                  <th className="pb-3 pr-2">{t("dashboard.stock")}</th>
                  <th className="pb-3">{t("dashboard.color")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 font-semibold text-foreground pr-2">{p.id}</td>
                    <td className="py-3 text-muted-foreground font-semibold pr-2">{p.productName}</td>
                    <td className="py-3 text-muted-foreground pr-2">{p.categoryName}</td>
                    <td className="py-3 font-bold text-foreground pr-2">${p.price}</td>
                    <td className="py-3 text-muted-foreground pr-2">{p.quantity}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-[10px] font-semibold">
                        {p.color || t("dashboard.defaultColor")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
          <h2 className="text-sm font-semibold mb-4">{t("dashboard.registeredBrands")}</h2>
          <div className="space-y-4">
            {brands.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-semibold text-foreground">{b.brandName}</p>
                  <p className="text-[10px] text-muted-foreground">Brand ID: {b.id}</p>
                </div>
                <div className="h-6 w-6 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
