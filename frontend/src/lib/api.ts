import axios from "axios";

const BASE_URL = "http://localhost:5000";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error.response?.data ?? error.message);
    throw error;
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  role: string;
}

export interface AuthLoginResponse {
  token: string;
  user: AuthUser;
}

export interface ProductUnit {
  unit_id: number;
  unit_name: string;
  barcode: string;
  purchase_rate: number;
  sales_rate: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  reorder_level: number;
  units: ProductUnit[];
}

export interface ProductSearchItem {
  id: number;
  name: string;
  unit_id: number;
  barcode: string;
  sales_rate: number;
  purchase_rate: number;
  unit_name: string;
}

export interface InventoryItem {
  product_unit_id: number;
  name: string;
  unit_name: string;
  quantity: number;
  purchase_rate: number;
  stock_value: number;
}

export interface InventoryMovement {
  id: number;
  date: string;
  type: string;
  reference: string;
  quantity: number;
  unit_name: string;
}

export interface AdjustStockRequest {
  product_unit_id: number;
  quantity_change: number;
  reason: string;
}

export interface SaleItem {
  product_unit_id: number;
  quantity: number;
  rate: number;
  total: number;
}

export interface PaymentEntry {
  method: "cash" | "upi" | "credit";
  amount: number;
}

export interface CreateSaleRequest {
  party_id: number | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: SaleItem[];
  payments: PaymentEntry[];
}

export interface SaleResponse {
  id: number;
  invoice_number: string;
}

export interface CreatePurchaseRequest {
  party_id: number | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: SaleItem[];
  payments: PaymentEntry[];
}

export interface PurchaseResponse {
  id: number;
  invoice_number: string;
}

export interface Party {
  id: number;
  name: string;
  phone: string;
  type: "customer" | "supplier";
  credit_limit?: number;
  outstanding: number;
}

export interface LedgerEntry {
  type: string;
  reference: string;
  amount: number;
  date: string;
}

export interface CreatePartyRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: "customer" | "supplier";
  credit_limit?: number;
  opening_balance?: number;
}

export interface DashboardData {
  today_sales: number;
  today_purchase: number;
  receivables: number;
  payables: number;
  low_stock: Array<{ name: string; quantity: number }>;
  recent: Array<{ invoice: string; type: string; party: string; amount: number }>;
}

export interface SalesReportItem {
  date: string;
  total_sales: number;
  total_returns: number;
  net_sales: number;
  transactions: number;
  avg_bill: number;
}

// ─── Domain APIs ──────────────────────────────────────────────────────────────

export const AuthAPI = {
  login: async (data: AuthLoginRequest): Promise<AuthLoginResponse> => {
    const response = await api.post<AuthLoginResponse>("/auth/login", data);
    return response.data;
  },
  register: async (data: AuthLoginRequest & { name: string }): Promise<AuthLoginResponse> => {
    const response = await api.post<AuthLoginResponse>("/auth/register", data);
    return response.data;
  },
  me: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>("/auth/me");
    return response.data;
  },
};

export const ProductAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>("/products");
    return response.data;
  },
  search: async (q: string): Promise<ProductSearchItem[]> => {
    const response = await api.get<ProductSearchItem[]>(
      `/products/search?q=${encodeURIComponent(q)}`
    );
    return response.data;
  },
  barcode: async (code: string): Promise<ProductSearchItem> => {
    const response = await api.get<ProductSearchItem>(`/products/barcode/${code}`);
    return response.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<Product>("/products", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const InventoryAPI = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>("/inventory");
    return response.data;
  },
  movements: async (): Promise<InventoryMovement[]> => {
    const response = await api.get<InventoryMovement[]>("/inventory/movements");
    return response.data;
  },
  lowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>("/inventory/low-stock");
    return response.data;
  },
  adjust: async (data: AdjustStockRequest): Promise<void> => {
    await api.post("/inventory/adjust", data);
  },
};

export const SalesAPI = {
  create: async (data: CreateSaleRequest): Promise<SaleResponse> => {
    const response = await api.post<SaleResponse>("/sales/create", data);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  returnSale: async (data: Partial<CreateSaleRequest>) => {
    const response = await api.post("/sales/return", data);
    return response.data;
  },
};

export const PurchaseAPI = {
  create: async (data: CreatePurchaseRequest): Promise<PurchaseResponse> => {
    const response = await api.post<PurchaseResponse>("/purchase/create", data);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/purchase/${id}`);
    return response.data;
  },
};

export const PartyAPI = {
  getAll: async (): Promise<Party[]> => {
    const response = await api.get<Party[]>("/parties");
    return response.data;
  },
  ledger: async (id: number): Promise<LedgerEntry[]> => {
    const response = await api.get<LedgerEntry[]>(`/parties/${id}/ledger`);
    return response.data;
  },
  create: async (data: CreatePartyRequest): Promise<Party> => {
    const response = await api.post<Party>("/parties", data);
    return response.data;
  },
  update: async (id: number, data: Partial<CreatePartyRequest>): Promise<Party> => {
    const response = await api.put<Party>(`/parties/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/parties/${id}`);
  },
};

export const ReportAPI = {
  dashboard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>("/reports/dashboard");
    return response.data;
  },
  sales: async (from: string, to: string): Promise<SalesReportItem[]> => {
    const response = await api.get<SalesReportItem[]>(
      `/reports/sales?from=${from}&to=${to}`
    );
    return response.data;
  },
  inventory: async (): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>("/reports/inventory");
    return response.data;
  },
};

export default api;
