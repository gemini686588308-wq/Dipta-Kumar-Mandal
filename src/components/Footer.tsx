import React from 'react';
import { Phone, MessageSquare, Facebook, HelpCircle, ShieldCheck } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface FooterProps {
  settings: WebsiteSettings;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function Footer({ settings, setIsAdmin }: FooterProps) {
  return (
    <footer className="bg-[#0F5132] text-white/90 font-sans border-t-4 border-[#D4A017]">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-[#D4A017] text-[#0F5132] flex items-center justify-center font-bold text-lg border-2 border-white rounded-sm shadow-sm">
                শ
              </div>
              <span className="text-xl font-black uppercase tracking-wider text-white">{settings.business_name}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">
              আমরা দিচ্ছি যশোরের গ্রাম থেকে সরাসরি সংগৃহীত শতভাগ খাঁটি ও কেমিক্যালমুক্ত গুড়। গাছিদের ঐতিহ্যবাহী রন্ধন প্রক্রিয়ায় তৈরি আসল খেজুরের গুড় আমাদের মাধ্যমে পৌঁছে যাবে আপনার হাতের মুঠোয়।
            </p>
            {/* Social icons */}
            <div className="flex space-x-3 pt-2">
              <a 
                href={settings.facebook_link} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-white/10 hover:bg-[#D4A017] hover:text-[#0F5132] rounded-sm transition-all duration-200"
                title="Facebook Page"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href={settings.messenger_link} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-white/10 hover:bg-[#D4A017] hover:text-[#0F5132] rounded-sm transition-all duration-200"
                title="Messenger Chat"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <a 
                href={`https://wa.me/${settings.whatsapp_number}`} 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-white/10 hover:bg-[#D4A017] hover:text-[#0F5132] rounded-sm transition-all duration-200"
                title="WhatsApp Message"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[#D4A017] text-sm font-bold tracking-widest uppercase mb-4">গুরুত্বপূর্ণ লিংক</h3>
            <ul className="space-y-2.5 text-xs font-semibold uppercase tracking-wider">
              <li>
                <a href="#why-choose-us" className="hover:text-[#D4A017] transition-colors">কেন আমাদের নির্বাচন করবেন?</a>
              </li>
              <li>
                <a href="#products" className="hover:text-[#D4A017] transition-colors">আমাদের গুড় আইটেম</a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-[#D4A017] transition-colors">স্বাস্থ্য উপকারিতা</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#D4A017] transition-colors">কাস্টমারদের অনুভূতি</a>
              </li>
              <li>
                <button onClick={() => setIsAdmin(true)} className="hover:text-[#D4A017] text-left transition-colors font-bold uppercase">
                  অ্যাডমিন ড্যাশবোর্ড
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-[#D4A017] text-sm font-bold tracking-widest uppercase mb-4">যোগাযোগ</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              যেকোনো অর্ডার সংক্রান্ত সহযোগিতা বা বিশেষ কম্বো প্যাকের জন্য সরাসরি যোগাযোগ করুন আমাদের সাথে।
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-bold text-[#D4A017]">কল করুন:</span> 
                <a href={`tel:${settings.contact_number}`} className="hover:underline font-semibold">{settings.contact_number}</a>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-[#D4A017]">হোয়াটসঅ্যাপ:</span> 
                <a href={`https://wa.me/${settings.whatsapp_number}`} className="hover:underline font-semibold">{settings.whatsapp_number}</a>
              </p>
              <p className="text-xs text-white/60 pt-2 border-t border-white/10 mt-2.5">
                ডেলিভারি চার্জ: ঢাকার ভেতরে ৩০২ টাকার ফ্রি ডেলিভারি প্যাকেজ বা নির্ধারিত ৮০ টাকা। ঢাকার বাহিরে ১৫০ টাকা (সারা বাংলাদেশ)।
              </p>
            </div>
          </div>

        </div>

        {/* Payment logos and copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-white/60 font-semibold tracking-wide uppercase">
            {settings.footer_text}
          </p>
          
          {/* Bangladesh Payment Official Badges */}
          <div className="flex flex-wrap items-center gap-2.5 opacity-90">
            <span className="text-xs text-white/60 mr-1.5 font-bold uppercase tracking-wider">পেমেন্ট মাধ্যম:</span>
            <div className="px-2.5 py-1 bg-white rounded-sm flex items-center justify-center text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-100">
              bKash
            </div>
            <div className="px-2.5 py-1 bg-white rounded-sm flex items-center justify-center text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100">
              Nagad
            </div>
            <div className="px-2.5 py-1 bg-white rounded-sm flex items-center justify-center text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-100">
              Rocket
            </div>
            <div className="px-2.5 py-1 bg-white rounded-sm flex items-center justify-center text-[10px] font-black text-[#0F5132] bg-emerald-50 border border-emerald-100">
              CASH ON DELIVERY
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
