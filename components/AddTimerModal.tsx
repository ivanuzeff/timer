import React, { useState } from 'react';
    import { X, Clock, Plus, Bell, Volume2, Play, Repeat } from 'lucide-react';
    import { Button } from './Button';
    import { SoundType } from '../types';
    import { playTimerSound, requestNotificationPermission, unlockAudioContext } from '../utils';
    
    interface AddTimerModalProps {
      isOpen: boolean;
      onClose: () => void;
      onAdd: (duration: number, label: string, sound: SoundType, useNotification: boolean, isLooping: boolean) => void;
    }
    
    export const AddTimerModal: React.FC<AddTimerModalProps> = ({ isOpen, onClose, onAdd }) => {
      const [label, setLabel] = useState('');
      const [hours, setHours] = useState(0);
      const [minutes, setMinutes] = useState(5);
      const [seconds, setSeconds] = useState(0);
      const [sound, setSound] = useState<SoundType>('beep');
      const [useNotification, setUseNotification] = useState(false);
      const [isLooping, setIsLooping] = useState(false);
    
      if (!isOpen) return null;
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        if (totalSeconds > 0) {
          onAdd(totalSeconds, label, sound, useNotification, isLooping);
          // Reset form
          setLabel('');
          setHours(0);
          setMinutes(5);
          setSeconds(0);
          setSound('beep');
          setUseNotification(false);
          setIsLooping(false);
          onClose();
        }
      };
    
      const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      };
    
      const handleNotificationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
          const granted = await requestNotificationPermission();
          if (granted) {
            setUseNotification(true);
          } else {
            setUseNotification(false);
            alert("Пожалуйста, разрешите уведомления в настройках браузера.");
          }
        } else {
          setUseNotification(false);
        }
      };

      const testNotification = () => {
        unlockAudioContext();
        if (useNotification) {
            new Notification("Тестовое уведомление", {
                body: "Если вы видите это, значит уведомления работают!",
                icon: '/favicon.ico'
            });
        }
      };
    
      const previewSound = (e: React.MouseEvent) => {
        e.preventDefault();
        unlockAudioContext(); // Explicit unlock on user interaction
        playTimerSound(sound);
      };
    
      return (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleBackdropClick}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
    
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Новый таймер</h2>
                <p className="text-slate-400 text-sm">Настройте параметры</p>
              </div>
            </div>
    
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Duration Inputs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 text-center uppercase tracking-wide">Часы</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-3 text-center text-xl font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 text-center uppercase tracking-wide">Минуты</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-3 text-center text-xl font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400 text-center uppercase tracking-wide">Секунды</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-3 text-center text-xl font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
    
              {/* Label Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Название</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Например: Интервал"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                />
              </div>
    
              {/* Settings Group */}
              <div className="grid grid-cols-1 gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                
                {/* Sound Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Volume2 size={16} /> Звуковой сигнал
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sound}
                      onChange={(e) => setSound(e.target.value as SoundType)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="beep">Короткий сигнал</option>
                      <option value="alarm">Будильник (Громко)</option>
                      <option value="digital">Цифровой</option>
                      <option value="cosmic">Космический (Долго)</option>
                    </select>
                    <button 
                      onClick={previewSound}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-indigo-400 transition-colors"
                      title="Прослушать"
                    >
                      <Play size={18} />
                    </button>
                  </div>
                </div>
    
                {/* Options */}
                <div className="space-y-3 mt-2">
                    {/* Notification Checkbox */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="notify"
                                    checked={useNotification}
                                    onChange={handleNotificationChange}
                                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                />
                            </div>
                            <label htmlFor="notify" className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-2">
                                <Bell size={16} /> Уведомления
                            </label>
                        </div>
                        {useNotification && (
                            <button type="button" onClick={testNotification} className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                                Тест
                            </button>
                        )}
                    </div>

                    {/* Loop Checkbox */}
                    <div className="flex items-center gap-3">
                         <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                id="loop"
                                checked={isLooping}
                                onChange={(e) => setIsLooping(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                        </div>
                        <label htmlFor="loop" className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-2">
                            <Repeat size={16} /> Автоповтор (цикл)
                        </label>
                    </div>
                </div>
              </div>
    
              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg" icon={<Plus size={20} />}>
                  Создать таймер
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    };