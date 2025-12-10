import { SoundType } from './types';

// Format seconds into HH:MM:SS
export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Web Audio API Context
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // Standard and Webkit (iOS) AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

// Fix for iOS: Function to unlock audio context on first user interaction
export const unlockAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  // Play a tiny silent buffer to "warm up" the iOS audio engine
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};

// Sound Generators
const playBeep = (ctx: AudioContext, time: number, volume: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, time);
  osc.frequency.exponentialRampToValueAtTime(1046.5, time + 0.1);
  
  // Base gain 0.5 scaled by volume
  const peak = 0.5 * volume;
  gain.gain.setValueAtTime(peak, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  osc.start(time);
  osc.stop(time + 0.5);
};

const playAlarm = (ctx: AudioContext, time: number, volume: number) => {
  // Classic Alarm Clock style (Beep-Beep-Beep-Beep)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'square';
  osc.frequency.setValueAtTime(880, time);

  // Pulsing gain
  const now = time;
  const peak = 0.3 * volume;
  
  for (let i = 0; i < 4; i++) {
    const start = now + i * 0.2;
    gain.gain.setValueAtTime(peak, start);
    gain.gain.setValueAtTime(peak, start + 0.1);
    gain.gain.setValueAtTime(0, start + 0.15);
  }

  osc.start(time);
  osc.stop(time + 1.5);
};

const playDigital = (ctx: AudioContext, time: number, volume: number) => {
  // High pitched digital sequence
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sawtooth';
  
  // Arpeggio
  osc.frequency.setValueAtTime(1200, time);
  osc.frequency.setValueAtTime(1600, time + 0.1);
  osc.frequency.setValueAtTime(2000, time + 0.2);
  
  const peak = 0.2 * volume;
  gain.gain.setValueAtTime(peak, time);
  gain.gain.linearRampToValueAtTime(0, time + 0.4);

  osc.start(time);
  osc.stop(time + 0.4);
};

const playCosmic = (ctx: AudioContext, time: number, volume: number) => {
  // Long sweep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, time);
  osc.frequency.exponentialRampToValueAtTime(800, time + 1);
  osc.frequency.exponentialRampToValueAtTime(200, time + 2);
  
  const peak = 0.4 * volume;
  gain.gain.setValueAtTime(peak, time);
  gain.gain.linearRampToValueAtTime(peak, time + 1.5);
  gain.gain.linearRampToValueAtTime(0, time + 2);

  osc.start(time);
  osc.stop(time + 2);
};

export const playTimerSound = (type: SoundType, volume: number = 0.5) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Ensure context is running (fixes some mobile issues if unlocked but suspended)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  switch (type) {
    case 'alarm':
      // Repeat the alarm pattern 3 times
      playAlarm(ctx, now, volume);
      playAlarm(ctx, now + 1.6, volume);
      playAlarm(ctx, now + 3.2, volume);
      break;
    case 'digital':
      // Repeat quickly
      playDigital(ctx, now, volume);
      playDigital(ctx, now + 0.5, volume);
      playDigital(ctx, now + 1.0, volume);
      playDigital(ctx, now + 1.5, volume);
      break;
    case 'cosmic':
      playCosmic(ctx, now, volume);
      break;
    case 'beep':
    default:
      playBeep(ctx, now, volume);
      // Double beep
      setTimeout(() => {
          if (audioContext) playBeep(audioContext, audioContext.currentTime, volume);
      }, 200);
      break;
  }
};

// Browser Notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const sendBrowserNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico', // Fallback or standard icon
      tag: 'timer-finished', // Prevent stacking too many
      requireInteraction: true // Keep it visible until clicked
    });
  }
};

// Web Worker Script for Background Timer
// We use a Blob to create an inline worker without needing an external file
export const timerWorkerScript = `
  let intervalId;
  self.onmessage = function(e) {
    if (e.data === 'start') {
      if (!intervalId) {
        intervalId = setInterval(() => {
          self.postMessage('tick');
        }, 100);
      }
    } else if (e.data === 'stop') {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
`;