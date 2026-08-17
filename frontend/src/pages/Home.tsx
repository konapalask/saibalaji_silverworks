import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ArrowRight, ShieldCheck, Award, Sparkles, Briefcase, ChevronDown, Check } from 'lucide-react';
import { Product, CompanyVideo } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { QuickViewModal } from '../components/QuickViewModal';
import { CustomCursor } from '../components/CustomCursor';
import api from '../services/api';
import { MAIN_CATEGORIES } from '../data/categoriesData';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<CompanyVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch Featured Products & Videos from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, vidRes] = await Promise.all([
          api.get('/products?is_featured=true'),
          api.get('/videos')
        ]);
        setFeaturedProducts(prodRes.data || []);
        setVideos(vidRes.data || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };
    fetchData();
  }, []);

  const openVideo = (video: CompanyVideo) => {
    setActiveVideo(video);
    setIsVideoModalOpen(true);
  };

  // Heritage Timeline Data (100% Authentic Sai Balaji Silver Product Images)
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
      image: "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Dinner-Sets/images.jpg"
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
    thumbnail_url: "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp",
    section: "hero",
    sort_order: 1,
    is_active: true,
    created_at: ""
  };

  return (
    <div className="bg-[#080808] text-[#EEEEEA] font-sans selection:bg-[#C8C8C4] selection:text-[#080808]">
      <CustomCursor />

      {/* 01. HERO SECTION — AUTHENTIC PURE SILVER HOUSE (AUTHENTIC SAI BALAJI LORD BALAJI SILVER IDOL) */}
      <section className="relative w-full h-[92vh] sm:h-screen max-w-full overflow-hidden flex items-center bg-[#080808]">

        {/* Full-Bleed Background Container with Right-Side Pure Silver Studio Photography & Left Gradient Fade */}
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="w-full lg:w-[65%] h-full relative">
            <img
              src="/hero_balaji_4k.png"
              alt="Authentic Sai Balaji 4K Pure Silver Deity Idol"
              className="w-full h-full object-cover object-center opacity-95 scale-100 img-editorial"
            />
            {/* Seamless Left-to-Right Obsidian Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Left Content Container — Single Alignment Axis (580px Width) */}
        <div className="relative z-10 w-full max-w-[1450px] mx-auto px-6 sm:px-12 lg:px-20">
          <div className="max-w-[580px] space-y-7">

            {/* Eyebrow */}
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.35em] text-[#898985] block">
              EST. 1998 • TENALI, INDIA
            </span>

            {/* Brand Title */}
            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-5xl font-light text-[#EEEEEA] tracking-wider block">
                SAI BALAJI
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8C8C4] font-semibold font-sans block">
                SILVERWORKS
              </span>
            </div>

            {/* Single Emotional Headline */}
            <h1 className="font-serif text-5xl sm:text-7xl font-light text-[#EEEEEA] leading-[1.05] tracking-tight">
              CRAFTED <br />
              IN PURE <br />
              <span className="text-silver-metallic font-normal italic">SILVER.</span>
            </h1>

            {/* Refined Short Copy */}
            <p className="text-sm sm:text-base text-[#898985] font-light leading-relaxed">
              Three decades of craftsmanship, precision and pure silver — shaped in Tenali, India.
            </p>

            {/* Quiet Editorial Certifications Line (No Pills, No Cards) */}
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-[#C8C8C4] font-medium pt-1">
              <span>NABL CERTIFIED</span>
              <span className="text-[#333333]">•</span>
              <span>25+ YEARS LEGACY</span>
              <span className="text-[#333333]">•</span>
              <span>TENALI ATELIER</span>
            </div>

            {/* Single Elegant Luxury CTA */}
            <div className="pt-2">
              <Link
                to="/shop/retail"
                className="inline-flex items-center gap-3 py-2.5 group text-[11px] uppercase font-bold tracking-[0.25em] text-[#EEEEEA] relative"
              >
                <span>EXPLORE COLLECTIONS</span>
                <ArrowRight className="w-4 h-4 text-[#C8C8C4] group-hover:translate-x-2 transition-transform duration-300" />
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C8C8C4] group-hover:w-full transition-all duration-300" />
              </Link>
            </div>

          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="absolute bottom-6 left-6 sm:left-12 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#898985] z-20">
          <span>SCROLL</span>
          <div className="w-8 h-[1px] bg-[#222222]" />
          <ChevronDown className="w-3.5 h-3.5 text-[#C8C8C4] animate-bounce" />
        </div>

      </section>

      {/* 02. EDITORIAL INTRODUCTION SECTION (THE HOUSE OF SILVER) */}
      <section id="about-intro" className="bg-[#F5F5F2] text-[#080808] py-28 sm:py-36 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#777777] block">
            THE HOUSE OF SILVER
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light leading-tight text-[#080808]">
            Mastering the art of silver <br className="hidden sm:inline" />
            through generations of purity.
          </h2>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-[#444444] font-light leading-relaxed">
            From Tenali to patrons across India, Sai Balaji Silverworks brings together generations of craftsmanship, purity and precision. Operating from our specialized manufacturing atelier, we bridge classical deity sculpting with NABL-certificated 999 fine & 925 sterling silver formulations.
          </p>
        </div>
      </section>

      {/* 03. HERITAGE TIMELINE (A LEGACY SHAPED IN SILVER) */}
      <section className="py-36 px-6 lg:px-12 max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            HERITAGE & EVOLUTION
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white">
            A Legacy Shaped in Silver
          </h2>
        </div>

        <div className="space-y-24">
          {timelineEvents.map((item, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
            >
              <div className={`lg:col-span-6 space-y-4 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8C8C4]">
                  {item.era} • {item.year}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal">{item.title}</h3>
                <p className="text-sm text-[#898985] font-light leading-relaxed max-w-lg">
                  {item.description}
                </p>
              </div>

              <div className={`lg:col-span-6 relative aspect-16/10 overflow-hidden border border-[#222222] ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover img-editorial"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04. CRAFTSMANSHIP SECTION (THE HAND BEHIND THE SILVER) */}
      <section id="craftsmanship" className="py-32 bg-[#111111] border-y border-[#222222] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-6 relative aspect-4/5 overflow-hidden border border-[#222222]">
            <img
              src="/silver_artisan_4k.png"
              alt="Artisan Silver Craftsmanship"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#C8C8C4]">THE ATELIER HAND</span>
              <p className="font-serif text-xl text-[#EEEEEA]">Precision Hand-Engraving & Nakshi Relief Work in Progress</p>
            </div>
          </div>

          <div id="manufacturing" className="lg:col-span-6 space-y-8">
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
              THE HAND BEHIND THE SILVER
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-white leading-tight">
              Where heritage hands meet modern induction casting.
            </h2>
            <p className="text-sm text-[#898985] font-light leading-relaxed">
              Every creation bearing the Sai Balaji Silverworks hallmark undergoes multi-stage metallurgical casting. High-frequency vacuum furnaces eliminate air pockets to yield solid, dense silver items finished with anti-tarnish protective barriers.
            </p>

            {/* Architectural Specifications Grid */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#222222]">
              <div>
                <span className="text-2xl font-serif text-[#C8C8C4]">99.9%</span>
                <h4 className="font-sans text-[10px] uppercase tracking-widest font-bold text-white mt-1">Spectrometry Verified</h4>
                <p className="text-xs text-[#898985] font-light">NABL assay lab purity testing.</p>
              </div>

              <div>
                <span className="text-2xl font-serif text-[#C8C8C4]">01/01</span>
                <h4 className="font-sans text-[10px] uppercase tracking-widest font-bold text-white mt-1">Tenali Direct Atelier</h4>
                <p className="text-xs text-[#898985] font-light">Zero middleman markup.</p>
              </div>
            </div>

            <Link to="/about" className="px-7 py-3.5 border border-[#333333] hover:border-[#C8C8C4] text-[#C8C8C4] text-[10px] font-semibold uppercase tracking-[0.25em] transition-all inline-flex">
              <span>EXPLORE MANUFACTURING PROCESS</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 05. SILVER PURITY SECTION (LARGE EDITORIAL SPECIFICATION NUMBERS) */}
      <section className="py-28 px-6 lg:px-12 max-w-7xl mx-auto border-b border-[#222222]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

          <div className="space-y-4 p-8 border border-[#222222] bg-[#111111]">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#EEEEEA] block">999</span>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold text-[#C8C8C4]">FINE SILVER</h3>
            <p className="text-xs text-[#898985] font-light leading-relaxed max-w-xs mx-auto">
              Pure 99.9% fine silver for temple idols, sacred pooja articles, and investment bullion.
            </p>
          </div>

          <div className="space-y-4 p-8 border border-[#222222] bg-[#111111]">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#EEEEEA] block">925</span>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold text-[#C8C8C4]">STERLING SILVER</h3>
            <p className="text-xs text-[#898985] font-light leading-relaxed max-w-xs mx-auto">
              Precision 92.5% sterling silver for durable dining tableware, baby gifts, and fine ornaments.
            </p>
          </div>

          <div className="space-y-4 p-8 border border-[#222222] bg-[#111111]">
            <span className="font-serif text-6xl sm:text-7xl font-light text-[#EEEEEA] block">25+</span>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold text-[#C8C8C4]">YEARS OF LEGACY</h3>
            <p className="text-xs text-[#898985] font-light leading-relaxed max-w-xs mx-auto">
              Established South Indian silver manufacturing atelier based in Tenali, Andhra Pradesh.
            </p>
          </div>

        </div>
      </section>

      {/* 06. MANUFACTURING WORKFLOW SECTION (FROM CRAFT TO CREATION) */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            THE ATELIER PROCESS
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white">
            From Craft to Creation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {manufacturingSteps.map((step, idx) => (
            <div key={idx} className="p-8 border border-[#222222] bg-[#111111] space-y-3 relative group hover:border-[#C8C8C4]/60 transition-all">
              <span className="text-2xl font-serif text-[#C8C8C4] font-light block">{step.num}</span>
              <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-white">{step.name}</h3>
              <p className="text-xs text-[#898985] font-light leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 07. WHOLESALE B2B SECTION (BUILT FOR WHOLESALE) */}
      <section className="py-32 bg-[#111111] border-y border-[#222222] px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            BUILT FOR WHOLESALE
          </span>
          <h2 className="font-serif text-4xl sm:text-7xl font-light text-white">
            From individual bespoke pieces to <br />
            large-scale B2B wholesale requirements.
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-[#898985] font-light leading-relaxed">
            Supplying leading jewellery showrooms, temples, and corporate institutions with customized silver minting, 999 bullion bars, and bulk retail stock with instant PDF quotation support.
          </p>
          <div>
            <Link to="/shop/wholesale" className="px-8 py-4 bg-[#EEEEEA] hover:bg-[#C8C8C4] text-[#080808] text-[11px] font-bold uppercase tracking-[0.25em] transition-all inline-flex items-center gap-2 shadow-xl">
              <span>EXPLORE WHOLESALE →</span>
              <Briefcase className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 08. CURATED EDITORIAL COLLECTIONS GALLERY */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            CURATED SELECTIONS
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white">
            The Collections
          </h2>
        </div>

        {/* 2-Tier Balanced 4K Luxury Editorial Layout (Zero Blank Space) */}
        <div className="space-y-8">

          {/* Top Tier: 2 Featured 4K Collections (50% / 50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MAIN_CATEGORIES.slice(0, 2).map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative overflow-hidden bg-[#111111] border border-[#222222] block aspect-16/10 rounded-sm"
                data-cursor="VIEW COLLECTION"
              >
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover img-editorial opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent p-8 sm:p-10 flex flex-col justify-end">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-[#C8C8C4] font-bold block mb-1">
                    0{idx + 1} / FEATURED COLLECTION
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-white group-hover:text-[#C8C8C4] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#898985] font-light line-clamp-2 mt-2 opacity-90 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="w-0 group-hover:w-full h-[1px] bg-[#C8C8C4] transition-all duration-500 mt-5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Tier: 3 Portrait 4K Collections (33.3% / 33.3% / 33.3%) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MAIN_CATEGORIES.slice(2, 5).map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative overflow-hidden bg-[#111111] border border-[#222222] block aspect-4/5 rounded-sm"
                data-cursor="VIEW COLLECTION"
              >
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover img-editorial opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent p-8 flex flex-col justify-end">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-[#C8C8C4] font-bold block mb-1">
                    0{idx + 3} / COLLECTION
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white group-hover:text-[#C8C8C4] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#898985] font-light line-clamp-2 mt-2 opacity-90 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="w-0 group-hover:w-full h-[1px] bg-[#C8C8C4] transition-all duration-500 mt-4" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 09. VIDEO STORY SECTION (THE STORY BEHIND THE SILVER) */}
      <section className="relative h-[75vh] w-full overflow-hidden flex items-center justify-center my-20">
        <img
          src={storyVid.thumbnail_url}
          alt="Story Video"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]" />

        <div className="relative z-10 text-center space-y-6 max-w-3xl px-6">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            THE STORY BEHIND THE SILVER
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl text-white font-light">
            Watch Our Atelier Documentary
          </h2>
          <button
            onClick={() => openVideo(storyVid)}
            className="w-20 h-20 rounded-full border border-[#C8C8C4] bg-[#080808]/80 text-[#C8C8C4] hover:bg-[#C8C8C4] hover:text-[#080808] flex items-center justify-center mx-auto transition-all duration-400 backdrop-blur-md group"
            data-cursor="PLAY FILM"
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </button>
        </div>
      </section>

      {/* 10. WHY SAI BALAJI (TRUST & EXPERTISE STRIP) */}
      <section className="py-28 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            UNCOMPROMISING STANDARDS
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-white">
            Why Sai Balaji Silverworks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="p-8 border border-[#222222] bg-[#111111] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8C8C4] block">01 / PURITY</span>
            <h3 className="font-serif text-2xl text-white">Spectrometer Assayed</h3>
            <p className="text-xs text-[#898985] font-light leading-relaxed">Guaranteed 99.9% fine silver and 92.5% sterling formulations stamped with laser hallmarks.</p>
          </div>

          <div className="p-8 border border-[#222222] bg-[#111111] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8C8C4] block">02 / FINISH</span>
            <h3 className="font-serif text-2xl text-white">Anti-Tarnish Nano Layer</h3>
            <p className="text-xs text-[#898985] font-light leading-relaxed">Micro-coatings preserve brilliant luster for years without premature oxidation.</p>
          </div>

          <div className="p-8 border border-[#222222] bg-[#111111] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8C8C4] block">03 / VALUE</span>
            <h3 className="font-serif text-2xl text-white">Direct Atelier Pricing</h3>
            <p className="text-xs text-[#898985] font-light leading-relaxed">No intermediary markups. Transparent per-gram silver rates directly from our manufacturing unit.</p>
          </div>

        </div>
      </section>

      {/* 11. GRAND LUXURY CTA SECTION */}
      <section className="py-40 bg-[#111111] border-t border-[#222222] text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.4em] text-[#C8C8C4] block">
            CRAFTED TO LAST • CREATED IN SILVER
          </span>
          <h2 className="font-serif text-5xl sm:text-8xl font-light text-white tracking-tight">
            LET'S CREATE <br />
            <span className="text-silver-metallic italic font-normal">SOMETHING TIMELESS.</span>
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#898985] font-light leading-relaxed">
            Discover collections created with precision, heritage and uncompromising attention to detail.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link to="/shop/retail" className="px-9 py-4 bg-[#EEEEEA] hover:bg-[#C8C8C4] text-[#080808] text-[11px] font-bold uppercase tracking-[0.25em] transition-all flex items-center gap-2">
              <span>EXPLORE COLLECTIONS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link to="/contact" className="px-9 py-4 border border-[#333333] hover:border-[#C8C8C4] text-[#C8C8C4] text-[11px] font-semibold uppercase tracking-[0.25em] transition-all">
              <span>CONTACT SAI BALAJI →</span>
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
