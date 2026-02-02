import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { Key } from './Key';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// 16 Keys: C4 to E5
const KEYS = [
  { note: 'C4', type: 'white', key: 'z' },
  { note: 'C#4', type: 'black', key: 's' },
  { note: 'D4', type: 'white', key: 'x' },
  { note: 'D#4', type: 'black', key: 'd' },
  { note: 'E4', type: 'white', key: 'c' },
  { note: 'F4', type: 'white', key: 'v' },
  { note: 'F#4', type: 'black', key: 'g' },
  { note: 'G4', type: 'white', key: 'b' },
  { note: 'G#4', type: 'black', key: 'h' },
  { note: 'A4', type: 'white', key: 'n' },
  { note: 'A#4', type: 'black', key: 'j' },
  { note: 'B4', type: 'white', key: 'm' },
  { note: 'C5', type: 'white', key: ',' },
  { note: 'C#5', type: 'black', key: 'l' },
  { note: 'D5', type: 'white', key: '.' },
  { note: 'D#5', type: 'black', key: ';' },
  { note: 'E5', type: 'white', key: '/' },
];

interface PianoProps {
  onNotePlay?: (note: string) => void;
  onNoteStop?: (note: string) => void;
  className?: string;
}

export function Piano({ onNotePlay, onNoteStop, className }: PianoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const samplerRef = useRef<Tone.Sampler | null>(null);

  // Initialize Tone.js Sampler with high-quality piano samples
  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsLoaded(true);
        console.log("Piano samples loaded");
      }
    }).toDestination();

    samplerRef.current = sampler;

    return () => {
      sampler.dispose();
    };
  }, []);

  const playNote = (note: string) => {
    if (!isLoaded || isMuted) return;
    
    // Ensure AudioContext is started (browser requirement)
    if (Tone.context.state !== 'running') {
      Tone.start();
    }

    if (!activeKeys.has(note)) {
      samplerRef.current?.triggerAttack(note);
      setActiveKeys(prev => new Set(prev).add(note));
      onNotePlay?.(note);
    }
  };

  const stopNote = (note: string) => {
    if (!isLoaded) return;
    samplerRef.current?.triggerRelease(note);
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    onNoteStop?.(note);
  };

  // Keyboard mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyMap = KEYS.find(k => k.key === e.key.toLowerCase());
      if (keyMap) playNote(keyMap.note);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap = KEYS.find(k => k.key === e.key.toLowerCase());
      if (keyMap) stopNote(keyMap.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLoaded, isMuted, activeKeys]); // Added dependencies to ensure state is fresh

  return (
    <div className={cn("relative p-4 rounded-xl bg-[#2a1a10] shadow-2xl border-t-8 border-[#3a2a20] wood-texture", className)}>
      {/* Red Felt Strip */}
      <div className="h-4 w-full bg-[#800] mb-0 shadow-inner border-b border-black/50 absolute top-0 left-0 right-0 z-0 mt-4 mx-4 w-[calc(100%-2rem)] rounded-t-sm" />

      {/* Controls */}
      <div className="absolute -top-16 right-0 flex gap-2">
         <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="bg-card/50 backdrop-blur border-primary/20 hover:bg-primary/20 text-primary"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Loading State Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl text-white">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="font-display text-sm">Loading samples...</p>
        </div>
      )}

      {/* Piano Bed */}
      <div className="relative z-10 flex justify-center items-start pt-4 pb-2 px-2 bg-black/20 rounded-b-lg">
        {KEYS.map((k) => (
          <Key
            key={k.note}
            note={k.note}
            isBlack={k.type === 'black'}
            isPressed={activeKeys.has(k.note)}
            label={k.key}
            onMouseDown={() => playNote(k.note)}
            onMouseUp={() => stopNote(k.note)}
          />
        ))}
      </div>
      
      {/* Brand Label */}
      <div className="text-center mt-4 mb-1">
         <span className="font-display text-primary/40 text-sm tracking-widest uppercase font-bold text-shadow">Grand Virtuoso</span>
      </div>
    </div>
  );
}
