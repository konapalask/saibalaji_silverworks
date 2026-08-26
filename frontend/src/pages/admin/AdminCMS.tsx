import React, { useState, useEffect } from 'react';
import { Save, Check, Plus, Edit, Trash2, Video, FileText, Image as ImageIcon, X } from 'lucide-react';
import { CompanyVideo } from '../../types';
import api from '../../services/api';

export const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'videos'>('hero');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroContent, setHeroContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [savedHero, setSavedHero] = useState(false);

  const [videos, setVideos] = useState<CompanyVideo[]>([]);
  const [isVidModalOpen, setIsVidModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CompanyVideo | null>(null);
  const [vidForm, setVidForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    section: 'story',
    sort_order: 1,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heroRes, vidRes] = await Promise.all([
        api.get('/content/homepage_hero'),
        api.get('/content/videos/all')
      ]);
      if (heroRes.data) {
        setHeroTitle(heroRes.data.title || '');
        setHeroContent(heroRes.data.content || '');
        setMediaUrl(heroRes.data.media_url || '');
      }
      setVideos(Array.isArray(vidRes.data) ? vidRes.data : []);
    } catch (err) {
      console.error('Error fetching CMS data', err);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/content/homepage_hero', {
        title: heroTitle,
        content: heroContent,
        media_url: mediaUrl
      });
      setSavedHero(true);
      setTimeout(() => setSavedHero(false), 3000);
    } catch (err) {
      alert('Failed to update Hero content');
    }
  };

  const handleOpenCreateVid = () => {
    setEditingVideo(null);
    setVidForm({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '/homescreen.webp',
      section: 'story',
      sort_order: videos.length + 1,
      is_active: true
    });
    setIsVidModalOpen(true);
  };

  const handleOpenEditVid = (vid: CompanyVideo) => {
    setEditingVideo(vid);
    setVidForm({
      title: vid.title,
      description: vid.description || '',
      video_url: vid.video_url,
      thumbnail_url: vid.thumbnail_url || '',
      section: vid.section,
      sort_order: vid.sort_order,
      is_active: vid.is_active
    });
    setIsVidModalOpen(true);
  };

  const handleSaveVid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await api.put(`/content/videos/${editingVideo.id}`, vidForm);
      } else {
        await api.post('/content/videos', vidForm);
      }
      setIsVidModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save video');
    }
  };

  const handleDeleteVid = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video showcase?')) return;
    try {
      await api.delete(`/content/videos/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            EDITORIAL CMS & VIDEO ENGINE
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1A1918]">Website Content & Video Control</h1>
        </div>

        {activeTab === 'videos' && (
          <button 
            onClick={handleOpenCreateVid}
            className="bg-[#1A1918] hover:bg-[#C5A059] text-white px-5 py-3 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Add New Company Video</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-2 flex space-x-2 text-xs font-bold uppercase tracking-wider">
        <button 
          onClick={() => setActiveTab('hero')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'hero' ? 'bg-[#1A1918] text-white shadow-md' : 'text-gray-600 hover:bg-[#FAF9F5]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#C5A059]" />
          <span>Hero Text & Story Banner</span>
        </button>

        <button 
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'videos' ? 'bg-[#1A1918] text-white shadow-md' : 'text-gray-600 hover:bg-[#FAF9F5]'
          }`}
        >
          <Video className="w-4 h-4 text-[#C5A059]" />
          <span>Company Videos Manager ({videos.length})</span>
        </button>
      </div>

      {/* Hero Tab */}
      {activeTab === 'hero' && (
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Homepage Hero Title Heading *</label>
              <input 
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3 font-serif text-lg text-[#1A1918]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Hero Subtitle Story *</label>
              <textarea 
                rows={3}
                required
                value={heroContent}
                onChange={(e) => setHeroContent(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Hero Background Image / Media URL *</label>
              <input 
                type="text"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-3"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {savedHero ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4 text-[#C5A059]" />}
              <span>{savedHero ? 'Published Live!' : 'Publish Editorial Hero Updates'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Videos Manager Tab */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] border-b border-[#E6E1DA] text-[#1A1918] uppercase tracking-wider font-serif">
                  <tr>
                    <th className="py-4 px-6">Video Showcase</th>
                    <th className="py-4 px-6">Section Placement</th>
                    <th className="py-4 px-6">Sort Order</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {videos.map((vid) => (
                    <tr key={vid.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img src={vid.thumbnail_url || '/public/sai balajji products/Elegant Silver Lakshmi Devi Idol with Ornate Arch.webp'} alt="" className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                        <div>
                          <span className="font-serif text-sm font-bold text-[#1A1918] block">{vid.title}</span>
                          <span className="text-[10px] text-gray-500 truncate max-w-xs block">{vid.description}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-[#1A1918] text-[#C5A059] text-[9px] font-bold uppercase px-2.5 py-1 rounded-full">
                          {vid.section}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold">{vid.sort_order}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vid.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {vid.is_active ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => handleOpenEditVid(vid)} className="p-2 text-gray-600 hover:text-[#C5A059] rounded-lg border border-[#E6E1DA]">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteVid(vid.id)} className="p-2 text-gray-600 hover:text-red-600 rounded-lg border border-[#E6E1DA]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isVidModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-3xl max-w-xl w-full p-8 shadow-2xl relative my-8">
            <button onClick={() => setIsVidModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-serif text-2xl font-bold mb-6">{editingVideo ? 'Edit Video Showcase' : 'Add New Company Video'}</h3>

            <form onSubmit={handleSaveVid} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Video Title *</label>
                <input type="text" required value={vidForm.title} onChange={(e) => setVidForm({ ...vidForm, title: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={vidForm.description} onChange={(e) => setVidForm({ ...vidForm, description: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Video Stream MP4 URL *</label>
                <input type="text" required value={vidForm.video_url} onChange={(e) => setVidForm({ ...vidForm, video_url: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5 font-mono text-[11px]" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Thumbnail Preview Image URL</label>
                <input type="text" value={vidForm.thumbnail_url} onChange={(e) => setVidForm({ ...vidForm, thumbnail_url: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-4 py-2.5" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Section Placement</label>
                  <select value={vidForm.section} onChange={(e) => setVidForm({ ...vidForm, section: e.target.value })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2">
                    <option value="hero">Hero Background</option>
                    <option value="story">Company Story (01)</option>
                    <option value="manufacturing">Inside Unit (02)</option>
                    <option value="craftsmen">Master Craftsmen (03)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={vidForm.sort_order} onChange={(e) => setVidForm({ ...vidForm, sort_order: parseInt(e.target.value) })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2" />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select value={vidForm.is_active ? 'true' : 'false'} onChange={(e) => setVidForm({ ...vidForm, is_active: e.target.value === 'true' })} className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl uppercase tracking-widest font-bold">
                Save Video Configuration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
