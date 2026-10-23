import Countdown from "../components/Countdown";
import {
  convite,
  dataFesta,
  dataLonga,
  hora,
  linkWhatsapp,
} from "../config/convite";

export default function DetailsScene({ onReplay }: { onReplay: () => void }) {
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
            <small>{convite.endereco}</small>
          </li>
        </ul>

        <a className="btn" href={convite.mapsUrl} target="_blank" rel="noreferrer">
          COMO CHEGAR
        </a>
        <a className="btn green" href={linkWhatsapp()} target="_blank" rel="noreferrer">
          CONFIRMAR PRESENÇA
        </a>
        <button className="link" onClick={onReplay}>
          ↺ correr de novo
        </button>
      </div>
    </div>
  );
}
