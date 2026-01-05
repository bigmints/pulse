
import React, { useState } from 'react';
import { generateArticleData, generateHeroImage } from '../services/geminiService';
import { Article } from '../types';
import { Loader2, Sparkles, Plus, AlertCircle } from 'lucide-react';

interface CurateModeProps {
  onArticleAdded: (article: Article) => void;
}

const CurateMode: React.FC<CurateModeProps> = ({ onArticleAdded }) => {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!url) return;
    setIsGenerating(true);
    setError('');

    try {
      // In a real scenario, you'd fetch the webpage content here.
      // For this demo, we simulate processing the URL with Gemini.
      const mockText = "This article discusses the latest advancements in clean energy technology and how it's shaping our cities.";
      const baseData = await generateArticleData(url, mockText);
      const imageUrl = await generateHeroImage(baseData.title || 'Tech innovation');

      const completeArticle: Article = {
        ...(baseData as Article),
        imageUrl
      };

      onArticleAdded(completeArticle);
      setUrl('');
    } catch (err) {
      console.error(err);
      setError('Failed to generate article content. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm mb-12 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Sparkles size={20} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Curate New Content</h2>
      </div>

      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
        Paste an article URL. Gemini will generate a summary and a conceptual hero image.
      </p>

      <div className="space-y-4">
        <div>
          <input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-xl">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !url}
          className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-100 dark:shadow-none"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Plus size={18} />
              Add to Daily Feed
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CurateMode;
