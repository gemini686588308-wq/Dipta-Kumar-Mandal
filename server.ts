import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// Resolve directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Create folders if they do not exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Function to read from JSON database
function readDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    // Initial Seed Data matching the pure date molasses brand from Bangladesh
    const initialDb = {
      settings: {
        business_name: "শুদ্ধ খেজুরের গুড় (Shuddho Khejurer Gur)",
        contact_number: "01781539494",
        whatsapp_number: "01781539494",
        facebook_link: "https://facebook.com/shuddhokhejurergur",
        messenger_link: "https://m.me/shuddhokhejurergur",
        delivery_charge_inside: 80,
        delivery_charge_outside: 150,
        hero_title: "ঐতিহ্য ও স্বাদের অপূর্ব মেলবন্ধন: শতভাগ খাঁটি খেজুরের গুড় সরাসরি গ্রাম থেকে",
        hero_subtitle: "কোনো প্রিজারভেটিভ, আর্টিফিশিয়াল কালার বা কেমিক্যাল ছাড়াই শতভাগ প্রাকৃতিক উপায়ে যশোরে প্রস্তুতকৃত প্রিমিয়াম কোয়ালিটির আসল গুড় ও তরল ঝোলা গুড়।",
        banner_image: "molasses_hero_banner", // We will match this on frontend
        footer_text: "© ২০২৬ শুদ্ধ খেজুরের গুড় — খাঁটি খেজুরের গুড় ও বাঙ্গালিয়ানার পরম বিশ্বস্ত নাম।",
        seo_keywords: "খেজুরের গুড়, খাঁটি গুড়, পাটালি গুড়, ঝোলা গুড়, যশোরের খেজুরের গুড়, Organic Date Molasses, Khejur Gur, Bangladeshi Gur",
        seo_description: "শতভাগ খাঁটি খেজুরের রস থেকে তৈরি সম্পূর্ণ কেমিক্যালমুক্ত ও প্রাকৃতিক খেজুরের গুড় সরাসরি যশোরের গ্রাম থেকে আপনার কাছে।"
      },
      products: [
        {
          id: "prod-1",
          product_name: "প্রিমিয়াম পিওর পাটালি গুড় (১ কেজি প্যাক)",
          slug: "1kg-premium-patali-gur",
          description: "যশোরের ঐতিহ্যবাহী গাছিদের দ্বারা প্রস্তুতকৃত খাঁটি খেজুরের পাটালি গুড়। শতভাগ খাঁটি খেজুরের রস অনেক সময় ধরে নিখুঁত আঁচে ফুটিয়ে এই পাটালি গুড় তৈরি করা হয়। এতে কোনো চিনি বা কেমিক্যাল নেই। অনন্য প্রাকৃতিক মিষ্টি স্বাদ এবং চমৎকার সোঁদা গন্ধযুক্ত এই গুড় আপনার পরিবারের স্বাস্থ্যের জন্য অত্যন্ত উপকারী। এটি শীতকালীন পিঠা ও পায়েসের মূল প্রাণ।",
          short_description: "যশোরের আদি গাছিদের হাতে তৈরি শতভাগ খাঁটি ও কেমিক্যালমুক্ত পাটালি গুড়। পিঠা-পায়েসের আসল স্বাদ।",
          price: 480,
          sale_price: 390,
          stock_quantity: 85,
          weight: "1kg",
          featured_image: "molasses_clay_pot", // Links to our generated image on frontend
          gallery_images: ["molasses_clay_pot"],
          category: "Patali Gur",
          status: "active",
          featured: true,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "prod-2",
          product_name: "স্পেশাল তরল ঝোলা গুড় (৮০০ গ্রাম কন্টেইনার)",
          slug: "800g-special-jhola-gur",
          description: "বিশেষ পিঠা ও পায়েসের জন্য বাটি ভর্তি সুস্বাদু ও ঘন তরল খেজুরের ঝোলা গুড়। শীতকালীন যেকোনো পিঠায় এই ঝোলা গুড়ের ছোঁয়া ছাড়া বাঙ্গালি রসনা অসম্পূর্ণ থাকে। অত্যন্ত ঘন, সুমিষ্ট ঘ্রাণের এবং নিখুঁত ছাঁকন প্রক্রিয়ায় তৈরি। চিতই পিঠা বা দুধ পিঠার সেরা সঙ্গী।",
          short_description: "বিশেষ প্রক্রিয়ায় প্রস্তুত তরল ও দানাদার ঝোলা গুড়। খাঁটি মিষ্টি সুবাস উথলে ওঠে প্রতিটি পাত্রে।",
          price: 520,
          sale_price: 450,
          stock_quantity: 50,
          weight: "800g",
          featured_image: "molasses_liquid_jar", // Links to our generated image on frontend
          gallery_images: ["molasses_liquid_jar"],
          category: "Jhola Gur",
          status: "active",
          featured: true,
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "prod-3",
          product_name: "গ্র্যান্ড ফ্যামিলি কম্বো (৫ কেজি গিফট প্যাক)",
          slug: "5kg-grand-family-combo",
          description: "পুরো শীতকালের পিঠা উৎসব উদযাপনের জন্য সেরা আয়োজন। এই গ্র্যান্ড ফ্যামিলি কম্বো প্যাকে থাকছে ৩ কেজি প্রিমিয়াম পাটালি গুড় এবং ২ কেজি সুস্বাদু ও ঘন ঝোলা গুড়। পরিবার ও আত্মীয়-স্বজনদের খাঁটি ও ঐতিহ্যবাহী উপঢৌকন দেওয়ার জন্য এই সাশ্রয়ী প্যাকেজটি দারুণ জনপ্রিয়। সম্পূর্ণ কাঠের বাক্সে লাক্সারি ও প্রিমিয়াম ডিজাইনে প্যাকিং করা হয় যেন কোনো প্রিজারভেটিভ ছাড়াই দীর্ঘদিন ভালো থাকে।",
          short_description: "৩ কেজি প্রিমিয়াম পাটালি এবং ২ কেজি সুস্বাদু ঝোলা গুড়ের কম্বো প্যাক। বৃহৎ পরিবারের উৎসবের আনন্দ।",
          price: 2200,
          sale_price: 1850,
          stock_quantity: 25,
          weight: "5kg",
          featured_image: "molasses_hero_banner", // Links to our generated image on frontend
          gallery_images: ["molasses_hero_banner"],
          category: "Combo Pack",
          status: "active",
          featured: true,
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      orders: [
        {
          id: "ord-1",
          order_id: "SG-1001",
          customer_name: "আরিফুর রহমান",
          phone: "01711223344",
          address: "বাসা নং ১২, রোড ৫, ধানমন্ডি, ঢাকা",
          product: "প্রিমিয়াম পিওর পাটালি গুড় (১ কেজি প্যাক)",
          product_id: "prod-1",
          quantity: 2,
          total_price: 860, // 2 * 390 + 80 delivery
          payment_method: "bkash",
          payment_status: "paid",
          status: "delivered",
          notes: "বিকাশে পেমেন্ট করেছি। দয়া করে সকালের দিকে ডেলিভারি দিন।",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-2",
          order_id: "SG-1002",
          customer_name: "জান্নাতুল ফেরদৌস",
          phone: "01815223344",
          address: "হোল্ডিং ৪২, ও আর নিজাম রোড, জিইসি, চট্টগ্রাম",
          product: "স্পেশাল তরল ঝোলা গুড় (৮০০ গ্রাম কন্টেইনার)",
          product_id: "prod-2",
          quantity: 1,
          total_price: 600, // 1 * 450 + 150 delivery
          payment_method: "nagad",
          payment_status: "paid",
          status: "processing",
          notes: "পেমেন্ট কমপ্লিট। জলদি ডেলিভারি দিবেন ভাইয়া, বাচ্চার খুব পিঠা খাওয়ার শখ হয়েছে।",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-3",
          order_id: "SG-1003",
          customer_name: "সাদমান সাদিক",
          phone: "01912556677",
          address: "৩১৩ ব্লু ক্যাসেল হাইটস, শাহজালাল উপশহর, সিলেট",
          product: "গ্র্যান্ড ফ্যামিলি কম্বো (৫ কেজি গিফট প্যাক)",
          product_id: "prod-3",
          quantity: 1,
          total_price: 2000, // 1 * 1850 + 150 delivery
          payment_method: "cod",
          payment_status: "pending",
          status: "pending",
          notes: "ক্যাশ অন ডেলিভারিতে দেখতে চাই। ডেলিভারির আগে কল দিবেন অবশ্যই।",
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-4",
          order_id: "SG-1004",
          customer_name: "ফারহানা ইয়াসমিন",
          phone: "01511443322",
          address: "২৮, কুমারপাড়া রোড, বোয়ালিয়া, রাজশাহী",
          product: "প্রিমিয়াম পিওর পাটালি গুড় (১ কেজি প্যাক)",
          product_id: "prod-1",
          quantity: 3,
          total_price: 1320, // 3 * 390 + 150 delivery
          payment_method: "rocket",
          payment_status: "paid",
          status: "confirmed",
          notes: "রকেট দিয়ে চার্জ সহ পেমেন্ট করে দিয়েছি। শুভেচ্ছা জানবেন।",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-5",
          order_id: "SG-1005",
          customer_name: "তানভীর আহমেদ",
          phone: "01311009988",
          address: "বাসা নং ১৬, ময়লাপোতা মোড়, খুলনা",
          product: "স্পেশাল তরল ঝোলা গুড় (৮০০ গ্রাম কন্টেইনার)",
          product_id: "prod-2",
          quantity: 2,
          total_price: 1050, // 2 * 450 + 150 delivery
          payment_method: "bkash",
          payment_status: "failed",
          status: "cancelled",
          notes: "পেমেন্ট ফেইলড দেখাচ্ছে, আবার ট্রাই করবো।",
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-6",
          order_id: "SG-1006",
          customer_name: "আফসানা মিমি",
          phone: "01611776655",
          address: "বাংলামোটর ক্রসিং, রুপায়ন টাওয়ার, ঢাকা",
          product: "প্রিমিয়াম পিওর পাটালি গুড় (১ কেজি প্যাক)",
          product_id: "prod-1",
          quantity: 1,
          total_price: 470, // 1 * 390 + 80 delivery
          payment_method: "cod",
          payment_status: "paid",
          status: "delivered",
          notes: "",
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-7",
          order_id: "SG-1007",
          customer_name: "এম. এ. কাইয়ুম",
          phone: "01712889900",
          address: "বনানী ডিওএইচএস, রোড নং ৪, ঢাকা",
          product: "গ্র্যান্ড ফ্যামিলি কম্বো (৫ কেজি গিফট প্যাক)",
          product_id: "prod-3",
          quantity: 2,
          total_price: 3780, // 2 * 1850 + 80 delivery
          payment_method: "bkash",
          payment_status: "paid",
          status: "delivered",
          notes: "বিজনেস ক্লায়েন্ট। প্যাকেজিং যেন পারফেক্ট ক্যাটাগরির হয়।",
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      reviews: [
        {
          id: "rev-1",
          customer_name: "মুহাম্মদ আশরাফুল",
          rating: 5,
          comment: "মিষ্টির গন্ধটা অসম্ভব সুন্দর! মুখে দিলেই মিলিয়ে যায়। অন্য কোম্পানিগুলোর মতো চিনি মেশানো নেই টের পাওয়া যায়। অনেক ধন্যবাদ অরিজিনাল জিনিস দেওয়ার জন্য।",
          location: "ঢাকা",
          date: "২০২৬-০৬-১০"
        },
        {
          id: "rev-2",
          customer_name: "ফারহানা মজিদ",
          rating: 5,
          comment: "তরল ঝোলা গুড় কিনেছিলাম পিঠা বানানোর জন্য। আসলেই চমৎকার ঘনত্ব এবং সুবাস। চিতই পিঠার সাথে অসম্ভব সুস্বাদু লেগেছে। ডেলিভারিও খুব ফাস্ট ছিল!",
          location: "চট্টগ্রাম",
          date: "২০২৬-০৬-১২"
        },
        {
          id: "rev-3",
          customer_name: "কামরুল হাসান",
          rating: 4,
          comment: "যশোরের গুড় অনেকদিন পর আসল স্বাদ পেলাম। যশোরের মানুষের পক্ষে এটা আসলেই জেনুইন গুড় বলা যায়। প্রাইস একটু বেশি তবে খাঁটি জিনিসের মূল্য এমনই হবে।",
          location: "সিলেট",
          date: "২০২৬-০৬-১৪"
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// Function to write to JSON database
function writeDatabase(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();

  // Handle larger payloads (e.g., base64 media uploads and product catalogs)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Router FIRST
  
  // 1. Settings Endpoints
  app.get('/api/settings', (req, res) => {
    try {
      const db = readDatabase();
      res.json(db.settings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const db = readDatabase();
      db.settings = { ...db.settings, ...req.body };
      writeDatabase(db);
      res.json({ success: true, settings: db.settings });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. Products Endpoints
  app.get('/api/products', (req, res) => {
    try {
      const db = readDatabase();
      res.json(db.products);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    try {
      const db = readDatabase();
      const product = db.products.find((p: any) => p.id === req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const db = readDatabase();
      const newProduct = {
        ...req.body,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.products.push(newProduct);
      writeDatabase(db);
      res.status(201).json({ success: true, product: newProduct });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const db = readDatabase();
      const index = db.products.findIndex((p: any) => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });

      db.products[index] = {
        ...db.products[index],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      writeDatabase(db);
      res.json({ success: true, product: db.products[index] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const db = readDatabase();
      const filtered = db.products.filter((p: any) => p.id !== req.params.id);
      db.products = filtered;
      writeDatabase(db);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 3. Orders Endpoints
  app.get('/api/orders', (req, res) => {
    try {
      const db = readDatabase();
      res.json(db.orders);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/orders', (req, res) => {
    try {
      const db = readDatabase();
      const lastOrderNum = db.orders.length > 0
        ? parseInt(db.orders[db.orders.length - 1].order_id.replace('SG-', ''))
        : 1000;
      
      const nextId = lastOrderNum + 1;
      const order_id = `SG-${nextId}`;

      const newOrder = {
        ...req.body,
        id: `ord-${Date.now()}`,
        order_id,
        created_at: new Date().toISOString()
      };

      // Auto-update stock-quantity if matched
      if (newOrder.product_id) {
        const product = db.products.find((p: any) => p.id === newOrder.product_id);
        if (product) {
          product.stock_quantity = Math.max(0, product.stock_quantity - parseInt(newOrder.quantity));
        }
      }

      db.orders.push(newOrder);
      writeDatabase(db);
      res.status(201).json({ success: true, order: newOrder });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/orders/:id', (req, res) => {
    try {
      const db = readDatabase();
      const index = db.orders.findIndex((o: any) => o.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Order not found' });

      db.orders[index] = {
        ...db.orders[index],
        ...req.body
      };
      writeDatabase(db);
      res.json({ success: true, order: db.orders[index] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/orders/:id', (req, res) => {
    try {
      const db = readDatabase();
      const filtered = db.orders.filter((o: any) => o.id !== req.params.id);
      db.orders = filtered;
      writeDatabase(db);
      res.json({ success: true, message: 'Order deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Reviews Endpoints
  app.get('/api/reviews', (req, res) => {
    try {
      const db = readDatabase();
      res.json(db.reviews);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const db = readDatabase();
      const newReview = {
        id: `rev-${Date.now()}`,
        customer_name: req.body.customer_name,
        rating: parseInt(req.body.rating),
        comment: req.body.comment,
        location: req.body.location || "বাংলাদেশ",
        date: new Date().toISOString().split('T')[0]
      };
      db.reviews.push(newReview);
      writeDatabase(db);
      res.status(201).json({ success: true, review: newReview });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Media/Images upload simulation
  app.post('/api/media/upload', (req, res) => {
    try {
      const { fileName, base64Data } = req.body;
      if (!fileName || !base64Data) {
        return res.status(400).json({ error: "fileName and base64Data are required" });
      }

      // Convert base64 back to binary
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      const hashFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const filePath = path.join(UPLOADS_DIR, hashFileName);
      
      fs.writeFileSync(filePath, buffer);
      
      // Return accessible relative url path
      res.json({
        success: true,
        url: `/uploads/${hashFileName}`
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Serve static files in public folder (like uploads)
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Initialize and check database seeding on start
  readDatabase();

  // Vite Integration for Hot Middleware or SPA routing fallback in Prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for React Router compatibility
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
