import React, { useState } from 'react';
import { 
  Shield, 
  Leaf, 
  Users, 
  MapPin, 
  CheckCircle, 
  HelpCircle, 
  Award, 
  Flame, 
  MessageSquare, 
  Star, 
  PhoneCall, 
  ChevronDown, 
  Sparkles, 
  ArrowRight,
  Heart,
  Plus
} from 'lucide-react';
import { Product, WebsiteSettings, Review, Order } from '../types';
import OrderForm from './OrderForm';

// Helper to resolve generated images dynamically or fallback to uploaded files
export function resolveImage(imageKey: string): string {
  if (!imageKey) return 'https://picsum.photos/seed/gur/400/300';
  if (imageKey.startsWith('/') || imageKey.startsWith('http')) return imageKey;
  
  const map: { [key: string]: string } = {
    'molasses_hero_banner': '/src/assets/images/molasses_hero_banner_1781539476509.jpg',
    'molasses_clay_pot': '/src/assets/images/molasses_clay_pot_1781539494407.jpg',
    'molasses_liquid_jar': '/src/assets/images/molasses_liquid_jar_1781539512501.jpg'
  };
  
  return map[imageKey] || `https://picsum.photos/seed/${imageKey}/450/350`;
}

interface LandingPageProps {
  products: Product[];
  settings: WebsiteSettings;
  reviews: Review[];
  onOrderSuccess: (order: Order) => void;
  onAddReview: (review: Partial<Review>) => void;
}

