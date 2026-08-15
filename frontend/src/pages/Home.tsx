import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, ArrowRight, ShieldCheck, Sparkles, Award, Factory, MapPin, ChevronRight, CheckCircle2, ShoppingBag, Briefcase, Eye } from 'lucide-react';
import { Product, CompanyVideo, ManufacturingStep } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductCard } from '../components/ProductCard';
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
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Manufacturing Steps Data
  const manufacturingSteps: ManufacturingStep[] = [
    {
      step: "01",
      title: "Silver Selection",
      description: "Assaying and selecting 99.9% pure silver grains for high-grade melting.",
      details: "Raw silver bullion undergoes NABL-standard spectrometer testing to verify exact elemental purity prior to casting.",
      image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1000&q=80"
    },
    {
      step: "02",
      title: "Design & 3D Prototyping",
      description: "Combining ancestral motifs with CAD 3D precision molding.",
      details: "Our master designers translate sacred iconographies into high-precision 3D wax molds for flawless symmetry.",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80"
    },
    {
      step: "03",
      title: "Induction Casting",
      description: "Vacuum induction melting for bubble-free solid silver structure.",
      details: "High-frequency induction furnaces melt silver under inert gas shields to ensure zero oxidation during casting.",
      image: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1000&q=80"
    },
    {
      step: "04",
      title: "Hand Nakshi & Detailing",
      description: "Hand-engraving by third-generation silversmith artisans.",
      details: "Artisans meticulously hand-carve intricate floral patterns, facial features of deities, and Nakshi relief details.",
      image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=80"
    },
    {
      step: "05",
      title: "Ultrasonic Cleaning & Finishing",
      description: "Multi-stage polishing for brilliant, high-mirror luster.",
      details: "Cast pieces pass through magnetic pin polishers, walnut shell tumbling, and ultrasonic bath cleaning.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80"
    },
    {
      step: "06",
      title: "Anti-Tarnish Coating & Inspection",
      description: "Nanotechnology protective barrier application.",
      details: "Every item receives a micro-layer anti-tarnish shield preserving its silver shine for years without darkening.",
      image: "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=1000&q=80"
    },
    {
      step: "07",
      title: "Laser Hallmarking & Packaging",
      description: "Official purity hallmarking and luxury velvet casing.",
      details: "Final inspection verifies exact hallmark stamps before items are sealed in tamper-evident velvet gift boxes.",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  // Timeline Data
  const timelineEvents = [
    {
      era: "THE BEGINNING",
      year: "EST. 1998",
      title: "Ancestral Craftsmanship",
      description: "Where the vision of Sai Balaji Silverworks began in Hyderabad, starting as a small studio dedicated to hand-sculpted temple idols.",
      image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80"
    },
    {
      era: "CRAFTSMANSHIP",
      year: "2008",
      title: "Mastery of Precision",
      description: "Years of experience perfecting 925 sterling silver & 999 fine silver formulations, setting new standards for temple and home decor silver.",
      image: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80"
    },
    {
      era: "MANUFACTURING",
      year: "2015",
      title: "Modern Manufacturing Unit",
      description: "Building our state-of-the-art manufacturing unit with induction casting furnaces, laser engraving, and NABL-certified testing.",
      image: "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80"
    },
    {
      era: "EXPANSION",
      year: "2020",
      title: "Pan-India B2B Wholesale",
      description: "Growing into a primary wholesale manufacturer supplying leading jewellers, corporate houses, and prominent temple trusts across India.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
    },
    {
      era: "TODAY",
      year: "PRESENT",
      title: "Full-Stack Retail & B2B Platform",
      description: "Combining direct factory-to-consumer luxury retail shopping with automated digital B2B quotation workflows.",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, vidRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/content/videos')
        ]);
        setFeaturedProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
        setVideos(Array.isArray(vidRes.data) ? vidRes.data : []);
      } catch (err) {
        console.error('Error fetching home data', err);
      }
    };
    fetchData();
  }, []);

  const openVideo = (vid: CompanyVideo) => {
    setActiveVideo(vid);
    setIsVideoModalOpen(true);
  };

  const videoList = Array.isArray(videos) ? videos : [];

  const storyVideo = videoList.find(v => v.section === 'story') || {
    id: 1,
    title: "The Story Behind the Silver",
    description: "Discover the heritage and engineering precision behind Sai Balaji Silverworks.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-artisan-crafting-a-piece-of-jewelry-41586-large.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=80",
    section: "story",
    sort_order: 1,
    is_active: true,
    created_at: ""
  };

  const manufacturingVideo = videoList.find(v => v.section === 'manufacturing') || {
    id: 2,
    title: "Inside Our Manufacturing Unit",
    description: "Step inside our high-precision casting and silver processing unit in Hyderabad.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-goldsmith-working-in-his-workshop-41584-large.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1200&q=80",
    section: "manufacturing",
    sort_order: 2,
    is_active: true,
    created_at: ""
  };

  const craftsmenVideo = videoList.find(v => v.section === 'craftsmen') || {
    id: 3,
    title: "Hands Behind the Craft",
    description: "Celebrating the master silversmiths who hand-carve sacred details into every creation.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-jeweler-cleaning-a-ring-with-a-brush-41588-large.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=1200&q=80",
    section: "craftsmen",
    sort_order: 3,
    is_active: true,
    created_at: ""
  };

  return (
    <div className="space-y-24 pb-16 bg-[#FAF9F5] text-[#1A1918]">
      
      {/* 01. FIRST OPEN — CINEMATIC COMPANY HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#1A1918]">
        {/* Background Video / Image overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            src="https://assets.mixkit.co/videos/preview/mixkit-goldsmith-working-in-his-workshop-41584-large.mp4"
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1918] via-[#1A1918]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 py-20">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.4em] text-[#C5A059] font-bold block">
              ENTER THE WORLD OF
            </span>
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light text-white tracking-wide leading-tight">
              SAI BALAJI SILVERWORKS
            </h1>
            <p className="font-serif text-xl sm:text-3xl text-[#C5A059] italic font-normal tracking-wider">
              Crafting Silver. Building Trust. Creating Legacy.
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-xs sm:text-base text-gray-300 font-sans font-light leading-relaxed">
            From traditional craftsmanship to modern silver manufacturing, discover the journey behind Sai Balaji Silverworks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="#journey" 
              className="w-full sm:w-auto px-8 py-4 bg-[#C5A059] hover:bg-[#b08b46] text-[#1A1918] rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>EXPLORE OUR JOURNEY</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a 
              href="#commerce-entry" 
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-[#1A1918] border border-white/30 rounded-full text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              <span>ENTER SHOP</span>
            </a>
          </div>
        </div>
      </section>

      {/* 02. COMPANY INTRODUCTION & PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold">
            WHO WE ARE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1A1918]">
            Master Silver Manufacturers & Artisans
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
            Sai Balaji Silverworks is a silver manufacturing company dedicated to creating high-quality silver products through a combination of craftsmanship, precision, and modern manufacturing.
          </p>
        </div>

        {/* Mission, Vision, Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 space-y-3 shadow-sm hover:border-[#C5A059] transition-all">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] block">PURPOSE</span>
            <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Our Mission</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              To create silver products that combine authenticity, craftsmanship, and lasting value for families, retailers, and corporate institutions across India.
            </p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 space-y-3 shadow-sm hover:border-[#C5A059] transition-all">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] block">ASPIRATION</span>
            <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Our Vision</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              To become the most trusted silver manufacturing partner across India, recognized for unquestioned purity, transparent pricing, and design mastery.
            </p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 space-y-3 shadow-sm hover:border-[#C5A059] transition-all">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] block">GUIDING PRINCIPLES</span>
            <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Our Core Values</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 font-semibold pt-1">
              <span>• Craftsmanship</span>
              <span>• 100% Purity</span>
              <span>• Trust & Integrity</span>
              <span>• Precision</span>
              <span>• Innovation</span>
              <span>• Quality First</span>
            </div>
          </div>
        </div>
      </section>

      {/* 03. OUR JOURNEY TIMELINE */}
      <section id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold">
            CINEMATIC TIMELINE
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#1A1918]">
            Our Journey
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            From Craftsmanship to a Modern Silverworks
          </p>
        </div>

        {/* Timeline Horizontal / Stacked Cards */}
        <div className="space-y-16">
          {timelineEvents.map((ev, index) => (
            <div 
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-6 space-y-4 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="bg-[#1A1918] text-[#C5A059] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {ev.era}
                  </span>
                  <span className="text-xs font-bold text-gray-400 font-mono">{ev.year}</span>
                </div>

                <h3 className="font-serif text-3xl font-bold text-[#1A1918]">{ev.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">{ev.description}</p>
              </div>

              <div className={`lg:col-span-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="arch-top overflow-hidden border border-[#C5A059]/40 bg-white p-3 shadow-xl hover:scale-[1.01] transition-transform">
                  <img 
                    src={ev.image} 
                    alt={ev.title} 
                    className="w-full aspect-16/10 object-cover rounded-t-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04. VIDEO SECTION 01 — THE STORY BEHIND THE SILVER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#1A1918] text-white p-8 sm:p-16 border border-[#C5A059]/40 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                CINEMATIC FEATURED VIDEO 01
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
                The Story Behind the Silver
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Step inside our history. Watch how our master silver casting artisans blend ancient metallurgic tradition with modern laser technology.
              </p>

              <button 
                onClick={() => openVideo(storyVideo)}
                className="bg-white hover:bg-[#C5A059] text-[#1A1918] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg"
              >
                <Play className="w-4 h-4 fill-current text-[#1A1918]" />
                <span>WATCH DOCUMENTARY VIDEO</span>
              </button>
            </div>

            <div className="lg:col-span-6">
              <div 
                onClick={() => openVideo(storyVideo)}
                className="relative rounded-2xl overflow-hidden border border-white/20 group cursor-pointer aspect-16/10 shadow-2xl"
              >
                <img 
                  src={storyVideo.thumbnail_url} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 05. INTERACTIVE MANUFACTURING PROCESS ("HOW WE CREATE") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold">
            CRAFTSMANSHIP & PRECISION
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1918]">
            How We Create
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            A 7-stage manufacturing process combining ancient metallurgic arts with modern quality controls.
          </p>
        </div>

        {/* Step Selector Buttons */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none justify-start sm:justify-center">
          {manufacturingSteps.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeStepIndex === idx ? 'bg-[#1A1918] text-[#C5A059] shadow-md' : 'bg-white text-gray-600 hover:bg-[#FAF9F5] border border-[#E6E1DA]'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">{s.step}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Card */}
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-12 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-3xl font-serif font-bold text-[#C5A059]">
              STAGE {manufacturingSteps[activeStepIndex].step}
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#1A1918]">
              {manufacturingSteps[activeStepIndex].title}
            </h3>
            <p className="text-sm font-semibold text-gray-800">
              {manufacturingSteps[activeStepIndex].description}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {manufacturingSteps[activeStepIndex].details}
            </p>
          </div>

          <div className="lg:col-span-6">
            <img 
              src={manufacturingSteps[activeStepIndex].image} 
              alt="" 
              className="w-full aspect-16/10 object-cover rounded-2xl border border-[#E6E1DA] shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* 06. VIDEO SECTION 02 — INSIDE OUR MANUFACTURING UNIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            VIDEO 02 — FACTORY TOUR
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light">Inside Sai Balaji Silverworks</h2>
          <p className="text-xs text-gray-600">Step inside our manufacturing process and discover how every piece is developed.</p>
        </div>

        <div 
          onClick={() => openVideo(manufacturingVideo)}
          className="relative rounded-3xl overflow-hidden bg-[#1A1918] aspect-21/9 border border-[#C5A059]/40 shadow-2xl group cursor-pointer"
        >
          <img 
            src={manufacturingVideo.thumbnail_url} 
            alt="" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-8 sm:p-12 text-white">
            <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit">
              FULL-WIDTH MANUFACTURING TOUR
            </span>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h3 className="font-serif text-2xl sm:text-4xl font-bold">Precision Casting & Silver Processing</h3>
                <p className="text-xs text-gray-300 max-w-xl mt-1">Watch silver melting, sheet rolling, laser engraving, and quality testing in action.</p>
              </div>

              <div className="w-16 h-16 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07. VIDEO SECTION 03 — OUR CRAFTSMEN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-12 shadow-sm">
          <div 
            onClick={() => openVideo(craftsmenVideo)}
            className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-4/3 group cursor-pointer border border-[#E6E1DA]"
          >
            <img 
              src={craftsmenVideo.thumbnail_url} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center shadow-xl">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
              VIDEO 03 — MASTER SILVERSMITHS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">Hands Behind the Craft</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Every detail in our silver idols and heritage articles is brought to life by master silversmiths with generations of experience in South Indian temple craft.
            </p>
            <button 
              onClick={() => openVideo(craftsmenVideo)}
              className="px-6 py-3 bg-[#1A1918] hover:bg-[#C5A059] text-white rounded-xl text-xs uppercase font-bold tracking-widest flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Artisans at Work</span>
            </button>
          </div>
        </div>
      </section>

      {/* 08. QUALITY & PURITY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            GUARANTEED STANDARDS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1918]">
            Quality Without Compromise
          </h2>
          <p className="text-xs text-gray-600">Full chemical purity validation and protective coating on every piece.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059] mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold">925 Sterling Silver</h3>
            <p className="text-xs text-gray-500">Guaranteed 92.5% pure silver alloyed for enduring structural strength.</p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059] mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold">999 Fine Silver</h3>
            <p className="text-xs text-gray-500">99.9% pure silver formulated for idols, coins, and sacred puja vessels.</p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059] mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold">Spectrometer Testing</h3>
            <p className="text-xs text-gray-500">Chemical melt verification to guarantee purity precision.</p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059] mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold">Anti-Tarnish Shield</h3>
            <p className="text-xs text-gray-500">Nanotechnology molecular barrier prevents oxidation and darkening.</p>
          </div>
        </div>
      </section>

      {/* 09. FACTORY / SHOWROOM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1918] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A059]/40 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              HYDERABAD FACTORY & SHOWROOM
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light">Visit Sai Balaji Silverworks</h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Experience our entire retail collection and consult with our wholesale team directly at our Hyderabad manufacturing showroom.
            </p>

            <div className="space-y-2 text-xs text-gray-300 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <span>Main Silver Market, Near Charminar Heritage Zone, Hyderabad, Telangana - 500002</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-[#C5A059]">Hours:</span> Monday – Saturday: 10:00 AM – 8:30 PM IST
              </p>
            </div>

            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-white text-[#1A1918] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
            >
              <span>GET DIRECTIONS & CONTACT INFO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-5">
            <img 
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80" 
              alt="Showroom" 
              className="w-full aspect-4/3 object-cover rounded-2xl border border-white/20 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* 10. MAJOR TRANSITION SECTION — COMPANY → COMMERCE ENTRY */}
      <section id="commerce-entry" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.4em] text-[#C5A059] font-bold block">
            THE COMMERCE EXPERIENCE
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#1A1918]">
            Ready to Explore Our Collection?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-sans">
            Discover our silver products for personal, retail, and wholesale requirements.
          </p>
        </div>

        {/* Dual Choice Cards: RETAIL vs WHOLESALE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* RETAIL CARD */}
          <div className="bg-white border-2 border-[#E6E1DA] hover:border-[#C5A059] rounded-3xl p-8 sm:p-12 space-y-6 shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
                <ShoppingBag className="w-7 h-7" />
              </div>

              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                FOR INDIVIDUAL PURCHASES
              </span>

              <h3 className="font-serif text-3xl font-bold text-[#1A1918]">RETAIL COLLECTION</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Explore our curated retail collection of fine 925 sterling silver jewelry, 999 pure silver idols, pooja thalis, and luxury silver gifts.
              </p>
            </div>

            <Link 
              to="/shop/retail"
              className="w-full py-4 bg-[#1A1918] group-hover:bg-[#C5A059] text-white group-hover:text-[#1A1918] rounded-2xl text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>SHOP RETAIL STORE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* WHOLESALE CARD */}
          <div className="bg-[#1A1918] text-white border-2 border-[#C5A059]/50 rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
                <Briefcase className="w-7 h-7" />
              </div>

              <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                FOR B2B & BULK BUYERS
              </span>

              <h3 className="font-serif text-3xl font-bold text-white">B2B WHOLESALE PORTAL</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Explore our wholesale catalogue, configure bulk quantities, and generate official ReportLab PDF quotations directly from our sales desk.
              </p>
            </div>

            <Link 
              to="/shop/wholesale"
              className="w-full py-4 bg-[#C5A059] hover:bg-white text-[#1A1918] rounded-2xl text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>EXPLORE B2B WHOLESALE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 11. 10 MAIN PRODUCT CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold">
            PRODUCT CATEGORIES
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#1A1918]">
            10 Main Silver Product Categories
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
            Explore our hallmark 925 sterling & 999 fine silver collections curated for pooja rituals, deities, luxury tableware, baby gifts, weddings, and custom corporate tokens.
          </p>
        </div>

        {/* 10 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {MAIN_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white rounded-3xl border border-[#E6E1DA] overflow-hidden hover:shadow-2xl hover:border-[#C5A059] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-[#FAF9F5] overflow-hidden">
                <img
                  src={cat.cardImage}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 bg-[#1A1918]/80 text-[#C5A059] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#C5A059]/40">
                  {cat.subcategories.length} Subcategories
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A1918] group-hover:text-[#C5A059] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-sans leading-relaxed">
                    {cat.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E1DA] flex items-center justify-between text-xs font-semibold text-[#1A1918] group-hover:text-[#C5A059]">
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 11. FEATURED PRODUCTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end border-b border-[#E6E1DA] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
              HANDPICKED SELECTIONS
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A1918]">Featured Silver Creations</h2>
          </div>

          <Link to="/shop/retail" className="text-xs font-bold uppercase tracking-widest text-[#C5A059] hover:underline flex items-center gap-1">
            <span>View Full Catalogue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onQuickView={() => setQuickViewProduct(product)}
            />
          ))}
        </div>
      </section>

      {/* Video Modal Component */}
      {activeVideo && (
        <VideoPlayerModal 
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={activeVideo.video_url}
          title={activeVideo.title}
          description={activeVideo.description}
        />
      )}

      {/* Quick View Modal Component */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
};
