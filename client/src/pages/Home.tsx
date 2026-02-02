import React, { useState, useRef } from 'react';
import { Piano } from '@/components/Piano';
import { useRecordings, useCreateRecording } from '@/hooks/use-recordings';
import { RecordingList } from '@/components/RecordingList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Disc, StopCircle, Save, Mic2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@shared/schema';

// Types for recording
interface RecordedNote {
  note: string;
  time: number; // Time relative to start
  duration: number;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<RecordedNote[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [activeNotes, setActiveNotes] = useState<Map<string, number>>(new Map()); // Note -> startTime
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playingId, setPlayingId] = useState<number | undefined>();
  const [recordingName, setRecordingName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Use refs for playback to avoid re-renders interrupting loops
  const playbackRef = useRef<NodeJS.Timeout[]>([]);

  // API Hooks
  const { data: recordings, isLoading: isLoadingRecordings } = useRecordings();
  const createRecording = useCreateRecording();
  const { toast } = useToast();

  // Handlers
  const handleNotePlay = (note: string) => {
    if (isRecording) {
      setActiveNotes(prev => new Map(prev).set(note, Date.now()));
    }
  };

  const handleNoteStop = (note: string) => {
    if (isRecording) {
      const start = activeNotes.get(note);
      if (start) {
        const duration = Date.now() - start;
        const time = start - startTime;
        
        setCurrentRecording(prev => [...prev, { note, time, duration }]);
        setActiveNotes(prev => {
          const next = new Map(prev);
          next.delete(note);
          return next;
        });
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setStartTime(Date.now());
    setCurrentRecording([]);
    setActiveNotes(new Map());
    toast({ title: "Recording Started", description: "Play your melody now!" });
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Add any currently held notes
    const now = Date.now();
    const finalNotes: RecordedNote[] = [];
    
    activeNotes.forEach((start, note) => {
      finalNotes.push({
        note,
        time: start - startTime,
        duration: now - start
      });
    });

    const fullRecording = [...currentRecording, ...finalNotes];
    setCurrentRecording(fullRecording);
    
    if (fullRecording.length > 0) {
      setIsSaveDialogOpen(true);
    } else {
      toast({ title: "Empty Recording", description: "You didn't play any notes.", variant: "destructive" });
    }
  };

  const saveRecording = async () => {
    if (!recordingName.trim()) return;
    
    try {
      await createRecording.mutateAsync({
        title: recordingName,
        notes: currentRecording,
      });
      
      setIsSaveDialogOpen(false);
      setRecordingName("");
      toast({ title: "Saved!", description: "Your masterpiece has been saved." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save recording.", variant: "destructive" });
    }
  };

  const playRecording = (recording: Recording) => {
    // Stop current playback
    playbackRef.current.forEach(clearTimeout);
    playbackRef.current = [];
    
    setIsPlayingBack(true);
    setPlayingId(recording.id);

    const notes = recording.notes as RecordedNote[];
    
    // Simple playback visualization (we can't trigger audio directly on Piano component easily without ref forwarding, 
    // so we'll just simulate the timing for now or ideally lift state up. 
    // For this implementation, we'll just show the UI state and let the user know playback is "simulated" visually if we don't connect audio.
    // To connect audio, we'd need to expose a play method on Piano ref.
    
    // NOTE: In a real app, I would forwardRef the Piano component to access playNote/stopNote externally.
    // For this scoped task, I will assume the Piano component plays its own sounds, and playback 
    // here is mainly for managing the "Playing" state UI.
    // Ideally, we'd trigger the actual sounds here.
    
    // Let's implement actual sound triggering by dispatching keyboard events! 
    // This is a hacky but effective way to trigger the Piano component's internal listeners without refactoring heavily.
    
    const keyMap: Record<string, string> = {
      'C4': 'z', 'C#4': 's', 'D4': 'x', 'D#4': 'd', 'E4': 'c', 'F4': 'v',
      'F#4': 'g', 'G4': 'b', 'G#4': 'h', 'A4': 'n', 'A#4': 'j', 'B4': 'm',
      'C5': ',', 'C#5': 'l', 'D5': '.', 'D#5': ';', 'E5': '/'
    };

    const maxTime = Math.max(...notes.map(n => n.time + n.duration));

    notes.forEach(note => {
      const key = keyMap[note.note];
      if (!key) return;

      // Schedule Note On
      const startTimer = setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }));
      }, note.time);
      
      // Schedule Note Off
      const stopTimer = setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key }));
      }, note.time + note.duration);

      playbackRef.current.push(startTimer, stopTimer);
    });

    // Reset state after finish
    const endTimer = setTimeout(() => {
      setIsPlayingBack(false);
      setPlayingId(undefined);
    }, maxTime + 500);
    playbackRef.current.push(endTimer);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary drop-shadow-md">
            Virtuoso
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A realistic 16-key grand piano experience right in your browser. Play, record, and share your melodies.
          </p>
        </div>

        {/* Main Piano Area */}
        <div className="flex flex-col items-center space-y-8">
          <Piano 
            onNotePlay={handleNotePlay} 
            onNoteStop={handleNoteStop}
            className="w-full max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform duration-500"
          />

          {/* Recording Controls */}
          <div className="flex items-center gap-4 bg-card p-2 rounded-full border border-white/5 shadow-xl">
             {!isRecording ? (
               <Button 
                 size="lg" 
                 onClick={startRecording}
                 className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-900/20 px-8"
               >
                 <Mic2 className="mr-2 h-5 w-5" />
                 Start Recording
               </Button>
             ) : (
               <Button 
                 size="lg" 
                 onClick={stopRecording}
                 className="rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold shadow-lg px-8 animate-pulse border border-red-500/50"
               >
                 <StopCircle className="mr-2 h-5 w-5 text-red-500" />
                 Stop Recording
               </Button>
             )}
          </div>
        </div>

        {/* Library Section */}
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-white/5 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display text-primary">Your Recordings</h2>
            <Disc className="w-6 h-6 text-primary/50 animate-[spin_10s_linear_infinite]" />
          </div>

          {isLoadingRecordings ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <RecordingList 
              recordings={recordings || []} 
              onPlayRecording={playRecording}
              isPlaying={isPlayingBack}
              playingId={playingId}
            />
          )}
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">Save Masterpiece</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Title</label>
               <Input 
                 placeholder="Concerto No. 5 in C Major..." 
                 value={recordingName}
                 onChange={(e) => setRecordingName(e.target.value)}
                 className="bg-black/20 border-white/10 focus:border-primary/50 text-lg"
                 autoFocus
               />
             </div>
             <div className="text-sm text-muted-foreground">
                Recorded {currentRecording.length} notes over {((currentRecording[currentRecording.length-1]?.time + currentRecording[currentRecording.length-1]?.duration) / 1000).toFixed(1)} seconds.
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>Discard</Button>
            <Button onClick={saveRecording} disabled={createRecording.isPending || !recordingName}>
              {createRecording.isPending ? "Saving..." : "Save to Library"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
