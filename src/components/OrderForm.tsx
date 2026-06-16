import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, Truck, Phone, ChevronRight, MessageSquare, ShieldCheck, CreditCard } from 'lucide-react';
import { Product, WebsiteSettings, Order } from '../types';

interface OrderFormProps {
  products: Product[];
  settings: WebsiteSettings;
  selectedProductId: string;
  onOrderSuccess: (order: Order) => void;
  onClose?: () => void;
}

export default function OrderForm({ products, settings, selectedProductId, onOrderSuccess, onClose }: OrderFormProps) {
  const activeProducts = products.filter(p => p.status === 'active');
  
  // State variables
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    product_id: selectedProductId || (activeProducts[0]?.id || ''),
    quantity: 1,
    location: 'inside', // 'inside' or 'outside' Dhaka
    payment_method: 'cod' as 'bkash' | 'nagad' | 'rocket' | 'cod',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Sync selectedProductId from props
  useEffect(() => {
    if (selectedProductId) {
      setFormData(prev => ({ ...prev, product_id: selectedProductId }));
    }
  }, [selectedProductId]);

  // Find active product matching state
  const currentProduct = activeProducts.find(p => p.id === formData.product_id);
  const deliveryCharge = formData.location === 'inside' 
    ? settings.delivery_charge_inside 
    : settings.delivery_charge_outside;

  const subtotal = currentProduct ? (currentProduct.sale_price * formData.quantity) : 0;
  const totalPrice = subtotal + deliveryCharge;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'আপনার নাম লিখুন (Name is required)';
    }

    // BD Phone validation: must be exactly 11 digits and start with 01
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'মোবাইল নম্বরটি লিখুন (Mobile number is required)';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমনঃ 01712345678)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'পূর্ণাঙ্গ ডেলিভারি ঠিকানা লিখুন (Full Address is required)';
    }

    if (!formData.product_id) {
      newErrors.product_id = 'অনুগ্রহ করে একটি গুড়ের ধরন নির্বাচন করুন';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'পরিমাণ অন্তত ১ হতে হবে';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to first error
      const errorField = Object.keys(errors)[0];
      const element = document.getElementsByName(errorField)[0];
      if (element) element.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProd = activeProducts.find(p => p.id === formData.product_id);
      
      const payload = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        product: selectedProd ? selectedProd.product_name : 'Unknown Product',
        product_id: formData.product_id,
        quantity: formData.quantity,
        total_price: totalPrice,
        payment_method: formData.payment_method,
        payment_status: formData.payment_method === 'cod' ? 'pending' : 'pending',
        status: 'pending',
        notes: formData.notes,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submission order');
      const data = await response.json();
      
      if (data.success) {
        setCreatedOrder(data.order);
        onOrderSuccess(data.order);
      }
    } catch (err: any) {
      alert('অর্ডার সাবমিট করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 text-center border-2 border-emerald-500/30 max-w-2xl mx-auto shadow-xl transition-all">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-800 mb-4 animate-bounce">
          <CheckCircle className="h-10 w-10" />
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-bold text-emerald-950 font-sans mb-2">
          আলহামদুলিল্লাহ্‌, আপনার অর্ডার সম্পন্ন হয়েছে!
        </h3>
        
        <p className="text-sm text-emerald-800/80 mb-6 sm:mb-8 font-mono">
          অর্ডার ট্র্যাকিং আইডি (Order ID): <strong className="text-amber-600 text-lg">{createdOrder.order_id}</strong>
        </p>

        {/* Invoice Summary */}
        <div className="bg-white rounded-xl p-5 text-left border border-emerald-100 mb-6 shadow-sm">
          <h4 className="text-emerald-900 font-bold border-b border-emerald-100 pb-2.5 mb-3 flex items-center justify-between">
            <span>অর্ডারের বিস্তারিত বিবরণ</span>
            <span className="text-xs text-amber-600 font-mono">তারিখ: {new Date(createdOrder.created_at).toLocaleDateString('bn-BD')}</span>
          </h4>
          <div className="space-y-2 text-sm text-emerald-900/95">
            <p><strong>গ্রাহক:</strong> {createdOrder.customer_name}</p>
            <p><strong>মোবাইল নম্বর:</strong> {createdOrder.phone}</p>
            <p><strong>ঠিকানা:</strong> {createdOrder.address}</p>
            <p><strong>পণ্য:</strong> <span className="text-emerald-950 font-medium">{createdOrder.product}</span></p>
            <p><strong>পরিমাণ:</strong> {createdOrder.quantity} টি</p>
            <p><strong>পেমেন্ট পদ্ধতি:</strong> 
              <span className="ml-1.5 px-2.0 py-0.5 rounded text-xs font-bold font-mono uppercase bg-emerald-100 text-emerald-800">
                {createdOrder.payment_method === 'cod' ? 'Cash On Delivery' : createdOrder.payment_method}
              </span>
            </p>
            <div className="border-t border-dashed border-emerald-100 pt-2.5 mt-2.5 flex justify-between font-bold text-base text-emerald-950">
              <span>সর্বমোট মূল্য (ডেলিভারিসহ):</span>
              <span className="text-emerald-800">৳{createdOrder.total_price} টাকা</span>
            </div>
          </div>
        </div>

        {/* Payment guides based on selection */}
        {createdOrder.payment_method !== 'cod' && (
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 text-left mb-6">
            <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-700" />
              <span>মোবাইল ব্যাংকিং পেমেন্ট নির্দেশিকা</span>
            </h5>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              আপনার নির্বাচিত পেমেন্ট মাধ্যম <strong>{createdOrder.payment_method.toUpperCase()}</strong>। অনুগ্রহ করে আমাদের পার্সোনাল নাম্বারে <strong className="text-emerald-900">{settings.whatsapp_number}</strong> <strong>৳{createdOrder.total_price}</strong> টাকা Send Money করুন। 
              <br /><br />
              টাকা পাঠানোর পর রেফারেন্সে আপনার অর্ডারের কোড <strong>{createdOrder.order_id}</strong> লিখে দিন অথবা ট্রানজেকশন আইডিটি মেসেজ করুন। কোনো সমস্যা হলে কল করুন।
            </p>
          </div>
        )}

        {/* Confirmation instructions and social */}
        <p className="text-emerald-900/90 text-sm mb-8 leading-relaxed max-w-md mx-auto">
          খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার মোবাইল নাম্বারে ফোন করে ডেলিভারি ও অর্ডারটি নিশ্চিত করবেন। দয়া করে ফোনটি সাথে রাখুন ও কলটি রিসিভ করুন।
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href={`https://wa.me/${settings.whatsapp_number}?text=হ্যালো, আমি আমার অর্ডার নিশ্চিত করতে চাই। অর্ডার আইডি: ${createdOrder.order_id}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow transition-all duration-150"
          >
            <MessageSquare className="h-5 w-5" />
            <span>হোয়াটসঅ্যাপে জানান</span>
          </a>
          <a
            href={`tel:${settings.contact_number}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 px-6 py-3 rounded-xl font-bold shadow transition-all duration-150"
          >
            <Phone className="h-5 w-5" />
            <span>সরাসরি কল দিন</span>
          </a>
          <button
            onClick={() => {
              setCreatedOrder(null);
              setFormData({
                customer_name: '',
                phone: '',
                address: '',
                product_id: activeProducts[0]?.id || '',
                quantity: 1,
                location: 'inside',
                payment_method: 'cod',
                notes: '',
              });
              if (onClose) onClose();
            }}
            className="w-full sm:w-auto text-emerald-800 hover:text-emerald-950 text-sm font-semibold underline py-3"
          >
            নতুন আরেকটি অর্ডার করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 overflow-hidden" id="order-form">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 px-6 py-5 text-white">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 font-sans text-amber-300">
          <ShoppingCart className="h-5.5 w-5.5" />
          <span>অনলাইন অর্ডার ফর্ম (সরাসরি ক্যাশ অন ডেলিভারি)</span>
        </h3>
        <p className="text-xs text-emerald-200 mt-1">
          ফর্মটি পূরণ করে "অর্ডার প্লেস করুন" বাটনে ক্লিক করুন। কোনো অগ্রিম টাকা লাগবে না।
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 font-sans">
        
        {/* Name Fields */}
        <div>
          <label className="block text-sm font-semibold text-emerald-950 mb-1">
            আপনার নাম <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-emerald-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.customer_name ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-emerald-500'
            }`}
            placeholder="যেমনঃ কামরুল হাসান"
          />
          {errors.customer_name && <span className="text-xs text-red-500 mt-1 block">{errors.customer_name}</span>}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-semibold text-emerald-950 mb-1">
            মোবাইল নম্বর <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">+88</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\s+/g, '') }))}
              className={`w-full pl-12 pr-4 py-2.5 rounded-lg border text-sm text-emerald-950 font-mono tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.phone ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-emerald-500'
              }`}
              placeholder="017XXXXXXXX"
              maxLength={11}
            />
          </div>
          {errors.phone ? (
            <span className="text-xs text-red-500 mt-1 block">{errors.phone}</span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-0.5 block">মোবাইল নম্বরে আমরা কল করে ঠিকানা চেক করে কুড়িয়্যার করব।</span>
          )}
        </div>

        {/* Full Delivery Address */}
        <div>
          <label className="block text-sm font-semibold text-emerald-950 mb-1">
            পূর্ণাঙ্গ ঠিকানা (গ্রাম/রোড, থানা, জেলা) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-emerald-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.address ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-emerald-500'
            }`}
            placeholder="যেমনঃ বাসা নং- ২৪, রোড নং- ২, ব্লক- সি, ধানমন্ডি, ঢাকা।"
          />
          {errors.address && <span className="text-xs text-red-500 mt-1 block">{errors.address}</span>}
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Dropdowns for selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Select Product */}
          <div>
            <label className="block text-sm font-semibold text-emerald-950 mb-1">
              গুড়ের আইটেম নির্বাচন করুন
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name} — ৳{p.sale_price} ({p.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-semibold text-emerald-950 mb-1">
              পরিমাণ (Quantity)
            </label>
            <div className="flex items-center h-10 w-full max-w-[150px] border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                className="w-11 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-emerald-950 font-bold text-lg select-none transition"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold font-mono text-emerald-950">{formData.quantity}</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                className="w-11 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-emerald-950 font-bold text-lg select-none transition"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Delivery Area Picker */}
        <div>
          <label className="block text-sm font-semibold text-emerald-950 mb-1.5">ডেলিভারি এরিয়া</label>
          <div className="grid grid-cols-2 gap-3.5">
            <label className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border cursor-pointer select-none transition duration-150 ${
              formData.location === 'inside'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="location"
                value="inside"
                checked={formData.location === 'inside'}
                onChange={() => setFormData(prev => ({ ...prev, location: 'inside' }))}
                className="accent-emerald-700 h-4 w-4"
              />
              <div className="flex flex-col text-xs sm:text-sm">
                <span>ঢাকার ভেতর</span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">চার্জ: ৳{settings.delivery_charge_inside}</span>
              </div>
            </label>

            <label className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border cursor-pointer select-none transition duration-150 ${
              formData.location === 'outside'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="location"
                value="outside"
                checked={formData.location === 'outside'}
                onChange={() => setFormData(prev => ({ ...prev, location: 'outside' }))}
                className="accent-emerald-700 h-4 w-4"
              />
              <div className="flex flex-col text-xs sm:text-sm">
                <span>ঢাকার বাইরে</span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">চার্জ: ৳{settings.delivery_charge_outside}</span>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Methods selector with Official Logos */}
        <div>
          <label className="block text-sm font-semibold text-emerald-950 mb-2.5">
            পেমেন্ট মাধ্যম (Payment Method) <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* COD */}
            <label className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer text-center transition duration-150 relative ${
              formData.payment_method === 'cod'
                ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input 
                type="radio" 
                name="payment_method" 
                value="cod" 
                checked={formData.payment_method === 'cod'}
                onChange={() => setFormData(prev => ({ ...prev, payment_method: 'cod' }))}
                className="sr-only"
              />
              <span className="text-emerald-800 text-[10px] sm:text-xs font-bold leading-tight font-sans">ক্যাশ অন ডেলিভারি</span>
              <span className="text-[9px] font-medium text-slate-500 font-sans mt-1">পণ্য পেয়ে মূল্য দিন</span>
            </label>

            {/* bKash */}
            <label className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer text-center transition duration-150 relative ${
              formData.payment_method === 'bkash'
                ? 'bg-pink-50 border-pink-500 ring-1 ring-pink-400'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input 
                type="radio" 
                name="payment_method" 
                value="bkash" 
                checked={formData.payment_method === 'bkash'}
                onChange={() => setFormData(prev => ({ ...prev, payment_method: 'bkash' }))}
                className="sr-only"
              />
              <span className="text-pink-600 text-xs font-black tracking-wider uppercase">bKash</span>
              <span className="text-[9px] font-medium text-pink-700/80 font-sans mt-1">বিকাশ পেমেন্ট</span>
            </label>

            {/* Nagad */}
            <label className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer text-center transition duration-150 relative ${
              formData.payment_method === 'nagad'
                ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-450'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input 
                type="radio" 
                name="payment_method" 
                value="nagad" 
                checked={formData.payment_method === 'nagad'}
                onChange={() => setFormData(prev => ({ ...prev, payment_method: 'nagad' }))}
                className="sr-only"
              />
              <span className="text-orange-600 text-xs font-black tracking-wider uppercase">Nagad</span>
              <span className="text-[9px] font-medium text-orange-700/80 font-sans mt-1">নগদ ওয়ালেট</span>
            </label>

            {/* Rocket */}
            <label className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer text-center transition duration-150 relative ${
              formData.payment_method === 'rocket'
                ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-400'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input 
                type="radio" 
                name="payment_method" 
                value="rocket" 
                checked={formData.payment_method === 'rocket'}
                onChange={() => setFormData(prev => ({ ...prev, payment_method: 'rocket' }))}
                className="sr-only"
              />
              <span className="text-purple-700 text-xs font-black tracking-wider uppercase">Rocket</span>
              <span className="text-[9px] font-medium text-purple-700/80 font-sans mt-1">রকেট অ্যাপ</span>
            </label>

          </div>
        </div>

        {/* Special Notes (Preferences) */}
        <div>
          <label className="block text-sm font-semibold text-emerald-950 mb-1">
            বিশেষ কোনো নির্দেশনা থাকলে লিখুন (অনচ্ছিক)
          </label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-emerald-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="যেমনঃ বেশি শক্ত পাটালি চাই বা ঝোলা গুড় ঘন হতে হবে।"
          />
        </div>

        {/* Billing Overview Panel - Clean, elegant summary calculation */}
        <div className="bg-emerald-50/50 rounded-xl p-4.5 border border-emerald-100 flex flex-col space-y-2 text-sm text-emerald-900">
          <div className="flex justify-between">
            <span>গুড়ের মূল্য:</span>
            <span className="font-semibold">{formData.quantity} × ৳{currentProduct?.sale_price || 0} = ৳{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>ডেলিভারি চার্জ:</span>
            <span className="font-semibold">+ ৳{deliveryCharge}</span>
          </div>
          <div className="border-t border-emerald-100 my-2 pt-2.5 flex justify-between font-bold text-base text-emerald-950">
            <span>সর্বমোট পরিশোধযোগ্য মূল্য:</span>
            <span className="text-emerald-800 text-lg">৳{totalPrice} টাকা</span>
          </div>
        </div>

        {/* Privacy secure notice */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/30 p-2.5 rounded-lg">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>আপনার ব্যক্তিগত তথ্য সম্পূর্ণ নিরাপদ। ১০০% নির্ভেজাল খাঁটি ও আসল খেজুরের গুড় পেতে নিরাপদ অর্ডার করুন।</span>
        </div>

        {/* Submit order CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          id="submit-order-form-btn"
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 disabled:opacity-50 text-emerald-950 text-base sm:text-lg font-extrabold py-3.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition duration-200"
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
              <span>অর্ডার প্রসেস হচ্ছে...</span>
            </>
          ) : (
            <>
              <Truck className="h-5.5 w-5.5 text-emerald-950" />
              <span>কনফার্ম অর্ডার করুন (৳{totalPrice} Taka)</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
