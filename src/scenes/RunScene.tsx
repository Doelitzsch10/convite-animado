import { useEffect, useRef, useState } from "react";
import { startRunner } from "../game/runner";
import { convite, placasDaCorrida } from "../config/convite";

export default function RunScene({ onFinish }: { onFinish: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startRunner({
      canvas,
      signs: placasDaCorrida(),
      nome: convite.nome,
      idade: convite.idade,
      spriteUrl: convite.spriteUrl || undefined,
      onStar: setStars,
      onFinish: () => finishRef.current(),
    });
  }, []);

  return (
    <div className="scene run">
      <canvas ref={canvasRef} className="stage" />
      <div className="hud">★ {String(stars).padStart(3, "0")}</div>
      <button className="skip" onClick={onFinish}>
        PULAR ▶▶
      </button>
    </div>
  );
}
