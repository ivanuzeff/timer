export type SoundType = 'beep' | 'alarm' | 'digital' | 'cosmic';

export interface Timer {
  id: string;
  label: string;
  totalDuration: number; // in seconds
  remainingTime: number; // in seconds
  isRunning: boolean;
  isCompleted: boolean;
  isLooping: boolean; // Auto-restart when finished
  createdAt: number;
  sound: SoundType;
  useNotification: boolean;
  volume: number; // 0.0 to 1.0
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';