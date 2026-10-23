import { convite } from "../config/convite";

export default function StartScene({ onStart }: { onStart: () => void }) {
  return (
    <div className="scene start" onClick={onStart}>
      <div className="speed-bg" aria-hidden />
      <p className="kicker">VOCÊ FOI CONVIDADO!</p>
      <h1 className="title">
        {convite.nome.toUpperCase()}
        <span>{convite.idade} ANOS</span>
      </h1>
      <button className="btn pulse" onClick={onStart}>
        PRESS START
      </button>
      <p className="hint">toque para correr até a festa</p>
    </div>
  );
}
