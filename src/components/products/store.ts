import { create } from "zustand";
import { api } from "@/lib/api";

export interface ProductVariant {
  _id?: string;
  color: string;
  images?: string[];
  size?: Array<{ size: string; stock: number }>;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  productInformation: string;
  category: string;
  subCategory: string;
  sku: string;
  isActive: boolean;
  price: number;
  mrp: number;
  design: string;
  label?: string;
  averageRating: number;
  ratingCount: number;
  variants: ProductVariant[];
}

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  category: string;
  subCategory: string;
  design: string;
  priceMin: string;
  priceMax: string;
  rating: string;
  viewMode: string;
  page: number;
  totalProducts: number;

  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setSubCategory: (subCategory: string) => void;
  setDesign: (design: string) => void;
  setPriceMin: (value: string) => void;
  setPriceMax: (value: string) => void;
  setRating: (value: string) => void;
  setViewMode: (mode: string) => void;
  setPage: (page: number) => void;
  fetchProducts: () => Promise<void>;
  resetFilters: () => void;
}

const DEFAULT_FILTERS = {
  searchQuery: "",
  category: "",
  subCategory: "",
  design: "",
  priceMin: "",
  priceMax: "",
  rating: "",
  page: 1,
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  isLoading: false,
  error: null,
  ...DEFAULT_FILTERS,
  viewMode: "grid",
  totalProducts: 0,

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
    get().fetchProducts();
  },

  setCategory: (category) => {
    set({ category, page: 1 });
    get().fetchProducts();
  },

  setSubCategory: (subCategory) => {
    set({ subCategory, page: 1 });
    get().fetchProducts();
  },

  setDesign: (design) => {
    set({ design, page: 1 });
    get().fetchProducts();
  },

  setPriceMin: (value) => {
    set({ priceMin: value, page: 1 });
    get().fetchProducts();
  },

  setPriceMax: (value) => {
    set({ priceMax: value, page: 1 });
    get().fetchProducts();
  },

  setRating: (value) => {
    set({ rating: value, page: 1 });
    get().fetchProducts();
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setPage: (page) => {
    set({ page });
    get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    const {
      searchQuery,
      category,
      subCategory,
      design,
      priceMin,
      priceMax,
      rating,
      page,
    } = get();

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "12");
      if (category) params.append("category", category);
      if (subCategory) params.append("subCategory", subCategory);
      if (design) params.append("design", design);
      if (priceMin) params.append("priceMin", priceMin);
      if (priceMax) params.append("priceMax", priceMax);
      if (rating) params.append("rating", rating);

      const response = await api.get<{
        status?: boolean;
        data?: Product[];
        message?: string;
      }>(`/product/filter?${params.toString()}`);

      if (response?.status && Array.isArray(response.data)) {
        let products = response.data;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          products = products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q) ||
              p.subCategory?.toLowerCase().includes(q) ||
              p.design?.toLowerCase().includes(q),
          );
        }
        set({
          products,
          filteredProducts: products,
          totalProducts: products.length,
          error: null,
        });
      } else {
        set({
          products: [],
          filteredProducts: [],
          error: response?.message || "Failed to load products",
        });
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      set({
        products: [],
        filteredProducts: [],
        error: "Failed to load products",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  resetFilters: () => {
    set(DEFAULT_FILTERS);
    get().fetchProducts();
  },
}));
