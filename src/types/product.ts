/**
 * Types aligned with api.ethnicelegance.store product schema and filter API.
 */

export interface ProductVariantSize {
  size: string;
  stock: number;
}

export interface ProductVariant {
  _id?: string;
  color: string;
  images: string[];
  size: ProductVariantSize[];
}

export interface Product {
  _id: string;
  category: string;
  subCategory: string;
  name: string;
  sku: string;
  description: string;
  productInformation: string;
  isActive: boolean;
  price: number;
  mrp: number;
  design: string;
  label?: string;
  averageRating: number;
  ratingCount: number;
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  design?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  search?: string;
  color?: string;
}

export interface ProductFilterResponse {
  status: boolean;
  message: string;
  data: {
    products: Product[];
    total: number;
  };
}
