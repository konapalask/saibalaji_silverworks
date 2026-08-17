import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, Factory, Award, CheckCircle2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { CompanyVideo } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import api from '../services/api';

export const About: React.FC = () => {
  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<CompanyVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/content/videos');
        setVideos(Array.isArray(res.data) ? res.data : []);
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

  const videoList = Array.isArray(videos) ? videos : [];

  const storyVid = videoList.find(v => v.section === 'story') || {
    id: 1,
    title: "The Story Behind the Silver",
    description: "Discover the heritage, passion, and engineering precision that built Sai Balaji Silverworks.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-artisan-crafting-a-piece-of-jewelry-41586-large.mp4",
    thumbnail_url: "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp",
    section: "story",
    sort_order: 1,
    is_active: true,
    created_at: ""
  };

  const mfgVid = videoList.find(v => v.section === 'manufacturing') || {
    id: 2,
    title: "Inside Our Manufacturing Unit",
    description: "Step inside our high-precision casting and silver processing unit in Tenali.",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-silversmith-crafting-metal-work-41584-large.mp4",
    thumbnail_url: "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-God-Idols/AMS-115-0054.webp",
    section: "manufacturing",
    sort_order: 2,
    is_active: true,
    created_at: ""
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">

      {/* Editorial Header with Emblem */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-white border border-[#C8A96B]/60 rounded-xl shadow-lg logo-glow-container">
            <img src="/logo.PNG" alt="Sai Balaji Silverworks Crest" className="h-14 sm:h-16 w-auto object-contain" />
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.35em] text-[#C5A059] font-bold block">
          HERITAGE & CRAFTSMANSHIP
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#1A1918]">
          The Journey of Sai Balaji Silverworks
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
          Combining ancestral metallurgic mastery with modern hallmarking techniques to craft pure 925 sterling & 999 fine silver.
        </p>
      </div>

      {/* Main Video Documentary Card */}
      <div
        onClick={() => openVideo(storyVid)}
        className="relative rounded-3xl overflow-hidden bg-[#1A1918] aspect-21/9 border border-[#C5A059]/40 shadow-2xl group cursor-pointer"
      >
        <img
          src={storyVid.thumbnail_url}
          alt=""
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-8 sm:p-12 text-white">
          <span className="bg-[#C5A059] text-[#1A1918] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit">
            COMPANY DOCUMENTARY VIDEO
          </span>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold">{storyVid.title}</h3>
              <p className="text-xs text-gray-300 max-w-xl mt-1">{storyVid.description}</p>
            </div>

            <div className="w-16 h-16 rounded-full bg-[#C5A059] text-[#1A1918] flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 transition-transform">
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
              src="/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp"
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
          className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-16/10 group cursor-pointer border border-[#E6E1DA]"
        >
          <img
            src={mfgVid.thumbnail_url}
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
            VIDEO 02 — MANUFACTURING UNIT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918]">Inside Our Manufacturing Facility</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Take an unscripted look at our induction furnace melting, laser engraving, anti-tarnish molecular dipping, and NABL certified spectrometer analysis.
          </p>
          <button
            onClick={() => openVideo(mfgVid)}
            className="px-6 py-3 bg-[#1A1918] hover:bg-[#C5A059] text-white rounded-xl text-xs uppercase font-bold tracking-widest flex items-center gap-2"
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
