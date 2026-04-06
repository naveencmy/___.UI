import axios, { AxiosError } from "axios"

/* =========================================================
   BASE CONFIG (ENV SAFE)
========================================================= */
const BASE_URL = import.meta.env.VITE_API_URL || "/api"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

/* =========================================================
   INTERCEPTORS
========================================================= */

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const status = err.response?.status

    if (status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    console.error("[API ERROR]", {
      url: err.config?.url,
      method: err.config?.method,
      data: err.response?.data,
      message: err.message,
    })

    return Promise.reject(err)
  }
)

/* =========================================================
   HELPER (REMOVE .data REPETITION)
========================================================= */
const unwrap = <T>(promise: Promise<any>): Promise<T> =>
  promise.then((res) => res.data)

/* =========================================================
   TYPES
========================================================= */

export interface AuthUser {
  id: number
  username: string
  role: string
}

export interface InventoryMovement {
  id: number
  name: string
  unit_name: string
  quantity: number
  movement_type: string
  created_at: string
}

/* =========================================================
   AUTH API
========================================================= */

export const AuthAPI = {
  login: (data: { username: string; password: string }) =>
    unwrap<{ token: string; id: string; role: string }>(
      api.post("/auth/login", data)
    ),

  me: () =>
    unwrap<AuthUser>(api.get("/auth/me")),

  changePassword: (data: {
    current: string
    newPassword: string
  }) =>
    unwrap(api.post("/auth/change-password", data)),
}

/* =========================================================
   USERS API (SETTINGS PAGE)
========================================================= */

export const UserAPI = {
  getUsers: () =>
    unwrap<any[]>(api.get("/users")),

  create: (data: {
    username: string
    password: string
    role: string
  }) =>
    unwrap(api.post("/users", data)),

  toggle: (id: number) =>
    unwrap(api.patch(`/users/${id}/toggle`)),

  update: (id: number, data: { role: string }) =>
    unwrap(api.put(`/users/${id}`, data)),
}

/* =========================================================
   PRODUCTS
========================================================= */

export const ProductAPI = {
  getAll: () =>
    unwrap(api.get("/products")),

  search: (q: string) =>
    unwrap(api.get(`/products/search?q=${encodeURIComponent(q)}`)),

  barcode: (code: string) =>
    unwrap(api.get(`/products/barcode/${code}`)),

  create: (data: any) =>
    unwrap(api.post("/products", data)),

  update: (id: number, data: any) =>
    unwrap(api.put(`/products/${id}`, data)),

  delete: (id: number) =>
    unwrap(api.delete(`/products/${id}`)),
}

/* =========================================================
   INVENTORY
========================================================= */

export const InventoryAPI = {
  getAll: () =>
    unwrap(api.get("/inventory")),

  movements: () =>
    unwrap(api.get("/inventory/movements")),

  lowStock: () =>
    unwrap(api.get("/inventory/low-stock")),

  adjust: (data: {
    product_unit_id: number
    quantity_change: number
    reason: string
  }) =>
    unwrap(api.post("/inventory/adjust", data)),
}

/* =========================================================
   SALES
========================================================= */

export const SalesAPI = {
  create: (data: any) =>
    unwrap(api.post("/sales/create", data)),

  getById: (id: number) =>
    unwrap(api.get(`/sales/${id}`)),

  returnSale: (data: any) =>
    unwrap(api.post("/sales/return", data)),
}

/* =========================================================
   PURCHASE
========================================================= */

export const PurchaseAPI = {
  create: (data: any) =>
    unwrap(api.post("/purchase/create", data)),

  getById: (id: number) =>
    unwrap(api.get(`/purchase/${id}`)),
}

/* =========================================================
   PARTIES
========================================================= */

export const PartyAPI = {
  getAll: () =>
    unwrap(api.get("/parties")),

  ledger: (id: number) =>
    unwrap(api.get(`/parties/${id}/ledger`)),

  create: (data: any) =>
    unwrap(api.post("/parties", data)),

  update: (id: number, data: any) =>
    unwrap(api.put(`/parties/${id}`, data)),

  delete: (id: number) =>
    unwrap(api.delete(`/parties/${id}`)),
}

/* =========================================================
   REPORTS
========================================================= */

export const ReportAPI = {
  dashboard: () =>
    unwrap(api.get("/reports/dashboard")),

  sales: (from: string, to: string) =>
    unwrap(api.get(`/reports/sales?from=${from}&to=${to}`)),

  inventoryValue: () =>
    unwrap(api.get("/reports/inventory-value")),

  receivables: () =>
    unwrap(api.get("/reports/receivables")),
}

/* =========================================================
   BACKUP & RESTORE
========================================================= */

export const BackupAPI = {
  create: () =>
    unwrap(api.post("/backup/create")),

  restore: async (file: File) => {
    const form = new FormData()
    form.append("file", file)

    return unwrap(
      api.post("/backup/restore", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    )
  },
}

/* =========================================================
   EXPORT CLIENT
========================================================= */

export default api