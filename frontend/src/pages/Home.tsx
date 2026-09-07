import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ArrowRight, ShieldCheck, Award, Sparkles, Briefcase, ChevronDown, Check, Star, Lock, Truck, RefreshCw, Layers, Search, Film, Video } from 'lucide-react';
import { Product, CompanyVideo } from '../types';
import { ProductCard } from '../components/ProductCard';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { LazyVideoCard } from '../components/LazyVideoCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { CustomCursor } from '../components/CustomCursor';
import { CountUp } from '../components/CountUp';
import { initialVideosData } from '../data/videosData';
import api from '../services/api';
import { MAIN_CATEGORIES } from '../data/categoriesData';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<CompanyVideo[]>(initialVideosData);
  const [activeVideo, setActiveVideo] = useState<CompanyVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Home Video Gallery Filter State
  const [videoCategory, setVideoCategory] = useState<string>('ALL');
  const [videoSearch, setVideoSearch] = useState<string>('');
  const [videoDisplayCount, setVideoDisplayCount] = useState<number>(8);

  const videoCategories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => {
      if (v.category) set.add(v.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [videos]);

  const homeFilteredVideos = useMemo(() => {
    return videos.filter(vid => {
      const matchCat = videoCategory === 'ALL' || vid.category === videoCategory;
      const q = videoSearch.toLowerCase().trim();
      const matchQ = !q ||
        vid.title.toLowerCase().includes(q) ||
        (vid.description && vid.description.toLowerCase().includes(q)) ||
        (vid.filename && vid.filename.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [videos, videoCategory, videoSearch]);

  // Fetch Featured Products & Videos from API
  useEffect(() => {
    const fetchData = async () => {
      setLoadingProducts(true);
      try {
        const [prodRes, vidRes] = await Promise.all([
          api.get('/products?is_featured=true'),
          api.get('/content/videos').catch(() => ({ data: [] }))
        ]);
        setFeaturedProducts(Array.isArray(prodRes.data) && prodRes.data.length > 0 ? prodRes.data : []);
        if (Array.isArray(vidRes.data) && vidRes.data.length > 0) {
          setVideos(vidRes.data);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchData();
  }, []);

  const openVideo = (video: CompanyVideo) => {
    setActiveVideo(video);
    setIsVideoModalOpen(true);
  };

  // Heritage Timeline Data
  const timelineEvents = [
    {
      era: "2010s / FOUNDATION",
      year: "EST. 2019",
      title: "The Atelier Foundation",
      description: "Founded as a specialized silver casting studio in Tenali, dedicated to hand-carved temple idols and pure metallurgic formulations.",
      image: "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Pooja-Plates/DSC_7725.webp"
    },
    {
      era: "2000s / MODERNIZATION",
      year: "2008",
      title: "Purity & Scale",
      description: "Expanded into high-precision induction furnace casting, establishing 999 Fine Silver and 925 Sterling NABL purity standards.",
      image: "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Deepams/silver-lamp-silver-article-by-unniyarcha-jewellery-844414_1800x1800.webp"
    },
    {
      era: "2010s / B2B EXPANSION",
      year: "2016",
      title: "Tradition Meets Technology",
      description: "Integrated 3D CAD modeling and automated magnetic pin polishing, becoming the premier B2B wholesale silver supplier across South India.",
      image: "/public/Saibalaji products S/Royal Floral Crest Silver Serving Tray.webp"
    },
    {
      era: "TODAY / SAI BALAJI",
      year: "PRESENT",
      title: "Crafting the Future",
      description: "Operating an advanced direct-to-retail and B2B silver atelier producing hallmarked idols, tableware, bullion, and fine sterling collections.",
      image: "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-God-Idols/AMS-115-0054.webp"
    }
  ];

  // 6-Step Manufacturing Process Data
  const manufacturingSteps = [
    { num: "01", name: "INDUCTION CASTING", desc: "High-vacuum induction melting of 99.9% fine silver bullion to eliminate porosity." },
    { num: "02", name: "PRECISION FORMING", desc: "Hydraulic coin minting & sheet forming for dense structural durability." },
    { num: "03", name: "NAKSHI ENGRAVING", desc: "Hand-sculpted temple iconographies and intricate floral relief carving." },
    { num: "04", name: "MAGNETIC POLISHING", desc: "Multi-stage pin polishing yielding high-specular reflective mirror lustres." },
    { num: "05", name: "NABL ASSAY CHECK", desc: "X-ray fluorescence spectrometry purity verification and hallmarking." },
    { num: "06", name: "NANO FINISH", desc: "Microscopic protective anti-tarnish coating to preserve brilliant shine." }
  ];

  // Story Video Mock
  const storyVid = videos.find(v => v.section === 'hero') || {
    id: 1,
    title: "The Heritage of Sai Balaji Silverworks",
    description: "Discover 7+ years of South Indian silver craftsmanship, from raw 99.9% silver bullion to hallmarked masterpieces.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-silversmith-crafting-metal-work-41584-large.mp4",
    thumbnail_url: "/hero_balaji_4k.webp",
    section: "hero",
    sort_order: 1,
    is_active: true,
    created_at: ""
  };

  return (
    <div className="bg-[#F8F6F1] text-[#202020] font-sans selection:bg-[#B9A77A] selection:text-white">
      <CustomCursor />

      {/* 01. HERO SECTION — LIGHT LUXURY WARM IVORY SHOWROOM */}
      <section className="relative w-full bg-[#F8F6F1] border-b border-[#E5E0D8] flex items-center py-10 sm:py-14 lg:py-16 min-h-[calc(100vh-84px)]">

        {/* Subtle Indian Heritage Pattern Background */}
        <div className="absolute inset-0 bg-heritage-pattern pointer-events-none" />

        {/* Soft Decorative Ambient Highlights */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#B9A77A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#C8C8C4]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1450px] mx-auto w-full px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center h-full">

          {/* Left Column — Clean Luxury Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 lg:space-y-6 text-center lg:text-left py-4">

            {/* Brand Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E0D8] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B9A77A] animate-pulse" />
              <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#666666]">
                EST. 2019 · TENALI, ANDHRA PRADESH
              </span>
            </div>

            {/* Brand Title Lockup */}
            <div className="space-y-1.5">
              <span className="text-xs sm:text-sm uppercase tracking-[0.4em] text-[#B9A77A] font-bold font-sans block">
                SAI BALAJI SILVER WORKS PVT. LTD.
              </span>
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5rem] xl:text-8xl font-light text-[#202020] leading-[1.02] tracking-tight">
                Crafting SILVER. <br />
                <span className="text-[#00276B] font-normal not-italic" style={{ color: '#00276B' }}>Creating TRUST.</span>
              </h1>
            </div>

            {/* Short Supporting Copy */}
            <p className="text-sm sm:text-base text-[#555555] font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Sai Balaji Silver Works Pvt. Ltd. is a professionally managed silver manufacturing company specializing in premium silver articles for wholesale and business customers across India.
            </p>

            {/* Certification Trust Line */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-5 text-xs uppercase tracking-[0.2em] text-[#666666] font-semibold pt-1">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#B9A77A]" /> 999 Fine Silver
              </span>
              <span className="text-[#D0C9BE]">•</span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#B9A77A]" /> 925 Sterling
              </span>
            </div>

            {/* Action Buttons (Primary + Secondary CTAs) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop/retail"
                className="w-full sm:w-auto px-8 py-4 bg-[#202020] hover:bg-[#B9A77A] text-white text-xs font-bold uppercase tracking-[0.22em] transition-all duration-300 rounded-xl shadow-md flex items-center justify-center gap-2 group"
              >
                <span>EXPLORE PRODUCTS</span>
                <ArrowRight className="w-4 h-4 text-[#B9A77A] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/shop/wholesale"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#F1EFEB] text-[#202020] border border-[#E5E0D8] text-xs font-bold uppercase tracking-[0.22em] transition-all duration-300 rounded-xl shadow-2xs flex items-center justify-center"
              >
                <span>WHOLESALE ENQUIRY</span>
              </Link>
            </div>

          </div>

          {/* Right Column — Prominent Hero Temple Arch Showcase Frame */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-2 lg:py-0">
            
            {/* Soft Ambient Depth Glow behind the Temple Arch */}
            <div className="absolute inset-3 sm:inset-4 bg-[#B9A77A]/12 rounded-t-[160px] rounded-b-[36px] blur-2xl pointer-events-none" />

            {/* Outer Architectural Temple Arch Showcase Frame */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] max-h-[420px] lg:max-h-[440px] aspect-[4/4.9] rounded-t-[130px] sm:rounded-t-[155px] rounded-b-[24px] sm:rounded-b-[30px] bg-gradient-to-b from-white via-[#FAF8F5] to-[#F2EFEA] p-2 sm:p-2.5 border border-[#E5E0D8] shadow-[0_18px_45px_-15px_rgba(32,32,32,0.12),0_8px_20px_-8px_rgba(185,167,122,0.15)] transition-transform duration-500 hover:scale-[1.01]">
              
              {/* Inner Double-Layer Champagne Gold Accent Line */}
              <div className="relative w-full h-full rounded-t-[120px] sm:rounded-t-[145px] rounded-b-[20px] sm:rounded-b-[24px] border border-[#B9A77A]/35 p-1 sm:p-1.5 flex flex-col justify-between">

                {/* Inner Black Arched Photography Canvas (Encloses Black Background & Idol) */}
                <div className="relative w-full h-full rounded-t-[112px] sm:rounded-t-[138px] rounded-b-[16px] sm:rounded-b-[20px] bg-black overflow-hidden flex items-center justify-center p-1 sm:p-2 border border-black/80 shadow-inner">
                  
                  {/* Subtle Inner Warm Glow on Deity */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#B9A77A]/10 via-transparent to-[#B9A77A]/5 pointer-events-none" />

                  {/* Featured Silver Deity Hero Photography (Zoomed in for crisp prominent idol detail) */}
                  <img
                    src="/homescreen.webp"
                    alt="Sai Balaji Pure Silver Lord Balaji Idol"
                    className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(255,255,255,0.08)] scale-[1.28] sm:scale-[1.32] hover:scale-[1.36] transition-transform duration-700"
                  />
                </div>

                {/* Floating Quality Seal Badge */}
                <div className="absolute -bottom-3 sm:-bottom-3.5 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-[#E5E0D8] shadow-md flex items-center gap-2 text-xs text-[#202020] font-medium whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-[#B9A77A]" />
                  <span className="font-serif italic font-semibold text-xs sm:text-sm">999 Fine Silver Deity Idol</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 02. INTRODUCTION SECTION */}
      <section className="bg-white py-24 sm:py-32 px-6 lg:px-12 border-b border-[#E5E0D8]">
        <div className="max-w-5xl mx-auto text-center space-y-7">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            THE HOUSE OF SAI BALAJI
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#202020] leading-tight">
            Manufacturing Excellence in Silver.
          </h2>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#555555] font-light leading-relaxed">
            Established in 2019, Sai Balaji Silver Works combines traditional craftsmanship with modern manufacturing technology to produce high-quality silver articles with precision, consistency, and dependable service.
          </p>
          <p className="max-w-3xl mx-auto text-sm text-[#666666] font-light leading-relaxed">
            Based in Autonagar, Tenali, Andhra Pradesh, we manufacture 200+ varieties of silver products for wholesalers, retailers, jewellery businesses, gift businesses, wedding businesses, and institutional customers across India.
          </p>

          <div className="pt-6 flex justify-center">
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#B9A77A] to-transparent" />
          </div>
        </div>
      </section>

      {/* 03. STATISTICS SECTION */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] transition-all product-shadow space-y-4 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#202020] block">
              <CountUp end={2019} duration={1.8} useGrouping={false} />
            </span>
            <h3 className="font-sans text-xs uppercase tracking-[0.25em] font-bold text-[#B9A77A]">ESTABLISHED</h3>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] transition-all product-shadow space-y-4 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#202020] block">
              <CountUp end={200} suffix="+" duration={1.8} />
            </span>
            <h3 className="font-sans text-xs uppercase tracking-[0.25em] font-bold text-[#B9A77A]">PRODUCT VARIETIES</h3>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] transition-all product-shadow space-y-4 text-center flex flex-col justify-center">
            <span className="font-serif text-4xl sm:text-5xl font-light text-[#202020] block uppercase py-2">
              PAN INDIA
            </span>
            <h3 className="font-sans text-xs uppercase tracking-[0.25em] font-bold text-[#B9A77A]">B2B SERVICE</h3>
          </div>

        </div>
      </section>

      {/* 04. PRODUCT CATEGORY SECTION */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E0D8] pb-8">
          <div className="space-y-2">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#B9A77A] block">
              EXPLORE OUR CATEGORIES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
              Silver Products for Every Occasion.
            </h2>
            <p className="text-sm text-[#555555] font-light max-w-2xl">
              From traditional silverware to customized products, our extensive portfolio is designed to meet diverse business and customer requirements.
            </p>
          </div>
          <Link
            to="/shop/retail"
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#202020] hover:text-[#B9A77A] flex items-center gap-2 transition-colors shrink-0"
          >
            <span>VIEW ALL CATEGORIES</span>
            <ArrowRight className="w-4 h-4 text-[#B9A77A]" />
          </Link>
        </div>

        {/* Collections Grid — 4 Main Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {MAIN_CATEGORIES.map((cat, index) => {
            const categoryTitles = [
              "Silver Pooja Articles",
              "Silver Dinner Sets & Tableware",
              "Silver God & Religious Articles",
              "Silver Wedding & Traditional Articles"
            ];
            const categoryTitle = categoryTitles[index] || cat.name;

            return (
              <Link
                key={cat.id}
                to={`/shop/retail?category=${cat.slug}`}
                className="group bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden product-card-hover flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 w-full bg-black overflow-hidden p-3 border-b border-[#F0ECE6] flex items-center justify-center">
                  <img
                    src={cat.cardImage}
                    alt={categoryTitle}
                    className={`w-full h-full object-contain rounded-lg transition-transform duration-500 bg-black ${
                      index === 3 || cat.slug === 'silver-wedding-return-gifts'
                        ? "scale-[1.38] sm:scale-[1.42] group-hover:scale-[1.48] sm:group-hover:scale-[1.52]"
                        : "group-hover:scale-105"
                    }`}
                  />
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B9A77A]">
                    {cat.subcategories.length} Subcategories
                  </span>
                  <h3 className="font-serif text-2xl text-[#202020] group-hover:text-[#B9A77A] transition-colors font-normal">
                    {categoryTitle}
                  </h3>
                  <p className="text-xs text-[#666666] font-light line-clamp-2 leading-relaxed">
                    {cat.shortDescription}
                  </p>
                  <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-[#202020] group-hover:text-[#B9A77A]">
                    <span>EXPLORE COLLECTION →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>



      {/* 05. WHOLESALE SECTION */}
      <section className="py-24 bg-[#F3EFE6] border-y border-[#E5E0D8] px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            INDIVIDUAL · CUSTOM · WHOLESALE
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#202020]">
            From Individual Bespoke Pieces to <br className="hidden sm:inline" />
            Large-Scale B2B Wholesale Requirements.
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-[#555555] font-light leading-relaxed">
            Whether you require customized silver products, bulk quantities, or a dependable manufacturing partner, Sai Balaji Silver Works provides flexible solutions tailored to your business requirements.
          </p>
          <div className="pt-2">
            <Link
              to="/shop/wholesale"
              className="px-9 py-4 bg-[#202020] hover:bg-[#B9A77A] text-white text-[11px] font-bold uppercase tracking-[0.22em] transition-all inline-flex items-center gap-2 rounded-xl shadow-md"
            >
              <span>ENQUIRE FOR WHOLESALE</span>
              <Briefcase className="w-4 h-4 text-[#B9A77A]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 06. EXISTING CRAFTSMANSHIP / VIDEO SECTION */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-10" id="home-video-gallery">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E0D8] pb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#B9A77A]/10 text-[#B9A77A] rounded-lg">
                <Film className="w-4 h-4" />
              </span>
              <span className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#B9A77A]">
                OUR MANUFACTURING CAPABILITIES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
              From Design to Finished Product.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-3xl font-light">
              We combine traditional silver craftsmanship with modern manufacturing technology to achieve precision, consistency, productivity, and superior finishing across our product range.
            </p>
            <div className="pt-2 text-[11px] font-bold tracking-[0.15em] text-[#B9A77A] uppercase flex flex-wrap gap-2 items-center">
              <span>DESIGN</span> <span>→</span>
              <span>DEVELOPMENT</span> <span>→</span>
              <span>MANUFACTURING</span> <span>→</span>
              <span>FINISHING</span> <span>→</span>
              <span>QUALITY INSPECTION</span> <span>→</span>
              <span>FINAL DISPATCH</span>
            </div>
          </div>

        </div>

        {/* Video Grid */}
        {homeFilteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {homeFilteredVideos.slice(0, videoDisplayCount).map((vid) => (
              <LazyVideoCard
                key={vid.id}
                video={vid}
                onOpen={openVideo}
                aspectRatio="aspect-9/14"
                layout="reel"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E0D8] space-y-3">
            <Film className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#202020]">No videos found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search query or switching category filters.
            </p>
            <button
              onClick={() => {
                setVideoSearch('');
                setVideoCategory('ALL');
              }}
              className="px-4 py-2 bg-[#202020] text-white text-xs font-bold rounded-xl hover:bg-[#B9A77A] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {homeFilteredVideos.length > videoDisplayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setVideoDisplayCount(prev => prev + 12)}
              className="px-8 py-3.5 bg-[#202020] hover:bg-[#B9A77A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Load More Craftsmanship Videos ({homeFilteredVideos.length - videoDisplayCount} remaining)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 07. WHY SAI BALAJI SILVER WORKS */}
      <section className="py-24 bg-white border-t border-[#E5E0D8] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
              WHY SAI BALAJI SILVER WORKS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
              A Manufacturing Partner You Can Trust.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Award className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#202020] uppercase tracking-wide">200+ PRODUCT VARIETIES</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">A diverse product portfolio designed for different business requirements.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Layers className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#202020] uppercase tracking-wide">MODERN MANUFACTURING</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Advanced machinery and technology combined with experienced craftsmanship.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <ShieldCheck className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#202020] uppercase tracking-wide">PRECISION & CONSISTENCY</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">A systematic manufacturing approach focused on accurate and consistent output.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Sparkles className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#202020] uppercase tracking-wide">CUSTOMIZATION</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Products can be developed according to specific design and business requirements.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Briefcase className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#202020] uppercase tracking-wide">WHOLESALE FOCUS</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Dedicated to wholesalers, retailers, jewellery businesses, and bulk buyers.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Truck className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#202020] uppercase tracking-wide">RELIABLE SERVICE</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Transparent communication, professional service, and dependable business relationships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 08. FINAL CTA SECTION */}
      <section className="py-32 bg-[#F8F6F1] border-t border-[#E5E0D8] text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            YOUR VISION · OUR CRAFTSMANSHIP
          </span>
          <h2 className="font-serif text-5xl sm:text-7xl font-light text-[#202020] tracking-tight">
            Your Vision. Our Craftsmanship. <br />
            <span className="text-silver-shimmer italic font-normal">One Trusted Partnership.</span>
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#666666] font-light leading-relaxed">
            Looking for a reliable silver manufacturing partner? Explore our extensive range of silver products or connect with our team for wholesale enquiries, bulk orders, customized requirements, and business partnerships.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/shop/retail"
              className="px-9 py-4 bg-[#202020] hover:bg-[#B9A77A] text-white text-[11px] font-bold uppercase tracking-[0.22em] transition-all flex items-center gap-2 rounded-xl shadow-md"
            >
              <span>EXPLORE PRODUCTS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="px-9 py-4 bg-white hover:bg-[#F1EFEB] text-[#202020] border border-[#E5E0D8] text-[11px] font-bold uppercase tracking-[0.22em] transition-all rounded-xl shadow-2xs"
            >
              <span>CONTACT US</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={activeVideo.video_url}
          title={activeVideo.title}
          description={activeVideo.description}
        />
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};
