import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle, 
  FileText, 
  Package, 
  Settings, 
  Image as ImageIcon, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Download, 
  Upload, 
  Phone, 
  Check, 
  DollarSign,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  XCircle,
  Printer
} from 'lucide-react';
import { Product, Order, WebsiteSettings, Review, SalesStat } from '../types';
import { resolveImage } from './LandingPage';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  settings: WebsiteSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSettings: (settings: WebsiteSettings) => void;
}

export default function AdminDashboard({ 
  products, 
  orders, 
  reviews, 
  settings, 
  onUpdateProducts, 
  onUpdateOrders, 
  onUpdateSettings 
}: AdminDashboardProps) {
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'media' | 'customers' | 'settings'>('overview');
  
  // Search and filter states
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productQuery, setProductQuery] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');

  // Editing forms state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>({ ...settings });
  
  // Selected order for printing invoice modal
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);

  // File Upload states (Base64 wrapper)
  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [mediaUploadFile, setMediaUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadedGallery, setUploadedGallery] = useState<string[]>([
    'molasses_hero_banner',
    'molasses_clay_pot',
    'molasses_liquid_jar'
  ]);

  // Handle settings update saving
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (response.ok) {
        const data = await response.json();
        onUpdateSettings(data.settings);
        alert('কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
      }
    } catch (err: any) {
      alert('ত্রুটিঃ settings সংরক্ষণ করা যায়নি: ' + err.message);
    }
  };

  // Modify Order status
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const dbOrder = orders.find(o => o.id === orderId);
      if (!dbOrder) return;

      const payload: Partial<Order> = { status };
      
      // Auto set paid status on shipping or delivery
      if (status === 'delivered') {
        payload.payment_status = 'paid';
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        const updated = orders.map(o => o.id === orderId ? data.order : o);
        onUpdateOrders(updated);
      }
    } catch (err: any) {
      alert('অর্ডার স্ট্যাটাস আপডেট করতে ভুল হয়েছে');
    }
  };

  // Modify Order Payment status
  const handleUpdatePaymentStatus = async (orderId: string, payment_status: Order['payment_status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status }),
      });
      if (response.ok) {
        const data = await response.json();
        const updated = orders.map(o => o.id === orderId ? data.order : o);
        onUpdateOrders(updated);
      }
    } catch (err) {
      alert('পেমেন্ট স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('অর্ডারটি কি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (response.ok) {
        onUpdateOrders(orders.filter(o => o.id !== orderId));
      }
    } catch (err) {
      alert('অর্ডার ডিলিট করতে ত্রুটি হয়েছে');
    }
  };

  // Add / Edit Product CRUD triggers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const isNew = !editingProduct.id;
    const url = isNew ? '/api/products' : `/api/products/${editingProduct.id}`;
    const method = isNew ? 'POST' : 'PUT';

    // Set fallback slug and images
    const fallbackImage = editingProduct.featured_image || 'molasses_clay_pot';
    const payload = {
      ...editingProduct,
      slug: editingProduct.product_name ? editingProduct.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product-slug',
      featured_image: fallbackImage,
      gallery_images: [fallbackImage],
      price: Number(editingProduct.price || 0),
      sale_price: Number(editingProduct.sale_price || 0),
      stock_quantity: Number(editingProduct.stock_quantity || 0),
      weight: editingProduct.weight || '1kg',
      category: editingProduct.category || 'Patali Gur',
      status: editingProduct.status || 'active',
      featured: editingProduct.featured || false
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (isNew) {
          onUpdateProducts([...products, data.product]);
        } else {
          onUpdateProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
        }
        setIsAddingProduct(false);
        setEditingProduct(null);
        alert(isNew ? 'নতুন পণ্য সফলভাবে যোগ করা হয়েছে!' : 'পণ্য বিবরণী সফলভাবে আপডেট করা হয়েছে!');
      }
    } catch (err) {
      alert('পণ্য যোগ/এডিট করা যায়নি।');
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('এই পণ্যটি কি সত্যিই মুছে ফেলতে চান?')) return;
    try {
      const response = await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (response.ok) {
        onUpdateProducts(products.filter(p => p.id !== prodId));
      }
    } catch (err) {
      alert('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  // Base64 file upload simulator for media manager
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            base64Data
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Add newly generated URL to accessible local gallery
          setUploadedGallery(prev => [data.url, ...prev]);
          setMediaUploadUrl(data.url);
          alert('ফাইল আপলোড চমৎকারভাবে সম্পন্ন হয়েছে!');
        } else {
          alert('ফাইল আপলোডে ত্রুটি হয়েছে।');
        }
      } catch (err) {
        alert('সার্ভার কানেকশন এরর।');
      } finally {
        setUploadProgress(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- STATS COMPUTATION & ANALYTICS DATA ---
  const kpiStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing' || o.status === 'confirmed' || o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;

    // Calculate total revenue from non-cancelled/paid or delivered orders
    const revenue = orders
      .filter(o => o.status === 'delivered' && o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_price, 0);

    const pendingRevenue = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'delivered')
      .reduce((sum, o) => sum + o.total_price, 0);

    return { total, pending, processing, delivered, cancelled, revenue, pendingRevenue };
  }, [orders]);

  // Aggregate customer details
  const customersList = useMemo(() => {
    const custMap: { [phone: string]: { name: string; phone: string; address: string; ordersCount: number; totalSpent: number } } = {};
    
    orders.forEach(o => {
      const key = o.phone.trim();
      if (!custMap[key]) {
        custMap[key] = {
          name: o.customer_name,
          phone: o.phone,
          address: o.address,
          ordersCount: 0,
          totalSpent: 0
        };
      }
      custMap[key].ordersCount += 1;
      // If completed
      if (o.status !== 'cancelled') {
        custMap[key].totalSpent += o.total_price;
      }
    });

    return Object.values(custMap);
  }, [orders]);


  // CSV Export utility: download sales list instantly as CSV file
  const handleExportCSV = (type: 'orders' | 'customers' | 'product_performance') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileName = '';

    if (type === 'orders') {
      fileName = 'orders_report.csv';
      headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Product', 'Quantity', 'Total Price', 'Method', 'Payment Status', 'Status', 'Date'];
      rows = orders.map(o => [
        o.order_id,
        o.customer_name,
        o.phone,
        o.address.replace(/,/g, ' '),
        o.product,
        o.quantity.toString(),
        o.total_price.toString(),
        o.payment_method,
        o.payment_status,
        o.status,
        new Date(o.created_at).toLocaleDateString()
      ]);
    } else if (type === 'customers') {
      fileName = 'customers_database.csv';
      headers = ['Customer Name', 'Phone', 'Address', 'Orders Count', 'Total Spent'];
      rows = customersList.map(c => [
        c.name,
        c.phone,
        c.address.replace(/,/g, ' '),
        c.ordersCount.toString(),
        c.totalSpent.toString()
      ]);
    } else {
      fileName = 'product_sales_performance.csv';
      headers = ['Product Name', 'Price', 'Sale Price', 'Stock Level', 'Category', 'Total Orders Selected'];
      rows = products.map(p => {
        const orderCounts = orders.filter(o => o.product_id === p.id && o.status !== 'cancelled').reduce((sum, o) => sum + o.quantity, 0);
        return [
          p.product_name,
          p.price.toString(),
          p.sale_price.toString(),
          p.stock_quantity.toString(),
          p.category,
          orderCounts.toString()
        ];
      });
    }

    // Compose string
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter lists based on search parameter queries
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.customer_name.toLowerCase().includes(orderQuery.toLowerCase()) || 
                            o.phone.includes(orderQuery) || 
                            o.order_id.toLowerCase().includes(orderQuery.toLowerCase());
      
      const matchesFilter = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, orderQuery, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.product_name.toLowerCase().includes(productQuery.toLowerCase()) || p.category.toLowerCase().includes(productQuery.toLowerCase()));
  }, [products, productQuery]);

  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => c.name.toLowerCase().includes(customerQuery.toLowerCase()) || c.phone.includes(customerQuery));
  }, [customersList, customerQuery]);

  // Analytics helper stats (Sales by Product distribution for the dynamic SVG bar charts)
  const productPerformanceStats = useMemo(() => {
    return products.map(p => {
      const unitsSold = orders
        .filter(o => o.product_id === p.id && o.status === 'delivered')
        .reduce((sum, o) => sum + o.quantity, 0);
      const totalRev = unitsSold * p.sale_price;
      return { 
        name: p.product_name.substring(0, 16) + '...',
        units: unitsSold,
        revenue: totalRev
      };
    }).sort((a, b) => b.units - a.units);
  }, [products, orders]);

  // Daily Sales Stats over 8 dynamic days to build a gorgeous pure SVG Line Chart
  const lineStats: { day: string; revenue: number; orders: number }[] = useMemo(() => {
    const list = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toLocaleDateString('bn-BD', { weekday: 'short' });
      // Calculate revenue
      const matchOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at).toDateString();
        return orderDate === d.toDateString() && o.status !== 'cancelled';
      });
      const rev = matchOrders.reduce((sum, o) => sum + o.total_price, 0);
      list.push({
        day: dayStr,
        revenue: rev,
        orders: matchOrders.length
      });
    }
    return list;
  }, [orders]);


  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-16">
      
      {/* Top Banner section */}
      <div className="bg-emerald-900 border-b-2 border-amber-500 py-6 text-white px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-500 text-emerald-950 font-sans font-bold text-xs uppercase">Administrative Console</span>
              <span className="font-mono text-emerald-300 text-xs">Logged as Administrator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">শুদ্ধ খেজুরের গুড়: অ্যাডমিন ড্যাশবোর্ড</h2>
            <p className="text-xs text-emerald-200 mt-0.5">সব ধরনের পণ্য, দাম, ডেলিভারি রুলস এবং অর্ডার রিপোর্টগুলি এখানে নিয়ন্ত্রণ ও নিরীক্ষণ করুন।</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExportCSV('orders')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-850 hover:bg-emerald-950 text-emerald-200 text-xs font-bold rounded-lg border border-emerald-800"
            >
              <Download className="h-4 w-4 text-amber-500" />
              <span>অর্গানিক অর্ডার তালিকা (CSV)</span>
            </button>
            <button
              onClick={() => handleExportCSV('customers')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-850 hover:bg-emerald-950 text-emerald-200 text-xs font-bold rounded-lg border border-emerald-800"
            >
              <Users className="h-4 w-4 text-amber-500" />
              <span>কাস্টমার তালিকা (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Layout Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <nav className="flex flex-wrap border-b border-slate-200 gap-1.5 bg-white p-2 rounded-xl shadow-sm">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'overview'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>কনসোল ওভারভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'orders'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>অর্ডার ও শিপিং</span>
            {kpiStats.pending > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-emerald-950 text-[10px] h-5 w-5 font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {kpiStats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'products'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-50'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>গুড় ম্যানেজমেন্ট</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'media'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>মিডিয়া ও ব্যানার</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'customers'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>ক্রেতা তথ্যভাণ্ডার</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'settings'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-50'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>সিস্টেম সেটিংস</span>
          </button>

        </nav>
      </div>

      {/* Main Tabs Panels container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB 1: OVERVIEW PANEL WITH KPIS & GRAPHICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold">Total Revenue (ডেলিভারিকৃত)</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight mt-1 font-mono">
                    ৳{kpiStats.revenue}
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">১০০% পরিশোধিত পেমেন্ট</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold">Pending Delivery (চলতি বুকিং)</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight mt-1 font-mono">
                    ৳{kpiStats.pendingRevenue}
                  </h3>
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">প্রক্রিয়াধীন পেমেন্টসমূহ</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold">অপেক্ষমান অর্ডার (Pending)</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight mt-1 font-mono">
                    {kpiStats.pending} <span className="text-xs font-semibold">অর্ডার</span>
                  </h3>
                  <p className="text-[10px] text-blue-600 font-semibold mt-1">অনুমোদনের জন্য পেন্ডিং</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold">সম্পন্ন বা শিপিড অর্ডার</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight mt-1 font-mono">
                    {kpiStats.delivered} <span className="text-xs font-semibold">টি</span>
                  </h3>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-1">সফলভাবে প্রেরিত কুরিয়ার</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>

            </div>

            {/* CHARTS CONTAINER (GORGEOUS pure SVG charts so we don't depend on complex canvas sizes) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Daily Revenue Trends (8 days line) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h4 className="text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                  <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
                  <span>দৈনিক বিক্রি সূচক ও নতুন বুকিং (Daily Orders & Revenue)</span>
                </h4>
                
                {/* SVG Line visualization */}
                <div className="w-full h-56 pt-2">
                  <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Draw background gradient area */}
                    <path
                      d={`M 40 170 
                          L 40 ${170 - (lineStats[0].revenue / 22)} 
                          L 100 ${170 - (lineStats[1].revenue / 22)} 
                          L 160 ${170 - (lineStats[2].revenue / 22)} 
                          L 220 ${170 - (lineStats[3].revenue / 22)} 
                          L 280 ${170 - (lineStats[4].revenue / 22)} 
                          L 340 ${170 - (lineStats[5].revenue / 22)} 
                          L 400 ${170 - (lineStats[6].revenue / 22)} 
                          L 460 ${170 - (lineStats[7].revenue / 22)} 
                          L 460 170 Z`}
                      fill="url(#chartGrad)"
                      opacity="0.12"
                    />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f5132" />
                        <stop offset="100%" stopColor="#d4a017" />
                      </linearGradient>
                    </defs>

                    {/* Draw line */}
                    <polyline
                      fill="none"
                      stroke="#0f5132"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={`40,${170 - (lineStats[0].revenue / 22)} 
                               100,${170 - (lineStats[1].revenue / 22)} 
                               160,${170 - (lineStats[2].revenue / 22)} 
                               220,${170 - (lineStats[3].revenue / 22)} 
                               280,${170 - (lineStats[4].revenue / 22)} 
                               340,${170 - (lineStats[5].revenue / 22)} 
                               400,${170 - (lineStats[6].revenue / 22)} 
                               460,${170 - (lineStats[7].revenue / 22)}`}
                    />

                    {/* Data dots */}
                    {lineStats.map((item, idx) => {
                      const x = 40 + idx * 60;
                      const y = 170 - (item.revenue / 22);
                      return (
                        <g key={idx} className="cursor-pointer group">
                          <circle cx={x} cy={y} r="5" fill="#d4a017" stroke="#0f5132" strokeWidth="2.5" />
                          <text x={x} y={y - 12} textAnchor="middle" className="text-[10px] font-bold font-mono fill-emerald-950 group-hover:text-amber-500">
                            {item.revenue > 0 ? `৳${item.revenue}` : ''}
                          </text>
                          <text x={x} y="192" textAnchor="middle" className="text-[10px] font-sans font-medium fill-slate-500">
                            {item.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="flex justify-around text-xs text-slate-500 border-t border-slate-50 pt-3">
                  <p className="flex items-center gap-1.5"><span className="h-3 w-3 bg-emerald-800 rounded-full"></span><span>গ্র্যান্ড সেলস হিস্ট্রি</span></p>
                  <p className="font-mono">দিনের সর্বোচ্চ বিক্রয় স্তর মাপা হয়েছে ৩০২৫ টাকা</p>
                </div>
              </div>

              {/* Chart 2: Product Performance Breakdown & Best Selling Items (Interactive horizontal bars) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h4 className="text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                  <Package className="h-4.5 w-4.5 text-amber-500" />
                  <span>কোন গুড় কেমন বিক্রি হচ্ছে? (Sell distribution of inventory items)</span>
                </h4>

                <div className="space-y-4">
                  {productPerformanceStats.map((item, idx) => {
                    const maxUnits = Math.max(...productPerformanceStats.map(i => i.units), 1);
                    const percentWidth = Math.min(100, Math.round((item.units / maxUnits) * 100));
                    
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-emerald-950 truncate max-w-[280px]">{item.name}</span>
                          <span className="text-amber-600 font-mono font-bold">{item.units} টি বিক্রি ({item.units * 1} কেজি)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-gradient-to-r from-emerald-800 to-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentWidth || 10}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">
                  *এই হিসেবটি শুধুমাত্র 'ডেলিভারিকৃত' স্ট্যাটাসের গ্রাহকদের সফলভাবে পেইড করা পণ্য ইউনিটের ওপরে গণনা করা হচ্ছে।
                </p>
              </div>

            </div>

            {/* Recent Orders Overview table with click link */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h4 className="text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-emerald-800" />
                  <span>সাম্প্রতিক কিছু অর্ডার তালিকা (Recent orders overview)</span>
                </h4>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  সবগুলো অর্ডার দেখুন &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-900 font-bold border-b border-slate-200">
                      <th className="p-3">অর্ডার আইডি</th>
                      <th className="p-3">ক্রেতার নাম & মোবাইল</th>
                      <th className="p-3">গুড়ের আইটেম</th>
                      <th className="p-3">মূল্য</th>
                      <th className="p-3">পেমেন্ট মাধ্যম</th>
                      <th className="p-3">অর্ডার রেকর্ড</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-amber-600">{o.order_id}</td>
                        <td className="p-3">
                          <div className="font-bold text-emerald-950">{o.customer_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{o.phone}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-700">{o.product} ({o.quantity} টি)</td>
                        <td className="p-3 font-bold font-mono">৳{o.total_price}</td>
                        <td className="p-3 uppercase font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-100 font-bold">
                            {o.payment_method}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            o.status === 'delivered' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDER & SHIPPING MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-5">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-emerald-950 font-bold text-base sm:text-lg flex items-center gap-1.5">
                <ShoppingBag className="h-5 w-5 text-emerald-800" />
                <span>গ্রাহক কুড়িয়্যার বুকিং ও শিপিং তালিকা ({filteredOrders.length} টি পাওয়া গেছে)</span>
              </h3>
              
              {/* Export Button */}
              <button
                onClick={() => handleExportCSV('orders')}
                className="flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-950 hover:shadow text-white rounded text-xs font-bold"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>আজকের সেলস শিট (XLS/CSV)</span>
              </button>
            </div>

            {/* Filter controls bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="অর্ডার আইডি, কাস্টমার নাম বা মোবাইল নম্বর লিখে খুঁজুন..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm text-emerald-950 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.8 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                >
                  <option value="all">সব অর্ডার স্ট্যাটাস (All)</option>
                  <option value="pending">পেন্ডিং কুরিয়ার (Pending)</option>
                  <option value="confirmed">নিশ্চিতকৃত অর্ডার (Confirmed)</option>
                  <option value="processing">প্রক্রিয়াধীন প্যাকেট (Processing)</option>
                  <option value="shipped">সুন্দরবনে পাঠানো হয়েছে (Shipped)</option>
                  <option value="delivered">ডেলিভারি সম্পন্ন (Delivered)</option>
                  <option value="cancelled">অর্ডার বাতিল (Cancelled)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={() => { setOrderQuery(''); setOrderStatusFilter('all'); }}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-500 hover:text-emerald-950 bg-slate-100 rounded-lg transition"
                >
                  রিসেট ফিল্টার
                </button>
              </div>

            </div>

            {/* Orders Table list */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white font-bold text-xs">
                    <th className="p-3 border-r border-emerald-800">অর্ডার আইডি</th>
                    <th className="p-3 border-r border-emerald-800">তারিখ ও কাস্টমার বিস্তারিত</th>
                    <th className="p-3 border-r border-emerald-800 text-left">গুড় আইটেম ও স্পেসিফিকেশন</th>
                    <th className="p-3 border-r border-emerald-800">সর্বমোট বিল</th>
                    <th className="p-3 border-r border-emerald-800">অর্ডার স্থিতি (Order Status)</th>
                    <th className="p-3 border-r border-emerald-800">পেমেন্ট স্থিতি (Payment Status)</th>
                    <th className="p-3 text-center">ইনভয়েস ও অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                        অর্ডার খুঁজতে পাওয়া যায়নি। খোঁজার কুয়েরি পরিবর্তন করুন।
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition">
                        
                        {/* Order ID */}
                        <td className="p-3 font-mono font-black text-amber-600 text-sm align-top leading-normal">
                          {o.order_id}
                        </td>

                        {/* Customer detail */}
                        <td className="p-3 align-top leading-relaxed space-y-1">
                          <div className="font-extrabold text-emerald-950 text-sm">{o.customer_name}</div>
                          <div className="font-mono text-[11px] font-bold text-emerald-800">{o.phone}</div>
                          <div className="text-[10px] text-slate-500 max-w-[200px] font-sans truncate" title={o.address}>
                            {o.address}
                          </div>
                          {o.notes && (
                            <div className="text-[9px] bg-red-50 text-red-700 p-1.5 rounded-md border border-red-100/50">
                              <strong>নোটঃ</strong> {o.notes}
                            </div>
                          )}
                        </td>

                        {/* Product order */}
                        <td className="p-3 align-top leading-normal font-sans">
                          <div className="font-semibold text-emerald-950">{o.product}</div>
                          <div className="text-xs text-slate-400 font-bold mt-0.5">পরিমাণ: {o.quantity} প্যাক</div>
                        </td>

                        {/* Total price billing */}
                        <td className="p-3 font-mono font-bold text-sm align-top">
                          ৳{o.total_price}
                          <div className="text-[9px] text-slate-400 font-sans mt-0.5 uppercase">({o.payment_method})</div>
                        </td>

                        {/* Order Status selector dropdown trigger */}
                        <td className="p-3 align-top">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                            className={`px-2 py-1 text-xs font-bold rounded-lg ${
                              o.status === 'delivered' 
                                ? 'bg-emerald-100 text-emerald-850'
                                : o.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-905 border border-amber-300 animate-pulse'
                            }`}
                          >
                            <option value="pending">পেন্ডিং (Pending)</option>
                            <option value="confirmed">কনফার্ম (Confirmed)</option>
                            <option value="processing">প্রসেসিং (Processing)</option>
                            <option value="shipped">শিপিড (Shipped)</option>
                            <option value="delivered">ডেলিভারড (Delivered)</option>
                            <option value="cancelled">বাতিল (Cancelled)</option>
                          </select>
                        </td>

                        {/* Payment Status trigger select dropdown */}
                        <td className="p-3 align-top">
                          <select
                            value={o.payment_status}
                            onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value as Order['payment_status'])}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                              o.payment_status === 'paid'
                                ? 'bg-emerald-800 text-white'
                                : o.payment_status === 'failed'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-400 text-slate-900'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>

                        {/* Invoice and delete controls */}
                        <td className="p-3 align-top text-center space-x-1.5 whitespace-nowrap">
                          {/* Invoice Printer shortcut option */}
                          <button
                            onClick={() => setActiveInvoiceOrder(o)}
                            className="p-1 px-2.0 py-1.2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs rounded border border-emerald-200 font-bold inline-flex items-center gap-1"
                            title="প্রিন্ট রশিদ"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>রশিদ</span>
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            className="p-1 bg-red-50 hover:bg-red-100 text-red-650 rounded border border-red-200"
                            title="অর্ডার মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5 inline" />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: PRODUCT MANAGEMENT PANEL */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-emerald-950 font-bold text-base sm:text-lg flex items-center gap-1.5">
                  <Package className="h-5 w-5 text-emerald-800" />
                  <span>গুড় গুদাম ঘর ও প্রডাক্ট ক্যাটালগ ({products.length} আইটেমস)</span>
                </h3>
                <p className="text-xs text-slate-500">গুড়ের নতুন ধরন, দাম, ওজন এবং কাস্টম ক্যাটালগ আপলোড এখানে করুন।</p>
              </div>

              {!isAddingProduct && !editingProduct && (
                <button
                  onClick={() => setEditingProduct({})}
                  id="admin-add-product-btn"
                  className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 font-extrabold text-sm text-emerald-950 rounded-xl"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>নতুন গুড় আইটেম যোগ করুন</span>
                </button>
              )}
            </div>

            {/* Editing / Adding product details overlay form */}
            {(editingProduct || isAddingProduct) && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mt-2 space-y-4">
                <h4 className="text-emerald-950 font-extrabold text-base border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>{editingProduct?.id ? 'গুড় পণ্যের বিবরণ পরিমার্জন করুন' : 'নতুন গুড় পণ্য যুক্ত করুন'}</span>
                  <button 
                    onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} 
                    className="p-1 text-slate-400 hover:text-slate-600 rounded bg-slate-200/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </h4>

                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  
                  {/* Name field */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-emerald-950 mb-1">গুড় পণ্যের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমনঃ স্পেশাল যশোর পাটালি গুড় (১ কেজি)"
                      value={editingProduct?.product_name || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, product_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                    />
                  </div>

                  {/* Weight specifications */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">ওজন (Weight)*</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমনঃ 500g, 1kg, 2kg, 5kg"
                      value={editingProduct?.weight || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, weight: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                    />
                  </div>

                  {/* Description long info */}
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-emerald-950 mb-1">মূল বিবরণী *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="খেজুরের গুড়ের উপাদান ও প্রস্তুত প্রণালীর দীর্ঘ বিবরণ লিখুন..."
                      value={editingProduct?.description || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-emerald-950 mb-1">সংক্ষিপ্ত পরিচিতি (Short Description)</label>
                    <input
                      type="text"
                      placeholder="অর্ডার কার্ডে প্রদর্শনের জন্য ছোট এক লাইনের বর্ণনা।"
                      value={editingProduct?.short_description || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, short_description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                    />
                  </div>

                  {/* Original Price */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">আসল মূল্য (৳ Taka) *</label>
                    <input
                      type="number"
                      required
                      placeholder="যেমনঃ 550"
                      value={editingProduct?.price || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">অফারের বিক্রয় মূল্য (৳)*</label>
                    <input
                      type="number"
                      required
                      placeholder="যেমনঃ 490"
                      value={editingProduct?.sale_price || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, sale_price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">স্টক পরিমাণ (Stock Quantity)*</label>
                    <input
                      type="number"
                      required
                      placeholder="যেমনঃ 100"
                      value={editingProduct?.stock_quantity !== undefined ? editingProduct.stock_quantity : ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, stock_quantity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Category select */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">ক্যাটাগরি (Category)</label>
                    <input
                      type="text"
                      placeholder="যেমনঃ Patali Gur, Jhola Gur, Special"
                      value={editingProduct?.category || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                    />
                  </div>

                  {/* Featured Image pick */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">প্রধান ব্যানার ছবি</label>
                    <select
                      value={editingProduct?.featured_image || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev!, featured_image: e.target.value }))}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-emerald-950 focus:outline-none"
                    >
                      <option value="">বাছাই করুন...</option>
                      <option value="molasses_clay_pot">Clay Pot / Block (আমাদের জেনারেটেড ১)</option>
                      <option value="molasses_liquid_jar">Jhola Jar Syrup (আমাদের জেনারেটেড ২)</option>
                      <option value="molasses_hero_banner">Liquid / Clay Hero Banner Mix (আমাদের জেনারেটেড ৩)</option>
                      {uploadedGallery.filter(x => !['molasses_hero_banner', 'molasses_clay_pot', 'molasses_liquid_jar'].includes(x)).map((url, i) => (
                        <option key={i} value={url}>{url.split('_').pop() || 'Uploaded image'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status switches checkbox featured */}
                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 font-bold text-emerald-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct?.featured || false}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, featured: e.target.checked }))}
                        className="rounded accent-emerald-800"
                      />
                      <span>Featured (বিশেষ মর্যাদা)</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-emerald-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct?.status === 'active' || !editingProduct?.id}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, status: e.target.checked ? 'active' : 'inactive' }))}
                        className="rounded accent-emerald-800"
                      />
                      <span>Active (প্রকাশ করুন)</span>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="sm:col-span-3 flex justify-end gap-2.5 pt-2 border-t border-slate-200 mt-2">
                    <button
                      type="button"
                      onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-xs text-slate-700"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded font-bold text-xs shadow-md inline-flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      <span>পরিবর্তন সংরক্ষণ করুন</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* List Table of existing inventory products */}
            <div className="grid grid-cols-1 gap-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="পণ্য তালিকা খুঁজুন শব্দ দিয়ে..."
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs text-emerald-950 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">Total {filteredProducts.length} Items listed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-slate-50 rounded-xl p-4.5 border border-slate-200/60 shadow-sm flex items-start gap-4">
                    <img
                      src={resolveImage(p.featured_image)}
                      alt={p.product_name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-lg object-cover bg-slate-200 border border-slate-300"
                    />
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h5 className="font-extrabold text-emerald-950 text-sm leading-tight">{p.product_name}</h5>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1 hover:bg-emerald-50 text-emerald-800 rounded border border-emerald-100 bg-white"
                            title="এডিট করুন"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 hover:bg-red-50 text-red-650 rounded border border-red-100 bg-white"
                            title="ডিলিট পণ্য"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">{p.short_description}</p>
                      
                      <div className="flex items-center gap-3 pt-1.5 text-11px font-medium">
                        <span className="text-emerald-900 font-black">৳{p.sale_price} <span className="text-[9px] text-slate-400 line-through">৳{p.price}</span></span>
                        <span className="text-slate-200">|</span>
                        <span className="text-slate-600 font-mono">Stock: {p.stock_quantity || 0} টি ({p.weight})</span>
                        <span className="text-slate-205">|</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: MEDIA MANAGER (Manage banners and slideshow gallery) */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-emerald-950 font-bold text-base sm:text-lg flex items-center gap-1.5">
                <ImageIcon className="h-5 w-5 text-emerald-800" />
                <span>মিডিয়া ম্যানেজার (Upload & Replace Web Images)</span>
              </h3>
              <p className="text-xs text-slate-500">আপনার ওয়েবসাইটের কভার ও প্রধান ব্যানার পরিবর্তন করার জন্য ছবি আপলোড করুন।</p>
            </div>

            {/* Simulated file upload panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              
              <div className="space-y-4">
                <h4 className="font-bold text-emerald-900 text-sm">নতুন ব্যানার/প্রোডাক্ট ছবি আপলোড কুইক পোর্টাল</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  আপনার ছবি সিলেক্ট করুন। এক্সপ্রেস সার্ভার স্বয়ংক্রিয়ভাবে এটিকে আমাদের লোকাল স্টোরেজ ডিরেক্টরিতে নিরাপদ সেভ করে প্রডাক্টে যোগ করার জন্য প্রস্তুত ইউনিক URL পথ প্রদান করবে।
                </p>

                {/* React Real File input */}
                <div className="border-2 border-dashed border-slate-350/70 hover:border-emerald-500 bg-white rounded-xl p-6 text-center transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-full">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">এখানে ফাইল ড্রপ বা সিলেক্ট করুন</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG বা WEBP আপ টু ১০ মেগাবাইট</p>
                    </div>
                  </div>
                </div>

                {uploadProgress && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                    <div className="h-4 w-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
                    <span>ফাইল আপলোড প্রসেস হচ্ছে...</span>
                  </div>
                )}
              </div>

              {/* Uploaded File Link status */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-emerald-900 text-sm">সদ্য আপলোডকৃত ইমেজের রেফারেন্স পথ</h4>
                
                <div className="space-y-2 text-xs">
                  <textarea
                    rows={2}
                    readOnly
                    value={mediaUploadUrl || 'কোনো ফাইল আপলোড করা হয়নি'}
                    onClick={(e) => (e.target as any).select()}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px] text-slate-600 focus:outline-none"
                    placeholder="URL Output"
                  />
                  {mediaUploadUrl && (
                    <span className="text-[10px] font-semibold text-emerald-700 block">
                      *এই পাথটিকে কপি করে গুড় প্রডাক্ট সেটিংস বা মেইন ব্যানার সেটিংসে ফিচার্ড প্যাথ হিসেবে বসিয়ে দিন।
                    </span>
                  )}
                </div>

                {mediaUploadUrl && (
                  <div className="border border-slate-200.5 rounded-lg p-2 bg-white max-w-[200px]">
                    <span className="text-[9px] text-slate-400 block mb-1">প্রিভিউ:</span>
                    <img 
                      src={mediaUploadUrl} 
                      alt="Uploaded Preview" 
                      referrerPolicy="no-referrer"
                      className="w-full aspect-square object-cover rounded" 
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Predefined Image catalogs view */}
            <div className="space-y-4">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">পিকচার গ্যালারি এবং আমাদের প্রি-প্রস্তুত কৃত্রিম শিল্পসমূহ</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedGallery.map((img, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <img
                      src={resolveImage(img)}
                      alt={img}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-video object-cover rounded-md bg-stone-100"
                    />
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono text-emerald-950 truncate max-w-[120px]" title={img}>{img}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold uppercase text-[8px]">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: CUSTOMER DATABASE & SALES HISTORY */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-emerald-950 font-bold text-base sm:text-lg flex items-center gap-1.5">
                  <Users className="h-5 w-5 text-emerald-800" />
                  <span>কাস্টমার লিস্ট ও ক্রয় ইতিহাস (Customer Database)</span>
                </h3>
                <p className="text-xs text-slate-500">আপনার থেকে এ পর্যন্ত কেনা অনন্য মোবাইল নাম্বার ও কাস্টমারদের ইতিহাস।</p>
              </div>

              <button
                onClick={() => handleExportCSV('customers')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded text-xs"
              >
                <Download className="h-4 w-4" />
                <span>ডাউনলোড ডাটাবেস (Excel-CSV)</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="কাস্টমার নাম বা মোবাইল নম্বর লিখে খুঁজুন..."
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                className="w-full max-w-md pl-9 pr-4 py-2 text-sm text-emerald-950 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white font-bold text-xs">
                    <th className="p-3">ক্রেতার নাম</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3">পূর্ণাঙ্গ ঠিকানা</th>
                    <th className="p-3 text-center">মোট সফল অর্ডার সংখ্যা</th>
                    <th className="p-3 text-right">মোট প্রদানকৃত অর্থ (৳ Taka)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                        কোনো কাস্টমার ম্যাচ করেনি।
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-emerald-950">{c.name}</td>
                        <td className="p-3 font-mono font-bold text-emerald-800">{c.phone}</td>
                        <td className="p-3 text-slate-500 text-xs truncate max-w-sm" title={c.address}>{c.address}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{c.ordersCount} টি</td>
                        <td className="p-3 text-right font-mono font-black text-emerald-850">৳{c.totalSpent}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 6: WEBSITE SETTINGS CHANGEOVER MODULE */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-emerald-950 font-bold text-base sm:text-lg flex items-center gap-1.5">
                <Settings className="h-5 w-5 text-emerald-800" />
                <span>মাস্টার ওয়েবসাইট সেটিংস (Website live control settings)</span>
              </h3>
              <p className="text-xs text-slate-500">ল্যান্ডিং পেজের নাম, ব্যানার, মোবাইল নম্বর এবং কাস্টমার ডেলিভারি চার্জ লাইভ পরিবর্তন করুন কোড এডিট না করেই!</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs sm:text-sm">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Business name */}
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">ব্যবসার নাম (Business Name)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.business_name}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, business_name: e.target.value }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                  />
                </div>

                {/* Contact phone */}
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">কন্টাক্ট মোবাইল নম্বর (Call Hotline)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.contact_number}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, contact_number: e.target.value }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white font-mono"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">হোয়াটসঅ্যাপ নাম্বার (WhatsApp Direct Link)*</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsapp_number}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white font-mono"
                  />
                </div>

                {/* FB Page link */}
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">ফেসবুক পেজ লিংক (Facebook page link)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.facebook_link}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook_link: e.target.value }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white font-mono"
                  />
                </div>

              </div>

              {/* Delivery rates row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">ঢাকার ভেতর কুরিয়ার চার্জ (৳)*</label>
                  <input
                    type="number"
                    required
                    value={settingsForm.delivery_charge_inside}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, delivery_charge_inside: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">ঢাকার বাইরে কুরিয়ার চার্জ (৳)*</label>
                  <input
                    type="number"
                    required
                    value={settingsForm.delivery_charge_outside}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, delivery_charge_outside: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Banner Selector mapping */}
              <div>
                <label className="block font-bold text-emerald-950 mb-1">মেইন ওয়েবসাইট হিরো কভার ফটো</label>
                <select
                  value={settingsForm.banner_image}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, banner_image: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                >
                  <option value="molasses_hero_banner">Liquid / Clay Hero Banner Mix (আমাদের জেনারেটেড কভার)</option>
                  <option value="molasses_clay_pot">Clay Pot / Block (আমাদের জেনারেটেড ১)</option>
                  <option value="molasses_liquid_jar">Jhola Jar Syrup (আমাদের জেনারেটেড ২)</option>
                  {uploadedGallery.filter(x => !['molasses_hero_banner', 'molasses_clay_pot', 'molasses_liquid_jar'].includes(x)).map((url, i) => (
                    <option key={i} value={url}>{url.split('_').pop() || 'Uploaded file'}</option>
                  ))}
                </select>
              </div>

              {/* Hero Title */}
              <div>
                <label className="block font-bold text-emerald-950 mb-1">হিরো ব্যানার হেডলাইন (Hero Title Text)</label>
                <input
                  type="text"
                  required
                  value={settingsForm.hero_title}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, hero_title: e.target.value }))}
                  className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                />
              </div>

              {/* Hero Subtitle */}
              <div>
                <label className="block font-bold text-emerald-950 mb-1">হিরো ব্যানার সাবহেডলাইন (Hero Subtitle Text)</label>
                <textarea
                  rows={2}
                  required
                  value={settingsForm.hero_subtitle}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                />
              </div>

              {/* SEO Key phrases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">SEO সার্চ কি-ওয়ার্ডস (SEO Keywords search)</label>
                  <input
                    type="text"
                    value={settingsForm.seo_keywords || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                    placeholder="গুড়, খেজুরের গুড়, খাঁটি গুড়"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">SEO মেটা ডেসক্রিপশন (SEO Meta Description)</label>
                  <input
                    type="text"
                    value={settingsForm.seo_description || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, seo_description: e.target.value }))}
                    className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                    placeholder="মোবাইলে আসল খেজুরের গুড় বুকিং করুন..."
                  />
                </div>
              </div>

              {/* Footer copyrights */}
              <div>
                <label className="block font-bold text-emerald-950 mb-1">ফুটার ডিক্লারেশন বা কপিরাইট টেক্সট</label>
                <input
                  type="text"
                  required
                  value={settingsForm.footer_text}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, footer_text: e.target.value }))}
                  className="w-full px-3.5 py-2.2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-950 focus:bg-white"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  id="admin-save-settings-btn"
                  className="px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-extrabold rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>পরিবর্তন নিশ্চিত করুন ও সেভ দিন</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* --- INVOICE PRINT MODATION OVERLAY SCREEN --- */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-300">
            
            {/* Modal Title bar */}
            <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">মাস্টার ইনভয়েস জেনারেটর</span>
              <button 
                onClick={() => setActiveInvoiceOrder(null)}
                className="p-1 hover:bg-white/10 text-white rounded bg-white/5"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Receipt invoice content */}
            <div className="p-6 space-y-6 text-xs text-slate-800" id="receipt-invoice-area">
              
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-base font-black">
                  শ
                </div>
                <h4 className="text-base font-black text-emerald-950">{settings.business_name}</h4>
                <p className="text-[10px] text-slate-500">মোবাইলঃ {settings.contact_number} | হোয়াটসঅ্যাপঃ {settings.whatsapp_number}</p>
                <p className="text-[9px] text-slate-400 font-mono">অর্ডার কোডঃ {activeInvoiceOrder.order_id}</p>
              </div>

              {/* Details table */}
              <div className="space-y-1.5 leading-relaxed">
                <p><strong>ক্রেতার নাম:</strong> {activeInvoiceOrder.customer_name}</p>
                <p><strong>মোবাইল নম্বর:</strong> {activeInvoiceOrder.phone}</p>
                <p><strong>ঠিকানা:</strong> {activeInvoiceOrder.address}</p>
                <p><strong>তারিখ:</strong> {new Date(activeInvoiceOrder.created_at).toLocaleString('bn-BD')}</p>
              </div>

              {/* Description items */}
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-dashed border-slate-200 font-bold text-emerald-950">
                    <th className="py-2.5">পণ্য আইটেম</th>
                    <th className="py-2.5 text-center">পরিমাণ</th>
                    <th className="py-2.5 text-right font-mono">মূল্য</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100/60 text-slate-650">
                    <td className="py-2.5">{activeInvoiceOrder.product}</td>
                    <td className="py-2.5 text-center">{activeInvoiceOrder.quantity} প্যাক</td>
                    <td className="py-2.5 text-right font-mono">৳{activeInvoiceOrder.total_price - (activeInvoiceOrder.address.includes('ঢাকা') ? settings.delivery_charge_inside : settings.delivery_charge_outside)}</td>
                  </tr>
                  <tr className="text-slate-500 text-[10px]">
                    <td className="py-1">ক্যালকুলেটেড কুরিয়ার প্রসব চার্জ</td>
                    <td></td>
                    <td className="py-1 text-right font-mono">+ ৳{activeInvoiceOrder.address.includes('ঢাকা') ? settings.delivery_charge_inside : settings.delivery_charge_outside}</td>
                  </tr>
                  <tr className="border-t border-dashed border-slate-200 font-black text-emerald-950 text-sm">
                    <td className="py-2 w-full text-left">পরিশোধযোগ্য সর্বমোট বিল:</td>
                    <td></td>
                    <td className="py-2 text-right font-mono leading-none">৳{activeInvoiceOrder.total_price}</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment methods and instructions */}
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center text-[10px] font-semibold text-emerald-900 border border-emerald-100/50 uppercase font-mono">
                Payment Channel Selected: {activeInvoiceOrder.payment_method} ({activeInvoiceOrder.payment_status})
              </div>

              <div className="text-center font-bold text-[9px] text-slate-400">
                আমাদের থেকে পিওর জিনিস পছন্দ করে কেনার জন্য ধন্যবাদ! সুস্থ থাকুন।
              </div>

            </div>

            {/* Print trigger shortcut CTA buttons */}
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded font-bold text-xs inline-flex items-center gap-1 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>প্রিন্ট রশিদ / PDF ডাউনলোড</span>
              </button>
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded font-bold text-xs text-slate-700"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
