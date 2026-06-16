export interface Product {
  id: string;
  product_name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sale_price: number;
  stock_quantity: number;
  weight: string; // e.g., '500g', '1kg', '2kg'
  featured_image: string;
  gallery_images: string[];
  category: string;
  status: 'active' | 'inactive';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_id: string; // Readable ID (e.g., SEG-1001)
  customer_name: string;
  phone: string;
  address: string;
  product: string; // Product name or details
  product_id?: string;
  quantity: number;
  total_price: number;
  payment_method: 'bkash' | 'nagad' | 'rocket' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number; // 1-5
  comment: string;
  location: string;
  date: string;
}

export interface WebsiteSettings {
  business_name: string;
  contact_number: string;
  whatsapp_number: string;
  facebook_link: string;
  messenger_link: string;
  delivery_charge_inside: number;
  delivery_charge_outside: number;
  hero_title: string;
  hero_subtitle: string;
  banner_image: string;
  footer_text: string;
  seo_keywords: string;
  seo_description: string;
}

export interface SalesStat {
  date: string;
  orders: number;
  revenue: number;
}
