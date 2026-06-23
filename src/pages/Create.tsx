import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Film, Plus, Image as ImageIcon, Calendar, Globe, Star, FileText, Video, Link as LinkIcon, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { uploadDramaData, uploadFileWithProgress } from '../lib/api';
import { parseVideoUrl } from '../lib/videoParser';

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('Preparing upload...');
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null);
  const [videoSourceType, setVideoSourceType] = useState<'link' | 'file'>('link');
  const [trailerUrlInput, setTrailerUrlInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    year: new Date().getFullYear(),
    episodes: 16,
    poster: null as File | null,
    summary: '',
    trailer: null as File | null,
    rating: 0,
    country: 'South Korea'
  });

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in Required</h2>
          <p className="text-zinc-400 mb-6">You need to be signed in to add a new drama.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadStatusText('Starting upload...');

    try {
      let finalPosterUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.title}`;
      let finalTrailerUrl = '';

      if (formData.poster) {
        setUploadStatusText('Uploading poster...');
        finalPosterUrl = await uploadFileWithProgress(
          formData.poster, 
          `posters/${Date.now()}_${formData.poster.name}`,
          (progress) => setUploadProgress(progress)
        );
      }

      if (videoSourceType === 'file' && formData.trailer) {
        setUploadProgress(0);
        setUploadStatusText('Uploading trailer video...');
        finalTrailerUrl = await uploadFileWithProgress(
          formData.trailer, 
          `trailers/${Date.now()}_${formData.trailer.name}`,
          (progress) => setUploadProgress(progress)
        );
      } else if (videoSourceType === 'link') {
        finalTrailerUrl = trailerUrlInput;
      }

      setUploadStatusText('Saving drama data...');
      setUploadProgress(100);

      const newDramaData = {
        title: formData.title,
        genre: formData.genre.split(',').map(g => g.trim()).filter(Boolean),
        year: Number(formData.year),
        episodes: Number(formData.episodes),
        poster: finalPosterUrl,
        summary: formData.summary,
        trailerUrl: finalTrailerUrl,
        rating: Number(formData.rating),
        country: formData.country,
        channel_id: user.id
      };

      const result = await uploadDramaData(newDramaData);
      
      if (result && result.id) {
        setUploadStatusText('បញ្ចប់ការផ្ទុកឡើងដោយជោគជ័យ! កំពុងនាំទៅកាន់ទំព័រដើម...');
        setUploadProgress(100);
        // រង់ចាំ ១ វិនាទី ដើម្បីឱ្យអ្នកប្រើប្រាស់មើលឃើញភាគរយឡើងដល់ ១០០% និងសារជោគជ័យ
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/');
      } else {
        throw new Error('Failed to create drama');
      }
    } catch (error) {
      console.error("Error creating drama:", error);
      alert("Failed to upload. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setUploadStatusText('Preparing upload...');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (file) {
        setFormData(prev => ({ ...prev, [name]: file }));
        const previewUrl = URL.createObjectURL(file);
        if (name === 'poster') {
          setPosterPreview(previewUrl);
        } else if (name === 'trailer') {
          setTrailerPreview(previewUrl);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 mb-6 transition-colors group text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            ត្រឡប់ក្រោយ (Back)
          </button>

          <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Add New Drama</h1>
              <p className="text-zinc-400 text-sm mt-1">Contribute to the Legend | Film database</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4" /> Title
                </label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="e.g. The Glory"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="South Korea">South Korea</option>
                  <option value="China">China</option>
                  <option value="Japan">Japan</option>
                  <option value="Cambodia">Cambodia</option>
                  <option value="Taiwan">Taiwan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Release Year
                </label>
                <input
                  required
                  type="number"
                  name="year"
                  min="1950"
                  max="2030"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4" /> Episodes
                </label>
                <input
                  required
                  type="number"
                  name="episodes"
                  min="1"
                  value={formData.episodes}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Initial Rating (0-10)
                </label>
                <input
                  required
                  type="number"
                  name="rating"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Genres (comma separated)
                </label>
                <input
                  required
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="e.g. Romance, Thriller, Historical"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Poster Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="poster"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
                />
                {posterPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-zinc-400 mb-2">Preview:</p>
                    <img src={posterPreview} alt="Poster preview" className="max-h-48 rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-500" /> Drama Trailer / Episode Video
                </label>
                
                {/* Source selection tabs */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800/80 mb-4">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('link')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      videoSourceType === 'link'
                        ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" /> ភ្ជាប់តាមលីង Link/URL (Free & Fast 🇰🇭)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('file')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      videoSourceType === 'file'
                        ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <Video className="w-4 h-4" /> ផ្ទុកឡើងឯកសារ File (Firebase Storage)
                  </button>
                </div>

                {videoSourceType === 'link' ? (
                  <div className="space-y-4">
                    <div>
                      <input
                        type="url"
                        name="trailerUrl"
                        value={trailerUrlInput}
                        onChange={(e) => setTrailerUrlInput(e.target.value)}
                        placeholder="ឧទាហរណ៍៖ https://t.me/channel_name/123 ឬ https://fb.watch/..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm"
                      />
                    </div>

                    {/* How-to guide card */}
                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-xs text-zinc-400 space-y-3">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-300 text-sm">
                        <Info className="w-4 h-4 text-amber-500" />
                        <span>របៀបទទួលបានលីងវីដេអូឥតគិតថ្លៃ (How to get free links)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-amber-500">🔵 Telegram Channel:</p>
                          <p>១. បង្កើតឬចូលទៅក្នុង Public Channel របស់អ្នក</p>
                          <p>២. បង្ហោះវីដេអូ ឬ Trailer ចូលទៅក្នុង Channel នោះ</p>
                          <p>៣. Right-click ឬ ចុចលើវីដេអូ រួចជ្រើសរើស <strong className="text-zinc-200">Copy Post Link</strong></p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-blue-500">🔵 Facebook Video / Watch:</p>
                          <p>១. ចូលទៅកាន់វីដេអូទំព័រហ្វេសប៊ុកណាមួយ</p>
                          <p>២. ចុចប៊ូតុង <strong className="text-zinc-200">Share (ចែករំលែក)</strong></p>
                          <p>៣. ចុចយក <strong className="text-zinc-200">Copy Link (ចម្លងតំណភ្ជាប់)</strong></p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-500">
                        * ប្រព័ន្ធគាំទ្រលីង Telegram, Facebook, YouTube, Vimeo, និង MP4 Direct URLs ទាំងអស់។
                      </div>
                    </div>

                    {/* Preview box */}
                    {trailerUrlInput && (
                      <div className="mt-4 bg-black rounded-lg border border-zinc-800 overflow-hidden">
                        <p className="text-xs font-semibold text-zinc-400 p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                          <span>ទិដ្ឋភាពបង្ហាញសាកល្បង (Embed Preview) :</span>
                          <span className="text-amber-500 uppercase text-[10px] font-mono tracking-wider">
                            Type: {parseVideoUrl(trailerUrlInput).type}
                          </span>
                        </p>
                        <div className="relative aspect-video w-full bg-zinc-950">
                          {(() => {
                            const parsed = parseVideoUrl(trailerUrlInput);
                            if (parsed.isPrivateTelegram) {
                              return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 text-xs p-6 text-center bg-zinc-900/90 gap-3">
                                  <span className="text-2xl">⚠️</span>
                                  <p className="font-bold text-sm text-red-500">នេះជាលីង Telegram Channel ឯកជន (Private /c/ Link)!</p>
                                  <p className="max-w-md text-zinc-300 leading-relaxed">
                                    ប្រព័ន្ធមិនអាចទាញយកវីដេអូពីក្នុង Channel ឯកជនបានទេ។ ដើម្បីឱ្យទស្សនិកជនមើលឃើញ សូមបង្កើត និងប្រើប្រាស់ <strong className="text-amber-400 underline">Public Telegram Channel</strong> វិញ!
                                  </p>
                                </div>
                              );
                            }
                            if (parsed.type === 'direct') {
                              return (
                                <video
                                  src={parsed.embedUrl}
                                  controls
                                  controlsList="nodownload"
                                  className="w-full h-full object-contain"
                                />
                              );
                            } else if (parsed.type === 'unknown' && !parsed.embedUrl.startsWith('http')) {
                              return (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs p-4 text-center">
                                  សូមបញ្ចូលលីងឱ្យបានត្រឹមត្រូវដើម្បីលេងសាកល្បង
                                </div>
                              );
                            } else {
                              return (
                                <iframe
                                  src={parsed.embedUrl}
                                  title="Video Live Preview"
                                  className="w-full h-full border-0"
                                  allowFullScreen
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                />
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      name="trailer"
                      onChange={handleChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      * ការផ្ទុកឡើងផ្ទាល់នឹងប្រើប្រាស់ទំហំផ្ទុករបស់ Firebase Storage ។
                    </p>
                    {trailerPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-zinc-400 mb-2">ទិដ្ឋភាពបង្ហាញសាកល្បង (Preview) :</p>
                        <video src={trailerPreview} controls controlsList="nodownload" className="max-h-48 rounded-lg w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Summary
                </label>
                <textarea
                  required
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder="What is this drama about?"
                />
              </div>
            </div>

            {isSubmitting && (
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>{uploadStatusText}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Adding...' : 'Add Drama'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
