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
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);

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

  const alternar = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.muted = muted;
      void v.play().then(() => setPrecisaToque(false)).catch(() => {});
    } else {
      v.pause();
    }
  };

  const reiniciar = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = muted;
    void v.play().catch(() => {});
  };

  // Toque/arraste na barra para avançar ou voltar
  const buscar = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = ref.current;
    if (!v || !v.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    v.currentTime = frac * v.duration;
    setProgresso(frac);
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
        onClick={alternar}
        onPlay={() => setPausado(false)}
        onPause={() => setPausado(!ref.current?.ended)}
        onTimeUpdate={() => {
          const v = ref.current;
          if (v && v.duration) setProgresso(v.currentTime / v.duration);
        }}
        onEnded={onFinish}
        onError={onError}
      />

      {pausado && !precisaToque && (
        <button className="video-pausa" aria-label="Continuar" onClick={alternar}>
          ▶
        </button>
      )}

      {precisaToque && (
        <button className="video-toque" onClick={alternar}>
          ▶ TOQUE PARA ASSISTIR
        </button>
      )}

      <div className="video-barra" onPointerDown={buscar} aria-label="Progresso do vídeo">
        <div className="video-barra-cheia" style={{ width: `${progresso * 100}%` }} />
      </div>

      <div className="video-controles">
        <button aria-label={pausado ? "Continuar" : "Pausar"} onClick={alternar}>
          {pausado ? "▶" : "❚❚"}
        </button>
        <button aria-label="Ver de novo desde o início" onClick={reiniciar}>
          ↺
        </button>
      </div>

      <button className="skip" onClick={onFinish}>
        PULAR ▶▶
      </button>
    </div>
  );
}
