import { useState, useEffect } from "react";
import { getHomeData }      from "../services/homeService";
import HeroSlider           from "../components/home/HeroSlider/index";
import PromoBanners         from "../components/home/PromoBanners";
import CategoryShowcase     from "../components/home/CategoryShowcase";
import ProductSection       from "../components/home/ProductSection";
import BrandStrip           from "../components/home/BrandStrip";
import DealsBanner          from "../components/home/DealsBanner";
import WhyUs                from "../components/home/WhyUs";

export default function HomePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeData().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const productTabs = data ? [
    { key: "featured",    label: "Featured",     products: data.featured    },
    { key: "newArrivals", label: "New Arrivals",  products: data.newArrivals },
    { key: "topRated",    label: "Top Rated",     products: data.topRated   },
  ] : [];

  const dealsTabs = data
    ? [{ key: "deals", label: "On Sale", products: data.deals }]
    : [];

  return (
    <main id="main-content" className="animate-[fadeIn_0.45s_ease-out]">

      {/* ── Hero — full-bleed, no horizontal padding ── */}
      {data
        ? <HeroSlider slides={data.slides} />
        : <div className="skeleton h-[580px] rounded-none" aria-hidden="true" />
      }

      {/* ── Page sections ── */}
      <div className="stack-page pb-32" style={{ paddingTop: "var(--space-section)" }}>
        {data
          ? <PromoBanners banners={data.promos} />
          : <div style={{ height: "var(--space-section)" }} aria-hidden />
        }
        <CategoryShowcase />
        {data && <BrandStrip brands={data.brands} />}
       
        <DealsBanner />
         <ProductSection
          eyebrow="Hand-picked for you"
          title="Our Products"
          tabs={productTabs}
          loading={loading}
          viewAllLink="/products"
        />
        {data && <WhyUs items={data.whyUs} />}
      </div>

    </main>
  );
}