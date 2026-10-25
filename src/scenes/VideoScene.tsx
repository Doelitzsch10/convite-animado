import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  poster?: string;
  muted: boolean;
  onFinish: () => void;
  onError: () => void;
}

export default function VideoScene({ src, poster, muted, onFinish, onError }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [precisaToque, setPrecisaToque] = useState(false);

  // O toque em "PRESS START" libera o som. Se mesmo assim o navegador bloquear,
  // tentamos sem som e pedimos um toque para ligar.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {
      v.muted = true;
      v.play().then(() => setPrecisaToque(!muted)).catch(() => setPrecisaToque(true));
    });
  }, [muted]);

  const tocar = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
    v.play().then(() => setPrecisaToque(false)).catch(() => {});
  };

  return (
    <div className="scene run">
      <video
        ref={ref}
        className="stage video"
        src={src}
        poster={poster}
        playsInline
        preload="auto"
        onEnded={onFinish}
        onError={onError}
      />
      {precisaToque && (
        <button className="video-toque" onClick={tocar}>
          ▶ TOQUE PARA ASSISTIR
        </button>
      )}
      <button className="skip" onClick={onFinish}>
        PULAR ▶▶
      </button>
    </div>
  );
}
