import { convidadoDoLink, convite } from "../config/convite";
import { assetUrl } from "../lib/assets";

export default function StartScene({ onStart }: { onStart: () => void }) {
  const convidado = convidadoDoLink();

  // Capa em imagem: o texto e o botão "PRESS START" já estão desenhados nela.
  // Um botão transparente fica por cima do desenho para receber o toque.
  if (convite.capaUrl) {
    const capa = assetUrl(convite.capaUrl);
    return (
      <div className="scene capa" onClick={onStart}>
        <div className="capa-fundo" style={{ backgroundImage: `url(${capa})` }} aria-hidden />
        <div className="capa-moldura">
          <img className="capa-img" src={capa} alt={`Convite: ${convite.nome} faz ${convite.idade} anos`} draggable={false} />
          {convidado && <p className="capa-convidado">PARA {convidado.nome.toUpperCase()}</p>}
          <button
            className="capa-start"
            aria-label="Começar o convite"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="scene start" onClick={onStart}>
      <div className="speed-bg" aria-hidden />
      <p className="kicker">
        {convidado ? `${convidado.nome.toUpperCase()}, VOCÊ FOI CONVIDADO!` : "VOCÊ FOI CONVIDADO!"}
      </p>
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
