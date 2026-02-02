import { Recording } from "@shared/schema";
import { PlayCircle, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface RecordingListProps {
  recordings: Recording[];
  onPlayRecording: (recording: Recording) => void;
  isPlaying: boolean;
  playingId?: number;
}

export function RecordingList({ recordings, onPlayRecording, isPlaying, playingId }: RecordingListProps) {
  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-white/10">
        <Music className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-display text-lg">No recordings yet</p>
        <p className="text-sm">Play something and save your masterpiece!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recordings.map((recording) => (
        <div 
          key={recording.id}
          className="group flex items-center justify-between p-4 bg-card rounded-xl border border-border/40 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 shadow-lg shadow-black/10"
        >
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-lg text-primary-foreground group-hover:text-primary transition-colors">
              {recording.title}
            </h3>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {(recording.notes as any[]).length} Notes • Recording #{recording.id}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPlayRecording(recording)}
            className="rounded-full w-12 h-12 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
          >
            {isPlaying && playingId === recording.id ? (
              <span className="flex gap-1 h-3 items-end">
                 <span className="w-1 bg-current animate-[bounce_1s_infinite] h-full"></span>
                 <span className="w-1 bg-current animate-[bounce_1.2s_infinite] h-2/3"></span>
                 <span className="w-1 bg-current animate-[bounce_0.8s_infinite] h-1/2"></span>
              </span>
            ) : (
              <PlayCircle className="w-6 h-6" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
