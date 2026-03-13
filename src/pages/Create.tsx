import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Film, Plus, Image as ImageIcon, Calendar, Globe, Star, FileText, Video } from 'lucide-react';
import { dramas, Drama } from '../data/mockData';
import { useAuth } from '../lib/AuthContext';

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null);
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

    // Create a new drama object
    const newDrama: Drama = {
      id: Date.now().toString(),
      title: formData.title,
      genre: formData.genre.split(',').map(g => g.trim()).filter(Boolean),
      year: Number(formData.year),
      episodes: Number(formData.episodes),
      poster: posterPreview || `https://api.dicebear.com/7.x/shapes/svg?seed=${formData.title}`,
      summary: formData.summary,
      trailerUrl: trailerPreview || '',
      rating: Number(formData.rating),
      country: formData.country
    };

    // Add to mock data (in a real app, this would be an API call)
    dramas.unshift(newDrama);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSubmitting(false);
    navigate(`/drama/${newDrama.id}`);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl"
        >
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
                  <Video className="w-4 h-4" /> Trailer Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  name="trailer"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
                />
                {trailerPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-zinc-400 mb-2">Preview:</p>
                    <video src={trailerPreview} controls className="max-h-48 rounded-lg w-full object-cover" />
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
