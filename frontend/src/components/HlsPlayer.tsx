import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface BunnyPlayerProps {
  src: string; // din playlist.m3u8
}

export const VideoPlayer = ({ src }: BunnyPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari har inbyggt HLS-stöd
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-auto"
      style={{ maxHeight: "70vh" }}
    />
  );
};
