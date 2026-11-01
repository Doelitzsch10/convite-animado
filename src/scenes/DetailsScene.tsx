import { useState, type CSSProperties } from "react";
import Countdown, { useContagem } from "../components/Countdown";
import MapaModal from "../components/MapaModal";
import RsvpModal from "../components/RsvpModal";
import {
  convite,
  dataFesta,
  dataLonga,
  enderecoLimpo,
  hora,
} from "../config/convite";
import { assetUrl } from "../lib/assets";

// Posição (em % da imagem) dos quatro quadrados amarelos da arte, na ordem: dias, horas, min, seg
const QUADRADOS = [24.6, 38.4, 52.3, 66.2];

function Quadrado({ x, valor, rotulo }: { x: number; valor: number; rotulo: string }) {
  const texto = String(valor).padStart(2, "0");
  return (
    <div
      className={`capa-celula${texto.length > 2 ? " tres" : ""}`}
      style={{ left: `${x}%` } as CSSProperties}
    >
      <b>{texto}</b>
      <small>{rotulo}</small>
    </div>
  );
}

// Tela final em imagem: contagem nos quadrados e botões transparentes sobre a arte
function CapaFinal() {
  const [mapaAberto, setMapaAberto] = useState(false);
  const [rsvpAberto, setRsvpAberto] = useState(false);
  const t = useContagem(dataFesta());
  const capa = assetUrl(convite.capaFinalUrl);

  return (
    <div className="scene capa">
      <div className="capa-fundo" style={{ backgroundImage: `url(${capa})` }} aria-hidden />
      <div className="capa-moldura">
        <img
          className="capa-img"
          src={capa}
          alt={`${convite.nome} faz ${convite.idade} anos. ${dataLonga()}, às ${hora()}, em ${convite.local}, ${enderecoLimpo()}.`}
          draggable={false}
        />

        <Quadrado x={QUADRADOS[0]} valor={t.d} rotulo="DIAS" />
        <Quadrado x={QUADRADOS[1]} valor={t.h} rotulo="HORAS" />
        <Quadrado x={QUADRADOS[2]} valor={t.m} rotulo="MIN" />
        <Quadrado x={QUADRADOS[3]} valor={t.s} rotulo="SEG" />

        <button
          className="capa-hit capa-chegar"
          aria-label="Como chegar"
          onClick={() => setMapaAberto(true)}
        />

        <button
          className="capa-hit capa-confirmar"
          aria-label="Confirmar presença"
          onClick={() => setRsvpAberto(true)}
        />
      </div>

      {mapaAberto && <MapaModal onClose={() => setMapaAberto(false)} />}
      {rsvpAberto && <RsvpModal onClose={() => setRsvpAberto(false)} />}
    </div>
  );
}

export default function DetailsScene({ onReplay }: { onReplay: () => void }) {
  const [mapaAberto, setMapaAberto] = useState(false);
  const [rsvpAberto, setRsvpAberto] = useState(false);

  if (convite.capaFinalUrl) return <CapaFinal />;

  return (
    <div className="scene details">
      <div className="card">
        <p className="kicker">FASE COMPLETA!</p>
        <h2 className="title small">
          {convite.nome.toUpperCase()} FAZ {convite.idade} ANOS
        </h2>

        <Countdown target={dataFesta()} />

        <ul className="info">
          <li>
            <span>📅</span> {dataLonga()}
          </li>
          <li>
            <span>⏰</span> {hora()}
          </li>
          <li>
            <span>📍</span> {convite.local}
            <br />
            <small>{enderecoLimpo()}</small>
          </li>
        </ul>

        <button className="btn" onClick={() => setMapaAberto(true)}>
          📍 COMO CHEGAR
        </button>
        <button className="btn green" onClick={() => setRsvpAberto(true)}>
          CONFIRMAR PRESENÇA
        </button>
        <button className="link" onClick={onReplay}>
          ↺ correr de novo
        </button>
      </div>

      {mapaAberto && <MapaModal onClose={() => setMapaAberto(false)} />}
      {rsvpAberto && <RsvpModal onClose={() => setRsvpAberto(false)} />}
    </div>
  );
}
