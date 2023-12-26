import { Country, Region } from "@/types/global";
import { Shop } from "@/types/shop";
import { ProductGallery, Stock } from "@/types/product";

export interface InsertProduct {
  stock_id: number;
  quantity: number;
  images?: string[];
}

export interface InsertCartPayload {
  currency_id: number;
  rate: number;
  region_id: number;
  country_id: number;
  products: InsertProduct[];
  city_id?: number;
}

export interface CartDetailProduct {
  bonus: boolean;
  discount: number;
  id: number;
  price?: number;
  quantity: number;
  stock: Stock;
  total_price?: number;
  galleries?: ProductGallery[];
  image?: string;
}

export interface CartDetailShop {
  discount: number;
  price: number;
  tax: number;
  total_price: number;
  stocks: CartDetailProduct[];
}

export interface CartDetail {
  shop: Shop;
  coupon_price: number | null;
  discount: number | null;
  id: number;
  shop_id: number;
  shop_tax: number;
  total_price: number;
  cartDetailProducts: CartDetailProduct[];
}

export interface UserCart {
  cart_id: number;
  id: number;
  name: string | null;
  status: boolean;
  user_id: number;
  uuid: string;
  cartDetails: CartDetail[];
}

export interface Cart {
  country: Country | null;
  region: Region | null;
  country_id: number;
  region_id: number;
  group: boolean;
  owner_id: number;
  created_at: string;
  status: boolean;
  total_price: number;
  updated_at: string;
  user_carts: UserCart[];
  id: number;
}

export interface CartCalculateRes {
  total_tax: number;
  price: number;
  total_shop_tax: number;
  total_price: number;
  total_discount: number;
  delivery_fee: number;
  km: number;
  service_fee: number;
  rate: number;
  total_coupon_price?: number;
  receipt_discount: number;
  receipt_count: number;
  shops: CartDetailShop[];
}

export interface CartCalculateBody {
  currency_id?: number;
  type: string;
  delivery_price_id?: number;
  delivery_point_id?: number;
  country_id?: number;
  city_id?: number;
  coupon?: string;
}
