
import React from 'react';
import { Article } from '../types';
import { X, ExternalLink, Calendar, Tag } from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="relative h-[40vh] sm:h-[50vh]">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-500 text-[10px] font-bold uppercase tracking-widest rounded-full text-white">
                  {article.category}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {article.title}
              </h2>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex flex-wrap items-center gap-6 text-zinc-400 dark:text-zinc-500 text-sm mb-10 border-b border-zinc-100 dark:border-zinc-800 pb-8">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(article.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} />
                {article.category}
              </div>
            </div>

            <div className="prose prose-zinc lg:prose-xl max-w-none">
              {article.fullSummary.split('\n').map((para, i) => (
                <p key={i} className="mb-6 text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-200 dark:shadow-none"
              >
                Read Source Article
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
