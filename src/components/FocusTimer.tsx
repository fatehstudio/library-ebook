'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, X, Volume2, BookOpen, Clock } from 'lucide-react';

export default function FocusTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'countdown' | 'countup'>('countdown'); // countdown = Pomodoro, countup = Apple Books Reading Goal
  const [isActive, setIsActive] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 }); // offset from default bottom-right
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDraggingRef = useRef(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const clickStartPos = useRef({ x: 0, y: 0 });

  // Countdown State
  const [countdownDuration, setCountdownDuration] = useState(25 * 60);
  const [countdownTimeLeft, setCountdownTimeLeft] = useState(25 * 60);
  const [inputMinutes, setInputMinutes] = useState('25');

  // Countup (Apple Books Daily Reading Goal) State
  const [dailyReadingTime, setDailyReadingTime] = useState(0); // in seconds
  const [dailyReadingGoal, setDailyReadingGoal] = useState(30 * 60); // 30 mins goal
  const [inputGoalMinutes, setInputGoalMinutes] = useState('30');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved configurations
  useEffect(() => {
    const savedCountdown = localStorage.getItem('focus-timer-duration');
    if (savedCountdown) {
      const minutes = parseInt(savedCountdown, 10);
      if (!isNaN(minutes) && minutes > 0) {
        setCountdownDuration(minutes * 60);
        setCountdownTimeLeft(minutes * 60);
        setInputMinutes(String(minutes));
      }
    }

    const savedGoal = localStorage.getItem('focus-reading-goal');
    if (savedGoal) {
      const minutes = parseInt(savedGoal, 10);
      if (!isNaN(minutes) && minutes > 0) {
        setDailyReadingGoal(minutes * 60);
        setInputGoalMinutes(String(minutes));
      }
    }

    // Load today's reading progress
    const todayStr = new Date().toDateString();
    const savedProgressDate = localStorage.getItem('focus-reading-date');
    if (savedProgressDate === todayStr) {
      const progress = localStorage.getItem('focus-reading-progress');
      if (progress) {
        const seconds = parseInt(progress, 10);
        if (!isNaN(seconds)) {
          setDailyReadingTime(seconds);
        }
      }
    } else {
      localStorage.setItem('focus-reading-date', todayStr);
      localStorage.setItem('focus-reading-progress', '0');
    }
  }, []);

  // Register Drag Event Listeners on Mount (Ref-based, smooth dragging)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      positionRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDraggingState(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      const newX = touch.clientX - dragStart.current.x;
      const newY = touch.clientY - dragStart.current.y;
      positionRef.current = { x: newX, y: newY };
      setPosition({ x: newX, y: newY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // Mouse drag trigger
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragStart.current = { x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y };
    clickStartPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseUpButton = (e: React.MouseEvent) => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
    const dist = Math.sqrt(
      Math.pow(e.clientX - clickStartPos.current.x, 2) +
      Math.pow(e.clientY - clickStartPos.current.y, 2)
    );
    if (dist < 6) {
      setIsOpen(true);
    }
  };

  // Touch drag trigger
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    isDraggingRef.current = true;
    setIsDraggingState(true);
    dragStart.current = { x: touch.clientX - positionRef.current.x, y: touch.clientY - positionRef.current.y };
    clickStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEndButton = (e: React.TouchEvent) => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dist = Math.sqrt(
      Math.pow(touch.clientX - clickStartPos.current.x, 2) +
      Math.pow(touch.clientY - clickStartPos.current.y, 2)
    );
    if (dist < 6) {
      setIsOpen(true);
    }
  };

  // Timer Tick Handler
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === 'countdown') {
          setCountdownTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimerFinish();
              return 0;
            }
            return prev - 1;
          });
        } else {
          // Countup mode (Apple Books style)
          setDailyReadingTime((prev) => {
            const nextProgress = prev + 1;
            // Persist progress to localStorage
            localStorage.setItem('focus-reading-progress', String(nextProgress));
            
            // Check if goal just reached
            if (nextProgress === dailyReadingGoal) {
              playAlertBeep();
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification("Reading Goal Reached! 📚🎉", {
                  body: `Congratulations, you've completed your daily reading goal of ${Math.round(dailyReadingGoal / 60)} minutes!`,
                });
              } else {
                alert(`Reading Goal Reached! 📚🎉 Congratulations, you've completed your daily reading goal of ${Math.round(dailyReadingGoal / 60)} minutes!`);
              }
            }
            return nextProgress;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, dailyReadingGoal]);

  const handleTimerFinish = () => {
    setIsActive(false);
    playAlertBeep();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification("Focus Session Finished! 🎉", {
        body: "Great job staying focused. Take a short break!",
      });
    } else {
      alert("Focus Session Finished! 🎉 Great job staying focused.");
    }
  };

  // Play beautiful chime sound sequence
  const playAlertBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNote = (freq: number, start: number, durationSec: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
        
        osc.start(start);
        osc.stop(start + durationSec);
      };

      const now = ctx.currentTime;
      if (mode === 'countdown') {
        playNote(523.25, now, 0.4); // C5
        playNote(659.25, now + 0.15, 0.4); // E5
        playNote(783.99, now + 0.3, 0.6); // G5
      } else {
        playNote(523.25, now, 0.3); // C5
        playNote(587.33, now + 0.1, 0.3); // D5
        playNote(659.25, now + 0.2, 0.3); // E5
        playNote(783.99, now + 0.3, 0.3); // G5
        playNote(880.00, now + 0.4, 0.3); // A5
        playNote(987.77, now + 0.5, 0.5); // B5
        playNote(1046.50, now + 0.65, 0.8); // C6
      }
    } catch (e) {
      console.error('Failed to play alert sound:', e);
    }
  };

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'countdown') {
      setCountdownTimeLeft(countdownDuration);
    } else {
      setDailyReadingTime(0);
      localStorage.setItem('focus-reading-progress', '0');
    }
  };

  const handleCountdownConfigChange = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(inputMinutes, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      const seconds = minutes * 60;
      setCountdownDuration(seconds);
      setCountdownTimeLeft(seconds);
      setIsActive(false);
      localStorage.setItem('focus-timer-duration', String(minutes));
    }
  };

  const handleGoalConfigChange = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(inputGoalMinutes, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 300) {
      setDailyReadingGoal(minutes * 60);
      setIsActive(false);
      localStorage.setItem('focus-reading-goal', String(minutes));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress Calculations
  const progressPercent = mode === 'countdown'
    ? (countdownDuration > 0 ? (countdownTimeLeft / countdownDuration) * 100 : 0)
    : (dailyReadingGoal > 0 ? Math.min((dailyReadingTime / dailyReadingGoal) * 100, 100) : 0);

  // SVG ring stroke calculations
  const strokeDashoffset = 2 * Math.PI * 36 * (progressPercent / 100);
  const miniStrokeDashoffset = 2 * Math.PI * 21 * (progressPercent / 100);

  return (
    <>
      {/* Full-screen transparent overlay to prevent iframe from swallowing mousemove events during drag */}
      {isDraggingState && (
        <div className="fixed inset-0 z-50 bg-transparent cursor-grabbing" />
      )}

      <div 
        className="fixed z-55 select-none touch-none"
        style={{
          bottom: '24px',
          right: '24px',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDraggingState ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        {/* Minimize State Floating Action Button (Apple Books Circle Ring) */}
        {!isOpen && (
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpButton}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEndButton}
          onTouchMove={(e) => {
            if (isDraggingState) e.preventDefault();
          }}
          onDragStart={(e) => e.preventDefault()}
          draggable="false"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-card border border-border-custom hover:border-[hsl(174,75%,45%)]/40 shadow-lg cursor-grab active:cursor-grabbing relative group"
        >
          {/* Progress Ring Overlay (Turquoise Theme) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-foreground/5 fill-none"
                strokeWidth="2.5"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-[hsl(174,75%,45%)] fill-none transition-all duration-300"
                strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 - miniStrokeDashoffset}`}
                strokeLinecap="round"
              />
            </svg>
          </div>

          <Timer className="w-5 h-5 text-[hsl(174,75%,45%)] relative z-10" />

          {isActive && (
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(174,75%,45%)] animate-ping" />
          )}
          {isActive && (
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(174,75%,45%)] border border-card" />
          )}
          
          {/* Tooltip */}
          <span className="absolute right-14 bg-card border border-border-custom px-2.5 py-1.5 rounded-lg text-[10px] text-foreground font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none whitespace-nowrap">
            {mode === 'countdown' 
              ? (isActive ? `${formatTime(countdownTimeLeft)} Left` : 'Pomodoro')
              : `${Math.round(dailyReadingTime / 60)}m / ${Math.round(dailyReadingGoal / 60)}m`
            }
          </span>
        </button>
      )}

      {/* Expanded Glassmorphic Focus Timer Controller */}
      {isOpen && (
        <div className="w-72 bg-card/90 backdrop-blur-xl border border-border-custom/60 rounded-3xl p-5 shadow-2xl animate-fade-in text-foreground relative overflow-hidden">
          {/* Turquoise background glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[hsl(174,75%,45%)]/10 blur-xl pointer-events-none" />

          {/* Mode Switch segment control (Countdown vs Apple Books Goal) */}
          <div className="flex bg-foreground/5 p-1 rounded-2xl mb-4 relative z-10 border border-border-custom/50 text-[10px] font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                setMode('countdown');
                setIsActive(false);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'countdown'
                  ? 'bg-card text-[hsl(174,75%,45%)] shadow-sm border border-border-custom/35'
                  : 'text-muted-custom hover:text-foreground'
              }`}
            >
              <Timer className="w-3.5 h-3.5" /> Countdown
            </button>
            <button
              onClick={() => {
                setMode('countup');
                setIsActive(false);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mode === 'countup'
                  ? 'bg-card text-[hsl(174,75%,45%)] shadow-sm border border-border-custom/35'
                  : 'text-muted-custom hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Reading Goal
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-custom" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-custom">
                {mode === 'countdown' ? 'Focus Session' : "Today's Reading"}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clock Widget Display */}
          <div className="flex flex-col items-center justify-center my-3 relative z-10">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* SVG circular countdown progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="36"
                  className="stroke-foreground/5 fill-none"
                  strokeWidth="4.5"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="36"
                  className="stroke-[hsl(174,75%,45%)] fill-none transition-all duration-300"
                  strokeWidth="4.5"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 - strokeDashoffset}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Digital Time Center */}
              <div className="absolute flex flex-col items-center justify-center font-serif">
                <span className="text-3xl font-mono font-bold tracking-tight text-foreground">
                  {mode === 'countdown' 
                    ? formatTime(countdownTimeLeft) 
                    : formatTime(dailyReadingTime)
                  }
                </span>
                <span className="text-[8px] uppercase tracking-widest font-bold mt-1 text-[hsl(174,75%,45%)]">
                  {mode === 'countdown' 
                    ? (isActive ? 'Focusing' : 'Paused')
                    : `Goal: ${Math.round(dailyReadingGoal / 60)} min`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-center gap-3 mb-5 relative z-10">
            <button
              onClick={handleReset}
              className="p-2.5 bg-foreground/5 hover:bg-foreground/10 text-muted-custom hover:text-foreground rounded-2xl transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggle}
              className={`p-4 rounded-3xl transition-all shadow-md cursor-pointer bg-[hsl(174,75%,45%)] text-background hover:opacity-90`}
              title={isActive ? 'Pause' : 'Start'}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={playAlertBeep}
              className="p-2.5 bg-foreground/5 hover:bg-foreground/10 text-muted-custom hover:text-foreground rounded-2xl transition-all cursor-pointer"
              title="Test Sound Alert"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Configuration Form */}
          <div className="border-t border-border-custom/50 pt-4 mt-2 relative z-10">
            {mode === 'countdown' ? (
              <form onSubmit={handleCountdownConfigChange} className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-muted-custom">
                    Countdown (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-background/50 border border-border-custom rounded-xl text-xs focus:outline-none focus:border-[hsl(174,75%,45%)]/40 text-foreground text-center font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-[hsl(174,75%,45%)]/10 hover:bg-[hsl(174,75%,45%)]/25 border border-[hsl(174,75%,45%)]/20 text-[hsl(174,75%,45%)] rounded-xl text-xs font-bold transition-all cursor-pointer self-end mb-0.5"
                >
                  Apply
                </button>
              </form>
            ) : (
              <form onSubmit={handleGoalConfigChange} className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-muted-custom">
                    Daily Goal (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={inputGoalMinutes}
                    onChange={(e) => setInputGoalMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-background/50 border border-border-custom rounded-xl text-xs focus:outline-none focus:border-[hsl(174,75%,45%)]/40 text-foreground text-center font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-[hsl(174,75%,45%)]/10 hover:bg-[hsl(174,75%,45%)]/25 border border-[hsl(174,75%,45%)]/20 text-[hsl(174,75%,45%)] rounded-xl text-xs font-bold transition-all cursor-pointer self-end mb-0.5"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
