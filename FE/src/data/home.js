// ============================================================
// HOME PAGE MOCK DATA
// Future: GET /api/home → returns { slides, promos, brands }
// ============================================================

export const HERO_SLIDES = [
  {
    id: 1,
    tag: "Just Launched",
    title: "iPhone 15\nPro Max",
    subtitle: "Titanium. So strong. So light. So Pro.",
    cta: "Shop Now",
    ctaLink: "/products/1",
    secondaryCta: "View All iPhones",
    secondaryLink: "/products?category=smartphone",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=85",
    accentColor: "#6c63ff",
    bgFrom: "#0d0d18",
    bgTo: "#13132a",
    badge: "A17 Pro Chip",
  },
  {
    id: 2,
    tag: "Best Seller",
    title: "Galaxy S24\nUltra",
    subtitle: "The AI-powered phone that changes everything.",
    cta: "Explore Now",
    ctaLink: "/products/2",
    secondaryCta: "Compare Models",
    secondaryLink: "/products?category=smartphone",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=85",
    accentColor: "#00d4aa",
    bgFrom: "#0a0f0d",
    bgTo: "#0d1a16",
    badge: "200MP Camera",
  },
  {
    id: 3,
    tag: "Studio-Grade Audio",
    title: "Sony\nWH-1000XM5",
    subtitle: "Industry-leading noise cancellation. 30-hour battery.",
    cta: "Buy Now",
    ctaLink: "/products/8",
    secondaryCta: "All Headphones",
    secondaryLink: "/products?category=audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
    accentColor: "#ff6584",
    bgFrom: "#130a0d",
    bgTo: "#1a0d12",
    badge: "30hr Battery",
  },
];

export const PROMO_BANNERS = [
  {
    id: 1,
    label: "Limited Time",
    title: "Free Shipping",
    subtitle: "On all orders over $500",
    icon: "🚀",
    accentColor: "#6c63ff",
    link: "/products",
  },
  {
    id: 2,
    label: "New Arrivals",
    title: "MacBook Pro M3",
    subtitle: "Up to 128GB Unified Memory",
    icon: "💻",
    accentColor: "#00d4aa",
    link: "/products/4",
  },
  {
    id: 3,
    label: "Top Deal",
    title: "AirPods Pro",
    subtitle: "Save $20 — Limited stock",
    icon: "🎧",
    accentColor: "#ff6584",
    link: "/products/5",
  },
];

export const BRANDS = [
  { id: 1, name: "Apple",   logo: "🍎", productCount: 3 },
  { id: 2, name: "Samsung", logo: "📱", productCount: 2 },
  { id: 3, name: "Google",  logo: "🔍", productCount: 1 },
  { id: 4, name: "Sony",    logo: "🎵", productCount: 1 },
  { id: 5, name: "Microsoft", logo: "🪟", productCount: 0 },
  { id: 6, name: "OnePlus", logo: "➕", productCount: 0 },
];

export const WHY_US = [
  {
    icon: "🚚",
    title: "Fast Delivery",
    desc: "Free shipping on orders over $500. Delivered in 2–3 business days.",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    desc: "Your payment data is always safe. We support COD, bank transfer & e-wallets.",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    desc: "Not satisfied? Return within 30 days, no questions asked.",
  },
  {
    icon: "🎧",
    title: "24/7 Support",
    desc: "Our team is always here to help via chat, email or phone.",
  },
];
