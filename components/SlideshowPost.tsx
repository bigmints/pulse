import React, { useRef, useState, useEffect } from 'react';
import { DailyEdition } from '../types';
import { ChevronLeft, ChevronRight, Share2, MoreHorizontal, Layers, ArrowRight, ChevronRight as ChevronRightIcon } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { markEditionAsRead } from '../services/readTracker';
import SharePreviewModal from './SharePreviewModal';
interface SlideshowPostProps {
  edition: DailyEdition;
  onEditionRead?: () => void; // Callback when edition is marked as read
}

const SlideshowPost: React.FC<SlideshowPostProps> = ({ edition, onEditionRead }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const totalSlides = edition.articles.length + 1;

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const slideWidth = scrollRef.current.offsetWidth;
      if (slideWidth > 0) {
        const newActiveSlide = Math.round(scrollPosition / slideWidth);
        if (newActiveSlide !== activeSlide) {
          setActiveSlide(newActiveSlide);

          // Mark edition as read when user views it (skip cover slide which is index 0)
          if (newActiveSlide > 0) {
            markEditionAsRead(edition.id);
            onEditionRead?.();
          }
        }
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full max-w-[548px] mx-auto animate-pulse-in">
      {/* Main Slideshow Card - Full Bleed Image Container */}
      <div className="relative aspect-[3/5] lg:aspect-auto lg:h-[70vh] bg-zinc-100 dark:bg-zinc-900 rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#ebebeb] dark:border-zinc-800 group mb-5">

        {/* Story Progress Indicators (Top Bar) */}
        <div className="absolute top-5 inset-x-10 z-30 flex gap-1.5 h-[2px]">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} className="flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ease-out ${activeSlide === i ? 'w-full' : activeSlide > i ? 'w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-pointer"
        >
          {/* Cover Slide */}
          <div className="flex-shrink-0 w-full h-full relative snap-start">
            <div className="absolute inset-0">
              <ImageWithFallback
                src={edition.cover?.imageUrl || edition.articles[0]?.imageUrl}
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">

              <div className="mb-10">
                {edition.cover ? (
                  <div className="flex flex-col gap-4">
                    {edition.cover.title && (
                      <h1 className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">
                        {edition.cover.title}
                      </h1>
                    )}
                    <h1 className="text-[24px] sm:text-[32px] font-extrabold text-white leading-[1.1] tracking-tighter line-clamp-[6] overflow-hidden">
                      {edition.cover.summary}
                    </h1>
                  </div>
                ) : edition.summary ? (
                  <h1 className="text-[32px] sm:text-[40px] font-extrabold text-white leading-[1.05] tracking-tighter">
                    {edition.summary}
                  </h1>
                ) : (
                  <div className="flex flex-col gap-4">
                    <h1 className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">
                      Briefing • {new Date(edition.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </h1>
                    <div className="flex flex-col gap-3">
                      {edition.articles.slice(0, 3).map((article) => (
                        <div key={article.id} className="flex gap-3 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
                          <h2 className="text-xl font-bold text-white leading-tight">{article.title}</h2>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-white/20 pt-8">
                <div className="flex items-center gap-1.5">
                  <span>Swipe to begin</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                  </div>
                  <ChevronRightIcon size={14} className="opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Article Slides */}
          {edition.articles.map((article) => (
            <div key={article.id} className="flex-shrink-0 w-full h-full relative snap-start overflow-hidden">
              <ImageWithFallback
                src={article.imageUrl}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-xl border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {article.category}
                  </span>
                </div>

                <h3 className="text-[32px] font-extrabold text-white mb-3 leading-[1.05] tracking-tighter">
                  {article.title}
                </h3>

                <p className="text-white/70 text-[14px] mb-8 leading-relaxed line-clamp-2 font-medium">
                  {article.shortDescription}
                </p>

                <div className="flex">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#222222] rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.1)] active:scale-95 group/btn"
                  >
                    Read article
                    <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Side Controls */}
        <button
          onClick={(e) => { e.stopPropagation(); scrollToSlide(activeSlide - 1); }}
          className={`absolute left-5 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#222222] shadow-soft transition-all z-30 ${activeSlide > 0 ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); scrollToSlide(activeSlide + 1); }}
          className={`absolute right-5 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#222222] shadow-soft transition-all z-30 ${activeSlide < totalSlides - 1 ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Footer Content - Metadata BELOW the card (Removed Title, kept Date) */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] text-[#717171] dark:text-zinc-400 font-bold tracking-tight">
          {edition.author || 'Pretheesh'}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-[#222222] dark:text-zinc-200"
          >
            <Share2 size={18} />
          </button>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-[#222222] dark:text-zinc-200">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <SharePreviewModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        edition={edition}
      />
    </div>
  );
};


export default SlideshowPost;
