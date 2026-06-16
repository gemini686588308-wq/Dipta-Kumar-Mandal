import React from 'react';
import { Phone, MessageCircle, Settings, ShoppingBag, ShieldCheck } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface HeaderProps {
  settings: WebsiteSettings;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  onOrderClick: () => void;
}

export default function Header({ settings, isAdmin, setIsAdmin, onOrderClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0F5132] text-white border-b-4 border-[#D4A017] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand Name */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setIsAdmin(false)}>
            <div className="h-11 w-11 rounded-full bg-[#D4A017] text-[#0F5132] flex items-center justify-center font-black text-xl border-2 border-white shadow-sm">
              <span>শ</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black leading-none uppercase tracking-wider text-white">
                {settings.business_name}
              </h1>
              <p className="text-[10px] text-[#D4A017] uppercase tracking-[0.15em] font-bold mt-1 hidden sm:block">১০০% খাঁটি খেজুরের গুড় • pure & natural</p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest text-white/90">
            <a href="#why-choose-us" className="hover:text-[#D4A017] transition-colors duration-200">কেন আমরা সেরা</a>
            <a href="#products" className="hover:text-[#D4A017] transition-colors duration-200">আমাদের গুড়</a>
            <a href="#benefits" className="hover:text-[#D4A017] transition-colors duration-200">উপকারিতা</a>
            <a href="#reviews" className="hover:text-[#D4A017] transition-colors duration-200">রিভিউসমূহ</a>
            <a href="#faq" className="hover:text-[#D4A017] transition-colors duration-200">জিজ্ঞাসা</a>
          </nav>

          {/* Call to Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Toggle to Admin Dashboard */}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              id="admin-toggle-btn"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-sm border uppercase tracking-wider transition-all duration-200 ${
                isAdmin 
                  ? 'bg-[#D4A017] border-[#D4A017] text-[#0F5132] shadow-sm'
                  : 'bg-transparent text-white/80 border-white/20 hover:border-[#D4A017] hover:text-[#D4A017]'
              }`}
            >
              {isAdmin ? (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>ভিজিটর ভিউ</span>
                </>
              ) : (
                <>
                  <Settings className="h-3.5 w-3.5" />
                  <span>অ্যাডমিন প্যানেল</span>
                </>
              )}
            </button>

            {/* Calling button */}
            <a
              href={`tel:${settings.contact_number}`}
              id="header-call-btn"
              className="p-2.5 bg-white/10 text-white rounded-sm hover:bg-[#D4A017]/25 hover:text-[#D4A017] transition-colors hidden sm:flex items-center justify-center border border-white/10"
              title="কল করুন"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>

            {/* Main CTA */}
            <button
              onClick={onOrderClick}
              id="header-order-now-btn"
              className="flex items-center gap-2 bg-[#D4A017] text-[#0F5132] hover:bg-white hover:text-[#0F5132] active:scale-95 px-4 sm:px-5 py-2.5 rounded-sm font-bold text-xs sm:text-sm border border-[#D4A017] transition-all duration-200 tracking-widest shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>বুকিং করুন</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
