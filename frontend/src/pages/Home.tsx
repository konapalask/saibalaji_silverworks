import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ArrowRight, ShieldCheck, Award, Sparkles, Briefcase, ChevronDown, Check, Star, Lock, Truck, RefreshCw, Layers, Search, Film, Video } from 'lucide-react';
import { Product, CompanyVideo } from '../types';
import { ProductCard } from '../components/ProductCard';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { QuickViewModal } from '../components/QuickViewModal';
import { CustomCursor } from '../components/CustomCursor';
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
      era: "1990s / FOUNDATION",
      year: "EST. 1998",
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
    description: "Discover 25+ years of South Indian silver craftsmanship, from raw 99.9% silver bullion to hallmarked masterpieces.",
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
      <section className="relative w-full min-h-[90vh] lg:min-h-[92vh] flex items-center bg-[#F8F6F1] overflow-hidden py-12 lg:py-0 border-b border-[#E5E0D8]">

        {/* Subtle Indian Heritage Pattern Background */}
        <div className="absolute inset-0 bg-heritage-pattern pointer-events-none" />

        {/* Soft Decorative Ambient Highlights */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#B9A77A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#C8C8C4]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1450px] mx-auto w-full px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column — Clean Luxury Typography & CTAs */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

            {/* Brand Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E0D8] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B9A77A] animate-pulse" />
              <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.25em] text-[#666666]">
                EST. 1998 • TENALI, INDIA
              </span>
            </div>

            {/* Brand Title Lockup */}
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.4em] text-[#B9A77A] font-bold font-sans block">
                SAI BALAJI SILVER
              </span>
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light text-[#202020] leading-[1.02] tracking-tight">
                CRAFTED IN <br />
                <span className="text-[#00276B] font-normal not-italic" style={{ color: '#00276B' }}>PURE SILVER.</span>
              </h1>
            </div>

            {/* Short Supporting Copy */}
            <p className="text-sm sm:text-base text-[#555555] font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Three decades of South Indian craftsmanship, metallurgical precision and 100% NABL-certified silver — shaped in Tenali.
            </p>

            {/* Certification Trust Line */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] uppercase tracking-[0.2em] text-[#666666] font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#B9A77A]" /> 999 Fine Silver
              </span>
              <span className="text-[#D0C9BE]">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#B9A77A]" /> 925 Sterling
              </span>
              <span className="text-[#D0C9BE]">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#B9A77A]" /> NABL Hallmarked
              </span>
            </div>

            {/* Action Buttons (Primary + Secondary CTAs) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                to="/shop/retail"
                className="w-full sm:w-auto px-8 py-4 bg-[#202020] hover:bg-[#B9A77A] text-white text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 rounded-xl shadow-md flex items-center justify-center gap-2 group"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 text-[#B9A77A] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/category/silver-pooja-articles"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#F1EFEB] text-[#202020] border border-[#E5E0D8] text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-300 rounded-xl shadow-2xs flex items-center justify-center"
              >
                <span>SHOP SILVER</span>
              </Link>
            </div>

          </div>

          {/* Right Column — Prominent Hero Silver Product Showcase */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[480px] aspect-4/5 rounded-3xl bg-gradient-to-b from-white to-[#F1EFEB] border border-[#E5E0D8] p-6 product-shadow flex items-center justify-center">

              {/* Decorative Subtle Frame Overlay */}
              <div className="absolute inset-3 border border-[#B9A77A]/25 rounded-2xl pointer-events-none" />

              {/* Featured Silver Deity Hero Photography with Soft Studio Drop Shadow */}
              <img
                src="/homescreen.webp"
                alt="Sai Balaji Pure Silver Lord Balaji Idol"
                className="w-full h-full object-contain drop-shadow-2xl img-editorial"
              />

              {/* Floating Quality Seal Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#E5E0D8] shadow-md flex items-center gap-2.5 text-xs text-[#202020] font-medium whitespace-nowrap">
                <Sparkles className="w-4 h-4 text-[#B9A77A]" />
                <span className="font-serif italic font-semibold text-sm">999 Fine Silver Deity Idol</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 02. BRAND STORY SECTION (WARM IVORY EDITORIAL) */}
      <section className="bg-white py-24 sm:py-32 px-6 lg:px-12 border-b border-[#E5E0D8]">
        <div className="max-w-5xl mx-auto text-center space-y-7">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            THE HOUSE OF SAI BALAJI
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#202020] leading-tight">
            Mastering the art of silver <br className="hidden sm:inline" />
            through generations of purity.
          </h2>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#555555] font-light leading-relaxed">
            From Tenali to patrons across India, Sai Balaji Silverworks brings together generations of craftsmanship, purity and precision. Operating from our specialized manufacturing atelier, we bridge classical deity sculpting with NABL-certificated 999 fine & 925 sterling silver formulations.
          </p>

          <div className="pt-6 flex justify-center">
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#B9A77A] to-transparent" />
          </div>
        </div>
      </section>

      {/* 03. SILVER PURITY SECTION (ELEGANT LIGHT SPECIFICATION CARDS) */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            GUARANTEED METALLURGICAL EXCELLENCE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
            Silver Purity & Certification
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] transition-all product-shadow space-y-4 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#202020] block">999</span>
            <h3 className="font-sans text-xs uppercase tracking-[0.25em] font-bold text-[#B9A77A]">FINE SILVER</h3>
            <p className="text-xs text-[#666666] font-light leading-relaxed max-w-xs mx-auto">
              Pure 99.9% fine silver for temple idols, sacred pooja articles, thalis, and investment bullion.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] transition-all product-shadow space-y-4 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#202020] block">925</span>
            <h3 className="font-sans text-xs uppercase tracking-[0.25em] font-bold text-[#B9A77A]">STERLING SILVER</h3>
            <p className="text-xs text-[#666666] font-light leading-relaxed max-w-xs mx-auto">
              Precision 92.5% sterling silver for durable dining tableware, baby gifts, and fine ornaments.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] transition-all product-shadow space-y-4 text-center">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#202020] block">25+</span>
            <h3 className="font-sans text-xs uppercase tracking-[0.25em] font-bold text-[#B9A77A]">YEARS OF LEGACY</h3>
            <p className="text-xs text-[#666666] font-light leading-relaxed max-w-xs mx-auto">
              Established South Indian silver manufacturing atelier based in Tenali, Andhra Pradesh.
            </p>
          </div>

        </div>
      </section>

      {/* 04. PRODUCT COLLECTIONS GRID (E-COMMERCE HERO GRID) */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E0D8] pb-8">
          <div className="space-y-2">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#B9A77A] block">
              EXPLORE BY CATEGORY
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
              Silver Collections
            </h2>
          </div>
          <Link
            to="/shop/retail"
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#202020] hover:text-[#B9A77A] flex items-center gap-2 transition-colors"
          >
            <span>VIEW CATEGORIES</span>
            <ArrowRight className="w-4 h-4 text-[#B9A77A]" />
          </Link>
        </div>

        {/* Collections Grid — 4 Main Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden product-card-hover flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-black overflow-hidden p-3 border-b border-[#F0ECE6]">
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 bg-black"
                />
              </div>

              <div className="p-6 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B9A77A]">
                  {cat.subcategories.length} Subcategories
                </span>
                <h3 className="font-serif text-2xl text-[#202020] group-hover:text-[#B9A77A] transition-colors font-normal">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#666666] font-light line-clamp-2 leading-relaxed">
                  {cat.shortDescription}
                </p>
                <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-[#202020] group-hover:text-[#B9A77A]">
                  <span>EXPLORE COLLECTION →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* 07. B2B / WHOLESALE SECTION (LIGHT CHAMPAGNE PORTAL CARD) */}
      <section className="py-24 bg-[#F3EFE6] border-y border-[#E5E0D8] px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            INDIVIDUAL • CUSTOM • WHOLESALE
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#202020]">
            From individual bespoke pieces to <br className="hidden sm:inline" />
            large-scale B2B wholesale requirements.
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-[#555555] font-light leading-relaxed">
            Supplying leading South Indian jewellery showrooms, temples, and corporate institutions with customized silver minting, 999 bullion bars, and bulk retail stock with ReportLab PDF quotation support.
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

      {/* 08. VIDEO ATELIER SECTION (COMPLETE 171-VIDEO GALLERY & REELS) */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-10" id="home-video-gallery">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E0D8] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#B9A77A]/10 text-[#B9A77A] rounded-lg">
                <Film className="w-4 h-4" />
              </span>
              <span className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#B9A77A]">
                LIVE FACTORY & STUDIO REELS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
              Craftsmanship Video Atelier
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              Browse all 171 unscripted, silent video clips from our Tenali silver manufacturing plant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-full border border-[#E5E0D8] text-xs font-medium text-gray-700 shadow-xs flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-[#B9A77A]" />
              <span><strong>{homeFilteredVideos.length}</strong> Videos Available</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {videoCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setVideoCategory(cat);
                  setVideoDisplayCount(8);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  videoCategory === cat
                    ? 'bg-[#202020] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-gray-600 hover:bg-[#E5E0D8] hover:text-[#202020]'
                }`}
              >
                {cat === 'ALL' ? `All Videos (${videos.length})` : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or video code..."
              value={videoSearch}
              onChange={(e) => {
                setVideoSearch(e.target.value);
                setVideoDisplayCount(8);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl focus:outline-none focus:border-[#B9A77A] transition-colors"
            />
          </div>
        </div>

        {/* Video Grid */}
        {homeFilteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeFilteredVideos.slice(0, videoDisplayCount).map((vid) => (
              <div
                key={vid.id}
                onClick={() => openVideo(vid)}
                className="group relative bg-black rounded-2xl overflow-hidden aspect-9/14 border border-[#E5E0D8] shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between p-4"
              >
                <video
                  src={vid.video_url}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#B9A77A] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                    {vid.category || 'Craftsmanship'}
                  </span>
                  {vid.filename && (
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-mono rounded">
                      #{vid.filename.replace('.MP4', '')}
                    </span>
                  )}
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-[#1A1918] group-hover:bg-[#B9A77A] group-hover:text-white flex items-center justify-center transition-all shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <h4 className="font-serif text-sm font-bold text-white line-clamp-1">
                    {vid.title}
                  </h4>
                  <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>
              </div>
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

      {/* 09. WHY SAI BALAJI & E-COMMERCE TRUST SIGNALS */}
      <section className="py-24 bg-white border-t border-[#E5E0D8] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
              UNCOMPROMISING STANDARDS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#202020]">
              Why Sai Balaji Silverworks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Award className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-xl text-[#202020]">100% Authentic Silver</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">NABL spectrometry assayed 999 fine silver and 925 sterling formulations.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <ShieldCheck className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-xl text-[#202020]">Master Craftsmanship</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Ancestral South Indian temple idol sculpting & Nakshi relief carving.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Sparkles className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-xl text-[#202020]">Anti-Tarnish Coating</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Nano protective barrier preserves mirror-bright specular shine for years.</p>
            </div>

            <div className="p-6 bg-[#F8F6F1] rounded-2xl border border-[#E5E0D8] space-y-3 text-center">
              <Truck className="w-8 h-8 text-[#B9A77A] mx-auto" />
              <h3 className="font-serif text-xl text-[#202020]">Insured Safe Shipping</h3>
              <p className="text-xs text-[#666666] font-light leading-relaxed">Tamper-evident luxury packaging and insured dispatch across India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. GRAND CTA SECTION */}
      <section className="py-32 bg-[#F8F6F1] border-t border-[#E5E0D8] text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.35em] text-[#B9A77A] block">
            CRAFTED TO LAST • CREATED IN SILVER
          </span>
          <h2 className="font-serif text-5xl sm:text-7xl font-light text-[#202020] tracking-tight">
            Discover Pure Silver <br />
            <span className="text-silver-shimmer italic font-normal">Crafted for Generations.</span>
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#666666] font-light leading-relaxed">
            Browse our hallmarked deity idols, dining tableware, pooja thalis, and custom minting options.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/shop/retail"
              className="px-9 py-4 bg-[#202020] hover:bg-[#B9A77A] text-white text-[11px] font-bold uppercase tracking-[0.22em] transition-all flex items-center gap-2 rounded-xl shadow-md"
            >
              <span>EXPLORE COLLECTIONS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="px-9 py-4 bg-white hover:bg-[#F1EFEB] text-[#202020] border border-[#E5E0D8] text-[11px] font-bold uppercase tracking-[0.22em] transition-all rounded-xl shadow-2xs"
            >
              <span>CONTACT US →</span>
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
