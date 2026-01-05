
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Article, DailyEdition, AppMode } from './types';
import SlideshowPost from './components/SlideshowPost';
import CurateMode from './components/CurateMode';
import { LayoutGrid, PlusCircle, Sparkles, User, ArrowUp, Zap, Radio, Menu, X } from 'lucide-react';
import { loadAllEditions } from './services/dataService';
import ImageWithFallback from './components/ImageWithFallback';
import InstallPrompt from './components/InstallPrompt';
import InstallBanner from './components/InstallBanner';
import { getUnreadCount } from './services/readTracker';

const App: React.FC = () => {
  const [editions, setEditions] = useState<DailyEdition[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.FEED);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Calculate unread count
  const updateUnreadCount = () => {
    const editionIds = editions.map(e => e.id);
    setUnreadCount(getUnreadCount(editionIds));
  };

  // Load editions from JSON files on mount
  useEffect(() => {
    loadAllEditions()
      .then(data => {
        setEditions(data);
        setIsInitialLoading(false);
        // Calculate initial unread count
        const editionIds = data.map(e => e.id);
        setUnreadCount(getUnreadCount(editionIds));
      })
      .catch(error => {
        console.error('Failed to load editions:', error);
        setIsInitialLoading(false);
      });
  }, []);

  const loadMoreEditions = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const olderDate = new Date();
    olderDate.setDate(olderDate.getDate() - editions.length);

    const newEdition: DailyEdition = {
      id: `ed-${Math.floor(Math.random() * 90) + 10}`,
      date: olderDate.toISOString(),
      title: 'Material Science & Pure Design',
      articles: [
        {
          id: `a-${Math.random()}`,
          title: 'Design as a Tool for Focus',
          url: 'https://example.com',
          shortDescription: 'Why simplicity remains the ultimate sophistication in hardware development.',
          fullSummary: '...',
          imageUrl: `https://picsum.photos/seed/${Math.random()}/1200/1500`,
          category: 'Philosophy',
          date: olderDate.toISOString()
        }
      ]
    };

    setEditions(prev => [...prev, newEdition]);
    setIsLoadingMore(false);
  }, [editions.length, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && mode === AppMode.FEED) loadMoreEditions();
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMoreEditions, mode]);

  const handleArticleAdded = (newArticle: Article) => {
    setEditions(prev => {
      const updated = [...prev];
      updated[0].articles = [newArticle, ...updated[0].articles];
      return updated;
    });
    setMode(AppMode.FEED);
  };

  const navItems = [
    { label: 'The Feed', icon: <LayoutGrid size={18} />, mode: AppMode.FEED },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 transition-colors duration-300">

      {/* Desktop Floating Command Center (Bottom-Left) */}
      <div className="fixed bottom-8 left-8 z-[60] hidden lg:block">
        <div className="glass dark:bg-zinc-900/80 dark:border-white/10 p-5 rounded-[28px] shadow-airbnb border border-black/5 flex flex-col gap-6 w-[220px]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            setMode(AppMode.FEED);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <ImageWithFallback
              src={`${(import.meta as any).env.BASE_URL}logo.png`}
              alt="Pulse Logo"
              className="w-10 h-10 object-contain rounded-xl"
            />
            <div>
              <h1 className="text-lg font-extrabold tracking-tighter text-[#222222] dark:text-zinc-100">Pulse</h1>
              <p className="text-[9px] font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase mt-0.5">Intelligence</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setMode(item.mode)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm ${mode === item.mode ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300' : 'text-[#717171] dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[#222222] dark:hover:text-zinc-200'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            {/* Create a feed link */}
            <a
              href="https://feeds.saveaday.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm text-[#717171] dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[#222222] dark:hover:text-zinc-200"
            >
              <PlusCircle size={18} />
              Create a feed
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Normal App Bar (Top Edge-to-Edge) */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 flex items-center justify-between lg:hidden shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3" onClick={() => {
          setMode(AppMode.FEED);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <ImageWithFallback
            src={`${(import.meta as any).env.BASE_URL}logo.png`}
            alt="Pulse Logo"
            className="w-10 h-10 object-contain rounded-xl"
          />
          <div>
            <h1 className="text-base font-extrabold tracking-tighter text-[#222222] dark:text-zinc-100 leading-none">Pulse</h1>
            <p className="text-[8px] font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase mt-0.5 leading-none">Intelligence</p>
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 rounded-full text-[#222222] dark:text-zinc-200 active:scale-90 transition-transform"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[110] transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[32px] p-8 shadow-2xl transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-10" />

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src={`${(import.meta as any).env.BASE_URL}logo.png`}
                  alt="Pulse Logo"
                  className="w-16 h-16 object-contain rounded-2xl"
                />
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tighter text-[#222222] dark:text-zinc-100">Pulse</h1>
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-widest uppercase">Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-[#717171] dark:text-zinc-400 active:scale-90 transition-transform"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setMode(item.mode);
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center justify-between p-6 rounded-[24px] font-bold text-xl transition-all ${mode === item.mode ? 'bg-primary-600 text-white' : 'text-[#717171] bg-[#f7f7f7]'}`}
                >
                  <div className="flex items-center gap-4">
                    {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
                    <span>{item.label}</span>
                  </div>
                  <Sparkles size={20} className={mode === item.mode ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}

              {/* Create a feed link - Mobile */}
              <a
                href="https://feeds.saveaday.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 rounded-[24px] font-bold text-xl transition-all text-[#717171] bg-[#f7f7f7]"
              >
                <div className="flex items-center gap-4">
                  <PlusCircle size={28} />
                  <span>Create a feed</span>
                </div>
                <div className="w-1 h-1" /> {/* Spacer to keep alignment similar */}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="pt-20 lg:pt-16 pb-48 px-3 lg:px-6">
        {isInitialLoading ? (
          <div className="min-h-screen flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-lg font-bold text-[#222222] dark:text-zinc-100 mb-1">Loading Daily Editions...</p>
              <p className="text-xs text-[#717171] dark:text-zinc-500">Curating your personalized feed</p>
            </div>
          </div>
        ) : mode === AppMode.CURATE ? (
          <div className="max-w-xl mx-auto pt-10">
            <CurateMode onArticleAdded={handleArticleAdded} />
          </div>
        ) : (
          <div>
            <header className="max-w-[548px] mx-auto mb-8 lg:mb-20 px-1 animate-pulse-in text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
                <Sparkles size={14} className="text-primary-500 dark:text-primary-400" fill="currentColor" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#717171] dark:text-zinc-500">
                  Current Edition • {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </p>
              </div>
              <h2 className="text-[38px] sm:text-[52px] font-extrabold tracking-tighter text-[#222222] dark:text-zinc-100 leading-[0.95] mb-6 lg:mb-8">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return 'Good morning.';
                  if (hour < 18) return 'Good afternoon.';
                  return 'Good evening.';
                })()}{' '}
                {unreadCount === 0 ? (
                  <><br /><span className="text-primary-600 dark:text-primary-400">You're up to speed.</span></>
                ) : null}
              </h2>
              {unreadCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-[28px] border border-[#ebebeb] dark:border-zinc-800 shadow-sm">
                  <div className="flex -space-x-2.5">
                    {[1, 2, 3].map(i => <div key={i} className="w-9 h-9 rounded-full border-[3px] border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800" />)}
                  </div>
                  <p className="text-[13px] text-[#717171] dark:text-zinc-400 font-bold leading-tight text-center sm:text-left">
                    <span className="text-[#222222] dark:text-zinc-200">Freshly Curated</span><br />
                    {unreadCount} essential {unreadCount === 1 ? 'story' : 'stories'} waiting for you.
                  </p>
                </div>
              )}

              {/* Install Banner - shown inline below Freshly Curated */}
              <InstallBanner inline={true} />
            </header>

            <div className="flex flex-col gap-8 lg:gap-14">
              {editions.map((edition) => (
                <SlideshowPost
                  key={edition.id}
                  edition={edition}
                  onEditionRead={updateUnreadCount}
                />
              ))}
            </div>

            <div ref={observerTarget} className="py-32 flex flex-col items-center gap-6">
              {isLoadingMore ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary-600/5 border-t-primary-600 rounded-full animate-spin" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#717171]">Expanding Knowledge Base...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-10">
                  <LayoutGrid size={24} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Knowledge Stream End</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Back to Top (Bottom-Right) */}
      {mode === AppMode.FEED && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-white text-[#222222] rounded-[22px] shadow-airbnb flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-black/5 z-50 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <ArrowUp size={20} className="relative group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

      {/* PWA Install Prompt Modal */}
      <InstallPrompt />
    </div>
  );
};

export default App;
