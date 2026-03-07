export interface Category {
  catid: string;
  parent_catid: string;
  name: string;
  display_name: string;
  image: string;
  unselected_image: string;
  selected_image: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  link: string;
  name: string;
  price: number;
  comm_rate: number;
  comm: number;
  sold: number;
  type: string;
  shop_id: string;
  catid?: string | null;
  live_start?: number | null;
  live_end?: number | null;
  flash_sale_start?: number | null;
  flash_sale_end?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  // Add other fields as they become known
  name?: string;
  created_at?: string;
}

export interface User {
  id: string; // text in DB
  username: string;
  fullName?: string | null;
  cookie: string;
  status: number;
  table: number; // 'table' column
  revenue: number;
  comm: number; // 'comm' column
  createdAt: string; // camelCase in DB
  updatedAt: string; // camelCase in DB
  deletedAt?: string | null; // camelCase in DB
}
