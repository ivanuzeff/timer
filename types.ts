export type SoundType = 'beep' | 'alarm' | 'digital' | 'cosmic';

export interface Timer {
  id: string;
  label: string;
  totalDuration: number; // in seconds
  remainingTime: number; // in seconds
  isRunning: boolean;
  isCompleted: boolean;
  createdAt: number;
  sound: SoundType;
  useNotification: boolean;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
