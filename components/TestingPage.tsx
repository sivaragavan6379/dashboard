
import React, { useState, useEffect } from 'react';
import { BoxData } from '../types';

interface TestingPageProps {
  theme: 'light' | 'dark';
  boxData: BoxData;
  onBack: () => void;
}

export const TestingPage: React.FC<TestingPageProps> = ({ theme, boxData, onBack }) => {
  const [time, setTime] = useState(new Date());
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const Card = ({ title, emoji, color, image, content, subText, animationDelay, isLarge = false }: any) => (
    <div className={`${isLarge ? 'w-full lg:w-3/4' : 'flex-1'} ${isDark ? 'bg-slate-900/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:-translate-y-3 animate-in fade-in slide-in-from-bottom duration-700 ${animationDelay} border group`}>
      <div className={`px-10 py-7 flex items-center justify-between bg-gradient-to-r ${color} shadow-lg relative overflow-hidden`}>
        <div className="flex items-center space-x-5 z-10">
          <span className="text-4xl filter drop-shadow-md group-hover:scale-125 transition-transform duration-500">{emoji}</span>
          <h2 className="text-2xl font-black text-white uppercase tracking-[0.1em] italic drop-shadow-lg">{title}</h2>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
      </div>
      
      <div className={`p-10 flex flex-col flex-1 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950' : 'bg-gradient-to-b from-white to-slate-50'}`}>
        <div className={`relative w-full aspect-video rounded-[2rem] overflow-hidden mb-10 shadow-[0_15px_40px_rgba(0,0,0,0.2)] border-[8px] transition-colors ${isDark ? 'border-slate-800 bg-slate-800' : 'border-white bg-slate-100'}`}>
          {image ? (
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover/img:scale-110" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>Visual Pending</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center text-center px-4">
          <h3 className={`text-2xl md:text-3xl font-black mb-6 uppercase tracking-tight leading-[1.1] italic drop-shadow-sm group-hover:text-indigo-600 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {content}
          </h3>
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className={`h-[2px] w-12 ${isDark ? 'bg-indigo-500/20' : 'bg-slate-200'}`}></div>
            <p className={`text-[12px] font-black uppercase tracking-[0.4em] opacity-90 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {subText}
            </p>
            <div className={`h-[2px] w-12 ${isDark ? 'bg-indigo-500/20' : 'bg-slate-200'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to render the ticker list items
  const renderTickerItems = () => {
    if (boxData.updates.length === 0) {
      return (
        <span className="flex items-center">
          <span className={`mx-24 text-6xl font-thin select-none ${isDark ? 'text-white/10' : 'text-slate-100'}`}>/</span>
          SATELLITE NODE LINKED - AWAITING COMMANDS...
        </span>
      );
    }
    return boxData.updates.map((u, i) => (
      <span key={i} className="flex items-center">
        <span className={`mx-24 text-6xl font-thin select-none ${isDark ? 'text-white/10' : 'text-slate-100'}`}>/</span>
        {u}
      </span>
    ));
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col p-6 lg:p-14 relative custom-scrollbar overflow-x-hidden transition-colors duration-1000 ${isDark ? 'bg-[#050508]' : 'bg-slate-100'}`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]`}></div>
        {isDark && <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>}
      </div>

      <button 
        onClick={onBack}
        className={`fixed top-12 right-12 z-50 w-20 h-20 text-white rounded-[2rem] flex items-center justify-center transition-all hover:scale-110 hover:rotate-90 active:scale-95 group border-2 ${isDark ? 'bg-red-500 border-white/20' : 'bg-red-600 border-red-400'}`}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <main className="relative z-10 flex-1 flex flex-col gap-14 lg:gap-20 mb-32 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          <Card 
            title="Exam Corner"
            emoji="📝"
            color="from-indigo-600 to-blue-700" 
            image={boxData.examImage}
            content={boxData.exam}
            subText="Official Schedule Status"
            animationDelay="delay-0"
          />
          <Card 
            title="Campus Events"
            emoji="🚀"
            color="from-cyan-500 to-blue-500" 
            image={boxData.eventImage}
            content={boxData.event}
            subText="Institutional Highlights"
            animationDelay="delay-100"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
          <Card 
            title="Campus Feed"
            emoji="📰"
            color="from-amber-500 to-orange-600" 
            image={boxData.updatesImage}
            content={boxData.updates[0] || "System sync in progress..."}
            subText="Live Broadcast Stream"
            animationDelay="delay-200"
          />
          <Card 
            title="Daily Wisdom"
            emoji="💡"
            color="from-emerald-500 to-teal-600" 
            image={boxData.quoteImage}
            content={boxData.quote}
            subText="Philosophical Node"
            animationDelay="delay-300"
          />
        </div>

        <div className="flex justify-center">
          <Card 
            title="AI Node"
            emoji="🤖"
            color="from-rose-500 to-pink-600" 
            image={boxData.generalImage}
            content={boxData.general}
            subText="Global Summary"
            animationDelay="delay-500"
            isLarge={true}
          />
        </div>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-3xl h-28 flex items-center shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t overflow-hidden transition-colors ${isDark ? 'bg-black/95 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        <div className={`flex items-center space-x-8 px-14 h-full border-r shrink-0 z-20 shadow-[20px_0_40px_rgba(0,0,0,0.4)] ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="flex h-5 w-5 relative">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></div>
            <div className="relative inline-flex rounded-full h-5 w-5 bg-orange-600"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[#fb7185] font-black uppercase text-[10px] tracking-[0.5em] mb-1">Status: Active</span>
            <span className={`font-black uppercase text-lg tracking-[0.1em] whitespace-nowrap italic leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Live Ticker Stream</span>
          </div>
        </div>
        
        <div className="ticker-container flex-1">
          <div className={`ticker-content text-3xl lg:text-4xl font-black py-2 italic flex items-center ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
            {/* Double the content for a seamless loop */}
            {renderTickerItems()}
            {renderTickerItems()}
          </div>
        </div>
      </footer>
    </div>
  );
};
