
import React, { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { TestingPage } from './components/TestingPage';
import { AdminPanel } from './components/AdminPanel';
import { Page, BoxData, SummaryHistoryItem, TargetBox } from './types';

const INITIAL_BOX_DATA: BoxData = {
  exam: "Final Exams starting next Monday. Check your assigned rooms in the main hall.",
  examImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
  event: "Annual Science Fair on Friday. Registration closes this evening.",
  eventImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80",
  updates: [], // Starts empty to only display manual commands from Admin
  updatesImage: "https://images.unsplash.com/photo-1504711432819-04220752705a?auto=format&fit=crop&w=600&q=80",
  quote: "The only way to do great work is to love what you do.",
  quoteImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
  general: "Welcome to the new digital dashboard. Summaries will appear here.",
  generalImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [boxData, setBoxData] = useState<BoxData>(INITIAL_BOX_DATA);
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const quotes = [
      "Believe you can and you're halfway there.",
      "Education is the most powerful weapon which you can use to change the world.",
      "Intelligence plus character - that is the goal of true education.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The beautiful thing about learning is that no one can take it away from you."
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setBoxData(prev => ({ ...prev, quote: quotes[dayOfYear % quotes.length] }));
  }, []);

  const handleUpdateBox = (target: TargetBox, summary: string, imageSrc?: string) => {
    setBoxData(prev => {
      const fieldImage = `${target}Image` as keyof BoxData;
      if (target === 'updates') {
        // We prepend new manual commands to the list
        return { 
          ...prev, 
          updates: [summary, ...prev.updates].slice(0, 15),
          updatesImage: imageSrc || prev.updatesImage 
        };
      }
      return { 
        ...prev, 
        [target]: summary,
        [fieldImage]: imageSrc || prev[fieldImage]
      };
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <Welcome theme={theme} onNavigate={setCurrentPage} />;
      case 'testing':
        return <TestingPage theme={theme} boxData={boxData} onBack={() => setCurrentPage('welcome')} />;
      case 'admin':
        return (
          <AdminPanel 
            theme={theme}
            setTheme={setTheme}
            history={history} 
            setHistory={setHistory} 
            onUpdateBox={handleUpdateBox}
            onBack={() => setCurrentPage('welcome')} 
          />
        );
      default:
        return <Welcome theme={theme} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {renderPage()}
    </div>
  );
};

export default App;