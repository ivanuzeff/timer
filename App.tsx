import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Timer as TimerIcon, Volume2 } from 'lucide-react';
import { Timer, SoundType } from './types';
import { TimerCard } from './components/TimerCard';
import { AddTimerModal } from './components/AddTimerModal';
import { Button } from './components/Button';
import { playTimerSound, sendBrowserNotification } from './utils';

// Constants
const TICK_RATE_MS = 100;

export default function App() {
  const [timers, setTimers] = useState<Timer[]>(() => {
    // Load from local storage if available
    try {
      const saved = localStorage.getItem('timers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastTickRef = useRef<number>(Date.now());

  // Save to local storage whenever timers change
  useEffect(() => {
    localStorage.setItem('timers', JSON.stringify(timers));
  }, [timers]);

  // Main timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setTimers(prevTimers => {
        let hasChanges = false;
        
        const nextTimers = prevTimers.map(timer => {
          if (!timer.isRunning || timer.isCompleted) return timer;

          const newRemaining = Math.max(0, timer.remainingTime - deltaSeconds);
          const isFinished = newRemaining <= 0;

          if (isFinished && !timer.isCompleted) {
            // Play Sound
            playTimerSound(timer.sound);
            
            // Send Notification
            if (timer.useNotification) {
                sendBrowserNotification('Таймер завершен!', `${timer.label || 'Таймер'} завершил отсчет.`);
            }

            hasChanges = true;
            return {
              ...timer,
              remainingTime: 0,
              isRunning: false,
              isCompleted: true
            };
          }

          if (newRemaining !== timer.remainingTime) {
             hasChanges = true;
             return { ...timer, remainingTime: newRemaining };
          }
          
          return timer;
        });

        return hasChanges ? nextTimers : prevTimers;
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  const addTimer = (duration: number, label: string, sound: SoundType, useNotification: boolean) => {
    const newTimer: Timer = {
      id: crypto.randomUUID(),
      label: label || `Таймер #${timers.length + 1}`,
      totalDuration: duration,
      remainingTime: duration,
      isRunning: false, // Start manually
      isCompleted: false,
      createdAt: Date.now(),
      sound,
      useNotification
    };
    setTimers(prev => [...prev, newTimer]);
  };

  const toggleTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(t => {
      if (t.id !== id) return t;
      // We also update lastTick when starting to avoid jumping
      if (!t.isRunning) {
        lastTickRef.current = Date.now();
      }
      return { ...t, isRunning: !t.isRunning };
    }));
  }, []);

  const resetTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        remainingTime: t.totalDuration,
        isRunning: false,
        isCompleted: false
      };
    }));
  }, []);

  const deleteTimer = useCallback((id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sort timers: Active first, then paused, then completed
  const sortedTimers = [...timers].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    if (a.isRunning && !b.isRunning) return -1;
    if (!a.isRunning && b.isRunning) return 1;
    return b.createdAt - a.createdAt; // Newest first
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <TimerIcon size={24} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                MultiTimer Pro
              </h1>
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={20} />}
              className="hidden sm:flex"
            >
              Новый таймер
            </Button>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="sm:hidden p-2 bg-indigo-600 rounded-lg text-white"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {timers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-900 rounded-full p-6 mb-4 ring-1 ring-slate-800">
              <Volume2 size={48} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Нет активных таймеров</h2>
            <p className="text-slate-400 max-w-sm mb-8">
              Создайте свой первый таймер, чтобы отслеживать время для работы, готовки или тренировок.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg"
              icon={<Plus size={20} />}
            >
              Создать таймер
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTimers.map(timer => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onDelete={deleteTimer}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <AddTimerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTimer}
      />
    </div>
  );
}