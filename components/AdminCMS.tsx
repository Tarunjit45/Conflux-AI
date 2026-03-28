
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Send, Image as ImageIcon, Layout, Type, FileText, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const AdminCMS: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('AI Automation');
    const [author, setAuthor] = useState('Tarunjit Biswas');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        const slug = generateSlug(title);

        try {
            const { error } = await supabase
                .from('articles')
                .insert([
                    { title, content, category, author, image_url: imageUrl, slug, is_published: true }
                ]);

            if (error) throw error;

            setStatus({ type: 'success', message: 'Article published successfully! The "Daily Authority" engine is now active.' });
            setTitle('');
            setContent('');
            setImageUrl('');
        } catch (err: any) {
            console.error('CMS Error:', err);
            setStatus({ type: 'error', message: err.message || 'Failed to publish article.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout className="text-blue-600" size={18} />
                        <span className="font-inter text-xs font-black tracking-widest uppercase text-blue-600">
                            Central Command
                        </span>
                    </div>
                    <h1 className="font-inter text-4xl font-black text-slate-940 tracking-tight">
                        Daily <span className="text-blue-600">Authority</span> CMS
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Post manual articles to maintain content freshness and dominate AI rankings.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                                <Type size={14} className="text-blue-500" />
                                Article Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="How AI is Changing Real Estate in 2026..."
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                                <Zap size={14} className="text-blue-500" />
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                            >
                                <option>AI Tools</option>
                                <option>Automation Guides</option>
                                <option>Business Tips</option>
                                <option>Case Study</option>
                                <option>Network Update</option>
                            </select>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                            <ImageIcon size={14} className="text-blue-500" />
                            Featured Image URL
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                            <FileText size={14} className="text-blue-500" />
                            Content (Markdown supported)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your article content here..."
                            required
                            rows={12}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 resize-none"
                        />
                    </div>

                    {/* Author Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Author</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                        />
                    </div>

                    {/* Status Message */}
                    {status.type && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-6 rounded-2xl flex items-center gap-4 ${
                                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}
                        >
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-bold text-sm">{status.message}</span>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                            isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 hover:scale-[1.01]'
                        }`}
                    >
                        {isSubmitting ? 'Neutralizing Latency...' : (
                            <>
                                <Send size={20} />
                                Publish to Network
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminCMS;
