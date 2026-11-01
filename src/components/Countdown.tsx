import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    over: ms === 0,
  };
}

// Contagem regressiva que se atualiza a cada segundo.
// Depende do valor numérico da data (e não do objeto Date, que muda a cada renderização).
export function useContagem(target: Date) {
  const alvo = target.getTime();
  const [t, setT] = useState(() => diff(new Date(alvo)));
  useEffect(() => {
    const alvoData = new Date(alvo);
    setT(diff(alvoData));
    const id = setInterval(() => setT(diff(alvoData)), 1000);
    return () => clearInterval(id);
  }, [alvo]);
  return t;
}

export default function Countdown({ target }: { target: Date }) {
  const t = useContagem(target);

  if (t.over) return <p className="countdown-over">A FESTA COMEÇOU! 🎉</p>;

  const cell = (v: number, label: string) => (
    <div className="cd-cell">
      <b>{String(v).padStart(2, "0")}</b>
      <small>{label}</small>
    </div>
  );

  return (
    <div className="countdown">
      {cell(t.d, "DIAS")}
      {cell(t.h, "HORAS")}
      {cell(t.m, "MIN")}
      {cell(t.s, "SEG")}
    </div>
  );
}