export default function LandingPage({ products, settings, reviews, onOrderSuccess, onAddReview }: LandingPageProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newReviewForm, setNewReviewForm] = useState({ customer_name: '', comment: '', rating: 5, location: '' });
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  // Smooth scroll to element by ID
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    scrollTo('order-section');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.customer_name.trim() || !newReviewForm.comment.trim()) {
      alert('অনুগ্রহ করে নাম এবং আপনার মন্তব্য লিখুন।');
      return;
    }
    
    setIsReviewSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewForm),
      });
      if (response.ok) {
        const data = await response.json();
        onAddReview(data.review);
        setShowReviewSuccess(true);
        setNewReviewForm({ customer_name: '', comment: '', rating: 5, location: '' });
        setTimeout(() => setShowReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Why Choose Us array
  const whyUs = [
    {
      icon: <Award className="h-7 w-7 text-amber-500" />,
      title: "১০০% প্রিমিয়াম ও খাঁটি",
      desc: "আমাদের খেজুরের গুড়ে কোনো চিনি, আটা, ফিটকিরি বা কৃত্রিম রাসায়নিক কেমিক্যাল মেশানো হয় না।"
    },
    {
      icon: <Leaf className="h-7 w-7 text-emerald-600" />,
      title: "শতভাগ কেমিক্যালমুক্ত",
      desc: "সম্পূর্ণ প্রাকৃতিকভাবে তৈরি বিধায় গুড়ে খেজুরের রসের মিষ্টি প্রাকৃতিক ঝাঁঝ আর আসল সুবাস অটুট থাকে।"
    },
    {
      icon: <Users className="h-7 w-7 text-indigo-600" />,
      title: "সরাসরি গাছিদের থেকে",
      desc: "যশোরের ঐতিহ্যবাহী গাছিদের থেকে সরাসরি সংগ্রহ করায় গুড়ের সর্বোচ্চ গুণমান নিয়ে কোনো সন্দেহ নেই।"
    },
    {
      icon: <Shield className="h-7 w-7 text-amber-600" />,
      title: "স্বাস্থ্যসম্মত ও পুষ্টিকর",
      desc: "পরিশোধিত চিনির বিকল্প হিসেবে খেজুরের গুড় প্রাকৃতিক শক্তির মূল আধার এবং ভিটামিনে ভরপুর।"
    },
    {
      icon: <Flame className="h-7 w-7 text-orange-600" />,
      title: "ঐতিহ্যবাহী জ্বাল প্রক্রিয়া",
      desc: "লোহার কড়াইয়ে ধীর আগুনে দীর্ঘ সময় জ্বাল দিয়ে প্রস্তুত করা হয় বলে এর চমৎকার সোঁদা গন্ধ ভোলার নয়।"
    },
    {
      icon: <CheckCircle className="h-7 w-7 text-emerald-700" />,
      title: "ক্যাশ অন ডেলিভারি",
      desc: "সারাদেশে কুরিয়ার সুবিধা। আগে পণ্য পেয়ে পরীক্ষা করে তারপর মূল্য পরিশোধ করার নিশ্চয়তা।"
    }
  ];

  // Benefits info array
  const benefits = [
    {
      title: "প্রাকৃতিক শক্তির দুর্দান্ত উৎস",
      desc: "খেজুরের গুড়ে থাকা জটিল শর্করা শরীরে ধীরে ধীরে ছড়িয়ে পড়ে, ফলে ক্লান্তি দূর হয় এবং দীর্ঘক্ষণ এনার্জি বজায় থাকে।"
    },
    {
      title: "হজম প্রক্রিয়ায় দারুণ সহায়ক",
      desc: "খাবার শেষে একটু গুড় খেলে এটি হজমে সাহায্য করে। এটি পাকস্থলীর এনজাইমগুলোকে সক্রিয় করতে চমৎকার ভূমিকা রাখে।"
    },
    {
      title: "রোগ প্রতিরোধ ক্ষমতা বাড়ায়",
      desc: "এতে রয়েছে প্রচুর পরিমাণে জিংক, সেলেনিয়াম ও অন্যান্য মিনারেল যা শরীরের রোগ প্রতিরোধ ক্ষমতা বহুগুণ বৃদ্ধি করে।"
    },
    {
      title: "রক্তস্বল্পতা ও শীতে আরাম",
      desc: "গুড়ে পর্যাপ্ত আয়রন রয়েছে যা হিমোগ্লোবিন বাড়ায় এবং ঠান্ডা কমায়। এটি সর্দি-কাশি থেকেও শরীর রক্ষা করে।"
    }
  ];

  // Local static Bengali FAQs
  const bFaqs = [
    {
      q: "আমাদের গুড় কি সত্যিই ১০০% কেমিক্যালমুক্ত ও চিনিবিহীন?",
      a: "জী, শতভাগ নিশ্চয়তা। আমাদের গুড় যশোর জেলার ঐতিহ্যবাহী সেরা গাছিদের থেকে সরাসরি আমাদের নিজেদের তত্ত্বাবধানে তৈরি করানো হয়। কোনো প্রকার চিনি, ক্ষতিকর কালার কেমিক্যাল বা ফিটকিরি এতে ব্যবহার করা হয় না। গুণগত মানে আমরা কখনো কোনো আপোষ করি না।"
    },
    {
      q: "গুড় নষ্ট না করে কীভাবে সংরক্ষণ করা উচিত?",
      a: "আমাদের খাঁটি গুড় প্রাকৃতিকভাবে তৈরি বিধায় এটি রেফ্রিজারেটরে অথবা ঠান্ডা শুষ্ক স্থানে সংরক্ষণ করা সবচেয়ে ভালো। বিশেষ করে ঝোলা গুড় কাঁচের বা ফুড-গ্রেড প্লাস্টিকের এয়ারটাইট কৌটায় রেখে ফ্রিজে রাখলে এক বছরেরও বেশি সময় ঘ্রাণ ও স্বাদ অপরিবর্তিত থাকে।"
    },
    {
      q: "ডেলিভারি চার্জ কত এবং আমি কীভাবে পণ্য হাতে পাব?",
      a: "আমরা সারা বাংলাদেশে হোম ডেলিভারি ও কুরিয়ার করে থাকি। ঢাকার অভ্যন্তরে হোম ডেলিভারি চার্জ ৮০ টাকা এবং সুন্দরবন কুরিয়ারে ঢাকার বাইরে ১৫০ টাকা। সাধারণত ২ থেকে ৩ কার্যদিবসের মধ্যে আপনি অর্ডারকৃত পণ্য পেয়ে যাবেন।"
    },
    {
      q: "ডেলিভারি পেয়ে গুড় পরীক্ষা করার সুযোগ আছে কি?",
      a: "অবশ্যই! আমাদের ডেলিভারি প্রক্রিয়ায় আপনি ঢাকার ভেতরে হলে আগে পণ্য পেয়ে পরীক্ষা করে তারপর মূল্য পরিশোধ করার সুযোগ পাবেন। ঢাকার বাইরে সুন্দরবন কুরিয়ারের ক্ষেত্রেও আমরা এই একই ক্যাশ অন ডেলিভারি সুবিধা দিচ্ছি যাতে পণ্য বুঝে পেয়েই মূল্য শোধ করতে পারেন।"
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-gray-800 min-h-screen">
      
      {/* SECTION 1: HERO SECTION */}
      <section id="hero" className="relative bg-[#FAF9F6] pt-12 pb-16 sm:pb-24 border-b border-gray-205 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#0F5132_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Captivating copy with high-contrast text */}
            <div className="lg:col-span-7 text-left space-y-6">
              <span className="text-xs font-bold text-[#0F5132] bg-[#0F5132]/5 border-2 border-[#0F5132] uppercase px-3.5 py-1.5 rounded-none tracking-widest">
                ১২ মাসের তাজা খেজুরের রস থেকে তৈরি
              </span>
              
              <h2 className="text-[#0F5132] text-3xl sm:text-5xl lg:text-5.5xl font-black leading-tight tracking-tight uppercase font-sans">
                {settings.hero_title || "যশোরের ঐতিহ্যবাহী খাঁটি খেজুরের গুড় ও পাটালি"}
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                {settings.hero_subtitle || "গাছিরা শীতের কুয়াশাচ্ছন্ন সকালে মাটির কড়াই জ্বাল দিয়ে ঐতিহ্যবাহী নিয়মে যে প্রাকৃতিক গুড় প্রস্তুত করে, আমরা সরাসরি সেই গুড় পৌঁছে দিচ্ছি আপনার দোরগোড়ায়। কোনো কেমিক্যাল, হাইড্রোজেন বা চিনি মেশানো হয় না। শতভাগ গুণমান ও খাঁটি স্বাদের গ্যারান্টি।" }
              </p>
              
              {/* Trust parameters banner row */}
              <div className="grid grid-cols-3 gap-4 py-2 text-[#0F5132]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-lg sm:text-xl font-black">১০০% অর্গানিক</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">নো এডিটিভস</span>
                </div>
                <div className="border-l border-gray-200 pl-4 flex flex-col gap-1.5">
                  <span className="text-lg sm:text-xl font-black">সরাসরি গাছি থেকে</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">সংগৃহীত খাঁটি গুড়</span>
                </div>
                <div className="border-l border-gray-200 pl-4 flex flex-col gap-1.5">
                  <span className="text-lg sm:text-xl font-black">COD সুবিধা</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">পণ্য দেখে মূল্য দিন</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {/* Scroll to order booking now */}
                <button
                  onClick={() => scrollTo('products')}
                  id="hero-order-scroll-btn"
                  className="bg-[#D4A017] hover:bg-[#0F5132] hover:text-white text-[#0F5132] font-black text-xs uppercase tracking-widest px-8 py-4.5 rounded-none transition duration-200 border-2 border-[#D4A017] text-center whitespace-nowrap"
                >
                  গুড় অর্ডার করুন
                </button>
                    
                <a
                  href={`tel:${settings.contact_number}`}
                  id="hero-cta-call-btn"
                  className="bg-[#0F5132] hover:bg-[#D4A017] hover:text-[#0F5132] text-white text-center font-bold text-xs uppercase tracking-widest px-6 py-4.5 rounded-sm flex items-center justify-center gap-2 border-2 border-[#0F5132]"
                >
                  <PhoneCall className="h-4 w-4 text-[#D4A017]" />
                  <span>কল করুন: {settings.contact_number}</span>
                </a>
              </div>
            </div>

            {/* Right Col: High-Res Beautiful Generated Banner Image with gold accents */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute -inset-1.5 bg-[#D4A017] rounded-sm blur-0 opacity-100"></div>
              <div className="relative bg-white p-2.5 rounded-sm border border-gray-200 shadow-lg">
                <img
                  src={resolveImage(settings.banner_image)}
                  alt="Premium Date Molasses Shuddho Khejurer Gur Banner"
                  referrerPolicy="no-referrer"
                  className="rounded-none w-full aspect-[4/3] sm:aspect-[16/10] object-cover"
                />
                
                {/* Banner Mini Specs Badges */}
                <span className="absolute top-6 left-6 bg-[#0F5132] text-white font-extrabold text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-none border border-[#D4A017] shadow-md-none">
                  শীতকালের সেরা অফার
                </span>
                
                {/* Mini trust card */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-sm border border-gray-200 shadow-md max-w-xs flex items-center gap-3">
                  <div className="h-9 w-9 flex-shrink-0 rounded-sm bg-[#FAF9F6] border border-gray-100 flex items-center justify-center text-[#0F5132]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#0F5132] uppercase tracking-wider">১০০% রিপ্লেসমেন্ট সুবিধা</h4>
                    <p className="text-[10px] text-gray-500 font-semibold leading-tight mt-0.5">গুড় পছন্দ না হলে কোনো চার্জ ছাড়াই সাথে সাথে ফেরত দিন!</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: WHY CHOOSE US (Highlight grid representing purity and trust) */}
      <section id="why-choose-us" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h3 className="text-[#0F5132] text-2xl sm:text-3xl font-black uppercase tracking-tight font-sans">
            অন্যান্য গুড় বাদ দিয়ে কেন আমাদের খেজুরের গুড় বেছে নেবেন?
          </h3>
          <div className="h-1 w-24 bg-[#D4A017] mx-auto mt-4 rounded-none"></div>
          <p className="text-slate-650 text-sm sm:text-base mt-4 font-semibold">
            বাজারে চিনি ও কেমিক্যাল মেশানো ভেজাল গুড়ের ভিড়ে, আমরাই দিচ্ছি সরাসরি গাছির চুলা থেকে সংগ্রহ করা একদম নিষ্কলুষ প্রকৃত আসল স্বাদ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyUs.map((item, idx) => (
            <div key={idx} className="bg-white rounded-sm p-6 border border-gray-200 border-t-4 border-t-[#0F5132] shadow-sm hover:shadow-md transition duration-200">
              <div className="p-3 bg-[#FAF9F6] border border-gray-200 rounded-none inline-block mb-4 text-[#0F5132]">
                {item.icon}
              </div>
              <h4 className="text-[#0F5132] font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PRODUCT SECTION (Display active product cards with editable price specs) */}
      <section id="products" className="py-16 sm:py-24 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#0F5132] bg-[#0F5132]/5 border-2 border-[#0F5132] uppercase px-3.5 py-1.5 rounded-none tracking-widest">
              তাৎক্ষণিক বুকিং করুন
            </span>
            <h3 className="text-[#0F5132] text-2xl sm:text-3xl font-black uppercase tracking-tight font-sans mt-4">
              Our Premium Collection
            </h3>
            <div className="h-1 w-24 bg-[#D4A017] mx-auto mt-4 rounded-none"></div>
            <p className="text-gray-600 text-sm mt-3.5 font-semibold leading-relaxed">
              শীতকালের সকালে তৈরিকৃত গুড়ের স্টক খুবেই সীমিত। তাই পছন্দের গুড়টি এখনই পছন্দ করুন এবং ঝামেলা ছাড়াই ক্যাশ অন ডেলিভারিতে অর্ডার দিন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.filter(p => p.status === 'active').map((p) => {
              const discountPerc = p.price > p.sale_price 
                ? Math.round(((p.price - p.sale_price) / p.price) * 100) 
                : 0;
              
              return (
                <div 
                  key={p.id} 
                  className="bg-[#FAF9F6] rounded-none border-2 border-gray-200 hover:border-[#0F5132] transition-colors duration-250 flex flex-col relative group"
                >
                  {/* Discount Badge */}
                  {discountPerc > 0 && (
                    <span className="absolute top-4 left-4 z-10 bg-amber-500 text-[#0F5132] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border border-[#0F5132]">
                      {discountPerc}% ছাড়
                    </span>
                  )}
                  
                  {/* Stock tag */}
                  {p.stock_quantity <= 0 ? (
                    <span className="absolute top-4 right-4 z-10 bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
                      স্টক শেষ
                    </span>
                  ) : p.stock_quantity < 5 ? (
                    <span className="absolute top-4 right-4 z-10 bg-amber-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none animate-pulse">
                      সীমিত স্টক
                    </span>
                  ) : null}

                  {/* Thumbnail */}
                  <div className="aspect-[4/3] bg-white overflow-hidden relative">
                    <img 
                      src={resolveImage(p.featured_image)} 
                      alt={p.product_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Body Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-[#0F5132] font-black text-xl mb-1.5 tracking-tight">{p.product_name}</h4>
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">{p.description}</p>
                      
                      {/* Product spec mini lines */}
                      <div className="flex flex-wrap gap-2 items-center mb-1">
                        <span className="bg-white px-2.5 py-1 border border-gray-200 rounded-none text-gray-700 font-bold text-[10px] uppercase font-mono">ওজন: {p.weight}</span>
                        <span className="bg-white px-2.5 py-1 border border-gray-200 rounded-none text-gray-700 font-bold text-[10px] uppercase font-mono">শ্রেণী: {p.category}</span>
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        {discountPerc > 0 && (
                          <span className="text-xs text-gray-400 line-through font-mono">
                            ৳{p.price}
                          </span>
                        )}
                        <span className="text-xl font-black text-[#0F5132] font-mono leading-none flex items-baseline gap-0.5">
                          ৳{p.sale_price} <span className="text-xs font-bold font-sans">টাকা</span>
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleOrderProduct(p.id)}
                        disabled={p.stock_quantity <= 0}
                        id={`product-order-btn-${p.slug}`}
                        className={`px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                          p.stock_quantity > 0
                            ? 'bg-[#0F5132] hover:bg-[#D4A017] hover:text-[#0F5132] text-white border border-[#0F5132]'
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <span>বুকিং করুন</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4: BENEFITS SECTION (Nutrition and Health highlights) */}
      <section id="benefits" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] border-y border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Col: list illustration and benefits */}
          <div className="lg:col-span-7 space-y-7">
            <span className="text-xs font-bold text-[#0F5132] bg-[#0F5132]/5 border-2 border-[#0F5132] uppercase px-3.5 py-1.5 rounded-none tracking-widest">
              স্বাস্থ্যের অমূল্য সম্পদ
            </span>
            <h3 className="text-[#0F5132] text-2xl sm:text-3.5xl font-black leading-tight uppercase tracking-tight">
              চিনির বিষাক্ততা পরিহার করুন; খেজুরের গুড়ের সাথে সুস্থ থাকুন
            </h3>
            <div className="h-1 w-20 bg-[#D4A017] rounded-none"></div>
            <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-semibold block">
              সাদা চিনি প্রস্তুত করতে গিয়ে এর সব প্রাকৃতিক ভিটামিন ও খনিজ হারিয়ে যায়। উল্টো দিকে, আমাদের খাঁটি খেজুরের গুড় কোনো ক্ষতিকর প্রক্রিয়াজাত ছাড়াই প্রস্তুত হয়। যার রয়েছে অসাধারণ কিছু স্বাস্থ্য রক্ষাকারী ঔষধীয় ফায়দা:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-6 w-6 rounded-none bg-[#0F5132]/10 border border-[#0F5132] flex items-center justify-center text-[#0F5132] mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-[#D4A017]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0F5132] text-base uppercase tracking-tight">{b.title}</h5>
                    <p className="text-sm text-slate-650 mt-1 leading-normal font-medium">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Static lovely circular icon graphic */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="absolute h-72 w-72 sm:h-96 sm:w-96 bg-[#D4A017]/10 rounded-sm filter blur-2xl opacity-40"></div>
            <div className="relative bg-white rounded-none p-8 border-4 border-[#0F5132] shadow-md max-w-md text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center bg-[#FAF9F6] border border-gray-200 rounded-none mb-4">
                <Heart className="h-8 w-8 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              <h4 className="text-[#0F5132] font-black text-lg mb-3 uppercase tracking-wider">শুদ্ধ খেজুরের গুড়: খাঁটি মিষ্টি, শতভাগ পুষ্টি</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
                &quot;সাদা চিনি শরীরে ফ্যাট জমায় ও ডায়াবেটিসের ঝুঁকি বাড়ায়। অন্যদিকে, খেজুরের গুড় শরীরে হিমোগ্লোবিন বাড়ায় এবং কোষকে বার্ধক্যের হাত থেকে রক্ষা করে।&quot;
              </p>
              <div className="border-t border-gray-200 pt-4 mt-5 flex justify-around text-center">
                <div>
                  <span className="block text-2xl font-black text-[#0F5132]">০%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">কৃত্রিম চিনি</span>
                </div>
                <div className="border-l border-gray-200"></div>
                <div>
                  <span className="block text-2xl font-black text-[#0F5132]">১০০%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">অর্গানিক ও ভেজালমুক্ত</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: CUSTOMER REVIEWS (Interactive testimonial blocks + review submissions) */}
      <section id="reviews" className="py-16 bg-[#FAF9F6] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h3 className="text-[#0F5132] text-2xl sm:text-3xl font-black uppercase tracking-tight">
              প্রিয় ক্রেতাদের সন্তুষ্ট মুখচ্ছবি ও আন্তরিক প্রতিক্রিয়া
            </h3>
            <div className="h-1 w-24 bg-[#D4A017] mx-auto mt-4 rounded-none"></div>
            <p className="text-slate-605 text-sm mt-3.5 font-semibold">
              হাজারের বেশি পরিবার আমাদের এই অর্গানিক গুড় খেয়ে তাদের সন্তুষ্টি প্রকাশ করেছেন। আপনার সিদ্ধান্ত সহজ করতে কয়েকটি কাস্টমার প্রতিক্রিয়া দেখুন।
            </p>
          </div>

          {/* Review cards list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-none border-2 border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  {/* Stars block */}
                  <div className="flex gap-1 mb-3 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4.5 w-4.5 fill-current ${i < rev.rating ? 'text-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-705 text-sm sm:text-base leading-relaxed italic font-medium">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                  <span className="text-sm font-bold text-[#0F5132]">{rev.customer_name}</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#0F5132] font-mono bg-emerald-50 px-2 py-0.5 border border-emerald-100">
                    <MapPin className="h-3 w-3" />
                    <span>{rev.location}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add a Review Interactive Form Modality / Container */}
          <div className="bg-white rounded-none p-6 sm:p-8 border-2 border-[#0F5132] shadow max-w-2xl mx-auto">
            <h4 className="text-[#0F5132] font-black text-lg mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Plus className="h-5 w-5 text-amber-500" />
              <span>আপনার মূল্যবান রিভিউটি আমাদের সাথে শেয়ার করুন</span>
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-normal font-semibold">
              আমাদের গুড় ব্যবহার করার প্রতিক্রিয়া জানিয়ে বাকি ক্রেতাদের সাহায্য করুন। আমরা আপনার গঠনমূলক মন্তব্য অত্যন্ত গুরুত্বের সাথে দেখি!
            </p>

            {showReviewSuccess && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-[#0F5132] rounded-none text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-800" />
                <span>ধন্যবাদ! আপনার রিভিয়ুটি সফলভাবে প্রকাশিত হয়েছে এবং নিচে যুক্ত হয়েছে।</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F5132] mb-1">আপনার নাম (Your Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমনঃ আব্দুর রহমান"
                  value={newReviewForm.customer_name}
                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full px-3.5 py-2 border-2 border-gray-200 text-sm text-gray-800 rounded-none focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F5132] mb-1">অবস্থান (যেমনঃ জেলা বা থানা)</label>
                <input
                  type="text"
                  placeholder="যেমনঃ যশোর, ঢাকা"
                  value={newReviewForm.location}
                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2 border-2 border-gray-200 text-sm text-gray-800 rounded-none focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0F5132] mb-1">রেটিং (Rating)</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewReviewForm(prev => ({ ...prev, rating: num }))}
                      className={`p-2 rounded-none border-2 flex items-center justify-center gap-1 font-bold text-xs select-none transition ${
                        newReviewForm.rating === num 
                          ? 'bg-amber-100 border-[#D4A017] text-amber-900' 
                          : 'bg-slate-50 border-gray-200 text-slate-400'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${newReviewForm.rating >= num ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                      <span>{num} স্টার</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0F5132] mb-1">আপনার মন্তব্য (Review comment)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="যেমনঃ গুড়ের সুবাস ও ঘনত্ব অনেক চমৎকার লেগেছে..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3.5 py-2 border-2 border-gray-200 text-sm text-gray-800 rounded-none focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isReviewSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-[#0F5132] hover:bg-[#D4A017] hover:text-[#0F5132] active:scale-98 disabled:opacity-50 font-black text-xs uppercase tracking-widest text-white rounded-none transition cursor-pointer border-2 border-[#0F5132]"
                >
                  {isReviewSubmitting ? 'রিভিও সাবমিট হচ্ছে...' : 'প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* SECTION 6: FAQ SECTION (Accordion dropdown list) */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0F5132] bg-[#0F5132]/5 border-2 border-[#0F5132] uppercase px-3.5 py-1.5 rounded-none tracking-widest">
            জিজ্ঞাসিত প্রশ্নসমূহ
          </span>
          <h3 className="text-[#0F5132] text-2xl sm:text-3xl font-black uppercase tracking-tight mt-3">
            খেজুরের গুড় সম্পর্কে সাধারণ মানুষের কৌতুহলী জিজ্ঞাসা
          </h3>
          <div className="h-1 w-24 bg-[#D4A017] mx-auto mt-4 rounded-none"></div>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5">
          {bFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-white rounded-none border-2 border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex justify-between items-center font-bold text-[#0F5132] text-sm sm:text-base hover:bg-[#FAF9F6] transition"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-[#D4A017] flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180 text-[#0F5132]' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1.5 border-t border-gray-100 text-slate-600 text-sm leading-relaxed font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: ORDER FORM SECTION (Secure delivery and validation) */}
      <section id="order-section" className="py-16 sm:py-24 bg-[#FAF9F6] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left instructions block */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <span className="text-xs font-bold text-[#0F5132] bg-[#0F5132]/5 border-2 border-[#0F5132] uppercase px-3.5 py-1.5 rounded-none tracking-widest">
                ডেলিভারি নির্দেশিকা
              </span>
              <h3 className="text-[#0F5132] text-2xl sm:text-3.5xl font-black leading-tight uppercase tracking-tight">
                সহজ ৩টি ধাপে প্রিমিয়াম গুড় আপনার ঘরে আনুন
              </h3>
              <div className="h-1 w-20 bg-[#D4A017] rounded-none"></div>
              
              {/* Timeline list info */}
              <div className="space-y-5 pt-3 text-slate-600">
                <div className="flex gap-4">
                  <div className="h-8 w-8 bg-[#0F5132] text-white rounded-none flex items-center justify-center font-bold flex-shrink-0 border border-[#D4A017]">
                    ১
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0F5132] text-base uppercase">অর্ডার ফর্ম পূরণ করুন</h5>
                    <p className="text-sm mt-1 leading-relaxed font-semibold">আপনার সঠিক নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা দিয়ে ফর্মটি সাবমিট করুন। পেমেন্ট COD রাখলে কোনো অগ্রিম দিতে হবে না।</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 bg-[#0F5132] text-white rounded-none flex items-center justify-center font-bold flex-shrink-0 border border-[#D4A017]">
                    ২
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0F5132] text-base uppercase">ফোনে নিশ্চয়তা লাভ</h5>
                    <p className="text-sm mt-1 leading-relaxed font-semibold">অর্ডার সাবমিট করার ১ ঘণ্টার মধ্যে আমাদের প্রতিনিধি আপনাকে কল দিয়ে ট্র্যাকিং নিশ্চিত করবেন এবং স্টকটি আপনার নামে বুকিং হবে।</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-8 w-8 bg-[#0F5132] text-white rounded-none flex items-center justify-center font-bold flex-shrink-0 border border-[#D4A017]">
                    ৩
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0F5132] text-base uppercase">পণ্য পেয়ে মূল্য দিন</h5>
                    <p className="text-sm mt-1 leading-relaxed font-semibold">ঢাকার ভেতরে ২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি এবং ঢাকার বাইরে সুন্দরবন কুরিয়ারে ৪-৫ দিনের মধ্যে পৌঁছে যাবে। পণ্য চেক করে মূল্য পরিশোধ করুন।</p>
                  </div>
                </div>
              </div>

              {/* Call-to-call secure indicator */}
              <div className="p-4 bg-white rounded-none border-2 border-[#0F5132] flex items-center gap-3.5">
                <Shield className="h-8 w-8 text-[#0F5132] flex-shrink-0" />
                <p className="text-xs text-gray-700 font-bold leading-relaxed">
                  নিশ্চিত হোন: আমরা সর্বদা মান রক্ষা করি। পণ্য ক্রয়ের পর কোনো খুঁত বা চিনি মিশ্রণ ধরা পড়লে সম্পূর্ণ টাকা ক্যাশ অন ডেলিভারিতে ফেরতযোগ্য।
                </p>
              </div>

              {/* Directly call phone list block info */}
              <p className="text-sm font-bold text-[#0F5132] text-center">
                ফোনে কোনো নির্দেশ বা অর্ডার করতে চান? কল করুন: <a href={`tel:${settings.contact_number}`} className="text-[#D4A017] font-black hover:underline">{settings.contact_number}</a>
              </p>
            </div>

            {/* Right Form side */}
            <div className="lg:col-span-7">
              <OrderForm
                products={products}
                settings={settings}
                selectedProductId={selectedProductId}
                onOrderSuccess={onOrderSuccess}
              />
            </div>

          </div>
        </div>
      </section>

      {/* MOBILE EXPERIENCE STICKY FOOTER ACTION BUTTONS */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 px-3 py-3 block md:hidden flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        
        {/* Call Now button */}
        <a
          href={`tel:${settings.contact_number}`}
          id="sticky-mobile-call-btn"
          className="flex-1 bg-[#FAF9F6] text-[#0F5132] border-2 border-[#0F5132] text-center py-2.5 rounded-none text-xs font-bold font-sans flex items-center justify-center gap-1 active:scale-95 transition"
        >
          <PhoneCall className="h-3.5 w-3.5 text-[#D4A017]" />
          <span>কল করুন</span>
        </a>

        {/* Main Sticky Form Order trigger button */}
        <button
          onClick={() => scrollTo('order-section')}
          id="sticky-mobile-order-btn"
          className="flex-2 bg-[#D4A017] hover:bg-[#0F5132] hover:text-white text-[#0F5132] text-center py-2.5 rounded-none text-xs font-black font-sans uppercase flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>সরাসরি অর্ডার করুন</span>
        </button>

        {/* PM WhatsApp order button */}
        <a
          href={`https://wa.me/${settings.whatsapp_number}?text=আসসালামু আলাইকুম, আমি খাঁটি খেজুরের গুড় কিনতে চাই।`}
          target="_blank"
          rel="noreferrer"
          id="sticky-mobile-whatsapp-btn"
          className="flex-1 bg-emerald-600 text-white text-center py-2.5 rounded-none text-xs font-bold font-sans flex items-center justify-center gap-1.5 active:scale-95 transition"
        >
          <MessageSquare className="h-3.5 w-3.5 text-white" />
          <span>হোয়াটসঅ্যাপ</span>
        </a>

      </div>

    </div>
  );
}
