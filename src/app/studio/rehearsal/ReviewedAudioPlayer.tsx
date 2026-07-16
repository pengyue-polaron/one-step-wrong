import { Volume2 } from "lucide-react";

export function ReviewedAudioPlayer({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <div className="reviewed-audio">
      <span><Volume2 size={13} />Voice note</span>
      <audio aria-label={label} controls preload="metadata" src={src}>
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
