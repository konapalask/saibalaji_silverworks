import React, { useState, useEffect, useMemo } from 'react';
import { Play, ShieldCheck, Factory, Award, Search, Film, Sparkles, Filter, ChevronDown, Video } from 'lucide-react';
import { CompanyVideo } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { initialVideosData } from '../data/videosData';
import api from '../services/api';

export const About: React.FC = () => {
  const [videos, setVideos] = useState<CompanyVideo[]>(initialVideosData);
  const [activeVideo, setActiveVideo] = useState<CompanyVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Gallery state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [displayCount, setDisplayCount] = useState<number>(12);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/content/videos');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setVideos(res.data);
        }
      } catch (err) {
        console.error('Error fetching story videos', err);
      }
    };
    fetchVideos();
  }, []);

  const openVideo = (v: CompanyVideo) => {
    setActiveVideo(v);
    setIsVideoModalOpen(true);
  };

  const videoList = useMemo(() => {
    return Array.isArray(videos) ? videos : [];
  }, [videos]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    videoList.forEach(v => {
      if (v.category) set.add(v.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [videoList]);

  // Filtered video list
  const filteredVideos = useMemo(() => {
    return videoList.filter(vid => {
      const matchesCategory = selectedCategory === 'ALL' || vid.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        vid.title.toLowerCase().includes(q) || 
        (vid.description && vid.description.toLowerCase().includes(q)) ||
        (vid.filename && vid.filename.toLowerCase().includes(q)) ||
        (vid.category && vid.category.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [videoList, selectedCategory, searchQuery]);

  const visibleVideos = useMemo(() => {
    return filteredVideos.slice(0, displayCount);
  }, [filteredVideos, displayCount]);

  const storyVid = videoList.find(v => v.section === 'story') || videoList[0] || {
    id: 1,
    title: "The Story Behind the Silver",
    description: "Discover the heritage, passion, and engineering precision that built Sai Balaji Silverworks.",
    video_url: "/public/videos/6Z1A1790.MP4",
    thumbnail_url: "/public/videos/6Z1A1790.MP4",
    section: "story",
    sort_order: 1,
    is_active: true,
    created_at: ""
  };

  const mfgVid = videoList.find(v => v.section === 'manufacturing' && v.id !== storyVid.id) || videoList[1] || {
    id: 2,
    title: "Inside Our Manufacturing Unit",
    description: "Step inside our high-precision casting and silver processing unit in Tenali.",
    video_url: "/public/videos/6Z1A1791.MP4",
    thumbnail_url: "/public/videos/6Z1A1791.MP4",
    section: "manufacturing",
    sort_order: 2,
    is_active: true,
    created_at: ""
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-[#202020]">

      {/* Editorial Header with Emblem */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-white border border-[#E5E0D8] rounded-2xl shadow-xs">
            <img src="/logo.webp" alt="Sai Balaji Silverworks Crest" className="h-14 sm:h-16 w-auto object-contain" />
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.35em] text-[#B9A77A] font-bold block">
          HERITAGE & CRAFTSMANSHIP
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#202020]">
          The Journey of Sai Balaji Silverworks
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans">
          Combining ancestral metallurgic mastery with modern NABL hallmarking techniques to craft pure 925 sterling & 999 fine silver.
        </p>
      </div>

      {/* Main Video Documentary Card */}
      <div
        onClick={() => openVideo(storyVid)}
        className="relative rounded-3xl overflow-hidden bg-black aspect-21/9 border border-[#E5E0D8] product-shadow group cursor-pointer"
      >
        <video
          src={storyVid.video_url}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          muted
          loop
          playsInline
          autoPlay
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-8 sm:p-12 text-white">
          <span className="bg-[#B9A77A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit">
            COMPANY DOCUMENTARY VIDEO
          </span>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold">{storyVid.title}</h3>
              <p className="text-xs text-gray-200 max-w-xl mt-1">{storyVid.description}</p>
            </div>

            <div className="w-16 h-16 rounded-full bg-white text-[#202020] hover:bg-[#B9A77A] hover:text-white flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-serif text-3xl font-bold text-[#1A1918]">
            Master Craftsmen in Silver Manufacturing
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Sai Balaji Silverworks was founded on a singular vision: to produce silver products of unquestionable purity and timeless elegance. From our high-precision casting lines in Tenali to our intricate hand-carving artisan studios, every stage of production reflects uncompromising commitment.
          </p>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Whether supplying bulk silver idols to prominent temples across South India or manufacturing bespoke 925 sterling jewellery collections for premium retail stores, our products carry the official seal of trust.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="arch-top overflow-hidden border border-[#C5A059]/40 bg-white p-3 shadow-xl">
            <img
              src="/public/Saibalaji products S/Elegant Silver Lakshmi Devi Idol with Ornate Arch.webp"
              alt="Artisanal Silver Carving"
              className="w-full aspect-4/3 object-cover rounded-t-full"
            />
          </div>
        </div>
      </div>

      {/* Second Video Card — Manufacturing Unit */}
      <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div
          onClick={() => openVideo(mfgVid)}
          className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-16/10 group cursor-pointer border border-[#E6E1DA] bg-black"
        >
          <video
            src={mfgVid.video_url}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform pointer-events-none"
            muted
            loop
            playsInline
            autoPlay
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center shadow-xl">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            FEATURED VIDEO — MANUFACTURING UNIT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">{mfgVid.title}</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {mfgVid.description || "Take an unscripted look at our induction furnace melting, laser engraving, anti-tarnish molecular dipping, and NABL certified spectrometer analysis."}
          </p>
          <button
            onClick={() => openVideo(mfgVid)}
            className="px-6 py-3 bg-[#1A1918] hover:bg-[#C5A059] text-white rounded-xl text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Manufacturing Tour</span>
          </button>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#E6E1DA]">
        <div className="bg-white p-8 rounded-3xl border border-[#E6E1DA] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Spectrometer Purity</h3>
          <p className="text-xs text-gray-600">Every melt batch undergoes chemical analysis to guarantee exact 92.5% and 99.9% purity standards.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E6E1DA] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <Factory className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">In-House Unit</h3>
          <p className="text-xs text-gray-600">Complete control over silver refining, sheet rolling, wire drawing, casting, polishing, and anti-tarnish coating.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E6E1DA] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#C5A059] flex items-center justify-center text-[#C5A059]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1A1918]">Pan-India B2B Supply</h3>
          <p className="text-xs text-gray-600">Trusted wholesale partner for jewellers, corporate houses, and temples requiring reliable bulk supply.</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MANUFACTURING & ARTISAN VIDEO ARCHIVE (171 VIDEOS DUMP GALLERY SECTION) */}
      {/* ========================================================================= */}
      <div className="space-y-8 pt-8" id="video-archive">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E6E1DA] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C5A059]/10 text-[#C5A059] rounded-lg">
                <Film className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
                FACTORY & STUDIO ARCHIVE
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">
              Craftsmanship Video Gallery
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Unfiltered video clips from our Tenali silver manufacturing plant and artisan studios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-full border border-[#E6E1DA] text-xs font-medium text-gray-700 shadow-xs flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-[#C5A059]" />
              <span><strong>{filteredVideos.length}</strong> Videos Available</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-xs">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setDisplayCount(12);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1A1918] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-gray-600 hover:bg-[#E6E1DA] hover:text-[#1A1918]'
                }`}
              >
                {cat === 'ALL' ? `All Videos (${videoList.length})` : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(12);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl focus:outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>
        </div>

        {/* Video Grid */}
        {visibleVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => openVideo(video)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#E6E1DA] hover:border-[#C5A059] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-16/10 bg-black overflow-hidden">
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />

                  {/* Category & Badge overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#B9A77A] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                      {video.category || 'Craftsmanship'}
                    </span>
                    {video.filename && (
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-mono rounded">
                        #{video.filename.replace('.MP4', '')}
                      </span>
                    )}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#1A1918] group-hover:bg-[#C5A059] group-hover:text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-4 space-y-2 bg-white">
                  <h4 className="font-serif text-sm font-bold text-[#1A1918] line-clamp-1 group-hover:text-[#C5A059] transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E6E1DA] space-y-3">
            <Film className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1A1918]">No videos matched your criteria</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 bg-[#1A1918] text-white text-xs font-bold rounded-xl hover:bg-[#C5A059] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredVideos.length > displayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount(prev => prev + 16)}
              className="px-8 py-3 bg-[#1A1918] hover:bg-[#C5A059] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Load More Craftsmanship Videos ({filteredVideos.length - displayCount} remaining)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {activeVideo && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={activeVideo.video_url}
          title={activeVideo.title}
          description={activeVideo.description}
        />
      )}

    </div>
  );
};
