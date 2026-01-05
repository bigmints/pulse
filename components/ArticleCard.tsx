
import React from 'react';
import { Article } from '../types';
import { ChevronRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  index: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, index }) => {
  return (
    <div
      className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded-full text-zinc-800 border border-white/20">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {article.title}
        </h3>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm line-clamp-3 leading-relaxed">
          {article.shortDescription}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex items-center text-xs font-semibold text-zinc-900 dark:text-zinc-200 group-hover:gap-2 gap-1 transition-all">
            Read More
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
