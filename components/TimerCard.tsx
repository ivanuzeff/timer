import React from 'react';
import { Play, Pause, RotateCcw, Trash2, BellRing, Bell, Repeat, Volume2, VolumeX } from 'lucide-react';
import { Timer } from '../types';
import { formatTime } from '../utils';
import { Button } from './Button';

interface TimerCardProps {
  timer: Timer;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
}

export const TimerCard: React.FC<TimerCardProps> = ({ 
  timer, 
  onToggle, 
  onReset, 
  onDelete,
  onVolumeChange
}) => {
  const percentage = Math.max(0, Math.min(100, (timer.remainingTime / timer.totalDuration) * 100));
  const currentVolume = timer.volume ?? 0.5; // Fallback for old timers
  
  // Dynamic color based on state
  let statusColor = "bg-indigo-500";
  if (timer.isCompleted) statusColor = "bg-red-500";
  else if (!timer.isRunning && timer.remainingTime < timer.totalDuration) statusColor = "bg-amber-500";
  else if (!timer.isRunning) statusColor = "bg-slate-600";
  if (timer.isRunning && timer.isLooping) statusColor = "bg-emerald-500";

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700 shadow-lg backdrop-blur-sm transition-all duration-300 ${timer.isCompleted ? 'ring-2 ring-red-500/50 shadow-red-900/20' : 'hover:border-slate-600'}`}>
      
      {/* Background Progress Bar */}
      <div 
        className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-linear ${statusColor}`} 
        style={{ width: `${percentage}%` }}
      />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-200 truncate max-w-[120px]" title={timer.label}>
                {timer.label || 'Таймер'}
                </h3>
                <div className="flex items-center gap-1">
                    {timer.useNotification && !timer.isCompleted && (
                        <span title="Уведомление включено" className="flex items-center">
                            <Bell size={12} className="text-indigo-400" />
                        </span>
                    )}
                    {timer.isLooping && (
                        <span title="Автоповтор" className="flex items-center">
                            <Repeat size={12} className="text-emerald-400" />
                        </span>
                    )}
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Всего: {formatTime(timer.totalDuration)}
            </p>
          </div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${timer.isCompleted ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-700/50 text-slate-500'}`}>
             {timer.isCompleted ? <BellRing size={16} /> : <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
          </div>
        </div>

        <div className="flex flex-col items-center py-2 mb-2">
          <span className={`text-4xl font-mono font-bold tracking-tight ${timer.isCompleted ? 'text-red-400' : 'text-white'}`}>
            {formatTime(Math.ceil(timer.remainingTime))}
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
            {timer.isCompleted ? 'Завершено' : timer.isRunning ? (timer.isLooping ? 'Цикл...' : 'Идет отсчет') : 'Пауза'}
          </span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 mb-4 px-1 group">
             <button 
                onClick={() => onVolumeChange(timer.id, currentVolume === 0 ? 0.5 : 0)}
                className="text-slate-500 hover:text-indigo-400 transition-colors"
                title={currentVolume === 0 ? "Включить звук" : "Выключить звук"}
             >
                 {currentVolume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
             </button>
             <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={currentVolume}
                onChange={(e) => onVolumeChange(timer.id, parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                title={`Громкость: ${Math.round(currentVolume * 100)}%`}
             />
        </div>

        <div className="flex items-center justify-center gap-2">
          {!timer.isCompleted ? (
            <Button 
              variant={timer.isRunning ? "secondary" : "primary"}
              onClick={() => onToggle(timer.id)}
              icon={timer.isRunning ? <Pause size={18} /> : <Play size={18} />}
              className="flex-1"
            >
              {timer.isRunning ? 'Пауза' : 'Старт'}
            </Button>
          ) : (
             <Button 
              variant="primary"
              onClick={() => onReset(timer.id)}
              icon={<RotateCcw size={18} />}
              className="flex-1"
            >
              Сброс
            </Button>
          )}

          <Button 
            variant="secondary"
            onClick={() => onReset(timer.id)}
            disabled={timer.remainingTime === timer.totalDuration && !timer.isCompleted}
            title="Сбросить"
            className="w-10 px-0"
          >
            <RotateCcw size={18} />
          </Button>
          
          <Button 
            variant="danger"
            onClick={() => onDelete(timer.id)}
            title="Удалить"
            className="w-10 px-0"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
