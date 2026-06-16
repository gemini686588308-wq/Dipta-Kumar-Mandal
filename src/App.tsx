import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { Product, Order, Review, WebsiteSettings } from './types';
import { Sparkles, Leaf, ShieldAlert } from 'lucide-react';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial database-driven store records from Fullstack Express
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      
      const [settingsRes, productsRes, ordersRes, reviewsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/reviews')
      ]);

      if (!settingsRes.ok || !productsRes.ok || !ordersRes.ok || !reviewsRes.ok) {
        throw new Error('দয়া করে একটু অপেক্ষা করুন বা সার্ভার কানেকশন চেক করুন।');
      }

      const [settingsData, productsData, ordersData, reviewsData] = await Promise.all([
        settingsRes.json(),
        productsRes.json(),
        ordersRes.json(),
        reviewsRes.json()
      ]);

      setSettings(settingsData);
      setProducts(productsData);
      setOrders(ordersData);
      setReviews(reviewsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'সার্ভার থেকে ডাটা লোড করা কঠিন হচ্ছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Sync state modifications after submitting orders
  const handleOrderAdd = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    // Optionally decrements current product stock catalog count locally immediately
    if (newOrder.product_id) {
      setProducts(prevProds => 
        prevProds.map(p => 
          p.id === newOrder.product_id 
            ? { ...p, stock_quantity: Math.max(0, p.stock_quantity - newOrder.quantity) }
            : p
        )
      );
    }
  };

  // Sync state update when adding reviews
  const handleReviewAdd = (newReview: Partial<Review>) => {
    setReviews(prev => [newReview as Review, ...prev]);
  };

  const handleScrollToOrder = () => {
    const el = document.getElementById('order-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full border-4 border-[#0F5132]/10 border-t-[#0F5132] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-[#0F5132] animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#0F5132] font-sans uppercase tracking-wide">শুদ্ধ খেজুরের গুড় ও বাঙ্গালিয়ানা</h3>
        <p className="text-sm text-[#0F5132]/70 mt-2 font-medium tracking-wide">হালাল ও নির্ভেজাল খেজুরের গুড় স্টোর লোড হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center text-[#2d2d2d]">
        <div className="p-8 bg-white border-2 border-red-500 max-w-md space-y-4 rounded-sm shadow-sm">
          <ShieldAlert className="h-10 w-10 text-red-650 mx-auto" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-red-600">সার্ভার কানেকশন এরর</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{error}</p>
          <button
            onClick={fetchStoreData}
            className="w-full py-3 bg-[#0F5132] text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#D4A017] hover:text-[#0F5132] transition"
          >
            আবার চেষ্টা করুন (Retry)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root-container" className="min-h-screen bg-[#FAF9F6] text-[#2d2d2d] flex flex-col justify-between font-sans">
      
      {/* Dynamic Header */}
      <Header
        settings={settings!}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOrderClick={handleScrollToOrder}
      />

      {/* Main Core View Area */}
      <main className="flex-grow">
        {isAdmin ? (
          <AdminDashboard
            products={products}
            orders={orders}
            reviews={reviews}
            settings={settings!}
            onUpdateProducts={setProducts}
            onUpdateOrders={setOrders}
            onUpdateSettings={setSettings}
          />
        ) : (
          <LandingPage
            products={products}
            settings={settings!}
            reviews={reviews}
            onOrderSuccess={handleOrderAdd}
            onAddReview={handleReviewAdd}
          />
        )}
      </main>

      {/* Shared Footer across customer experience */}
      <Footer 
        settings={settings!} 
        setIsAdmin={setIsAdmin}
      />

    </div>
  );
}
