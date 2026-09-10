export type StockType = 'unlimited' | 'limited';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail_url: string;
  preview_images: string[];
  file_path: string;
  is_active: boolean;
  stock_type: StockType;
  stock_qty: number | null;
  sold_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Order {
  id: string;
  order_code: string;
  product_id: string;
  buyer_email: string;
  buyer_name: string | null;
  price: number;
  status: OrderStatus;
  midtrans_transaction_id: string | null;
  midtrans_payment_type: string | null;
  download_token: string | null;
  download_token_expires_at: string | null;
  download_access_count: number;
  email_sent: boolean;
  created_at: string;
  paid_at: string | null;
  notes: string | null;
  product?: Product | null;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export type AdSlot =
  | 'home_main'
  | 'home_bottom'
  | 'product_detail'
  | 'category'
  | 'search'
  | 'download';

export interface Advertisement {
  id: string;
  sponsor_name: string;
  headline: string;
  description: string | null;
  cta_text: string;
  cta_url: string;
  image_url: string;
  badge_text: string;
  slot: AdSlot;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  clicks_count: number;
  impressions_count?: number;
  created_at: string;
  updated_at?: string;
}
