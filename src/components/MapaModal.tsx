import { useState } from "react";
import Modal from "./Modal";
import { assetUrl } from "../lib/assets";
import {
  convite,
  enderecoLimpo,
  linkAppleMaps,
  linkGoogleMaps,
  linkWaze,
  mapaEmbutidoUrl,
} from "../config/convite";

async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // alternativa para navegadores sem permissão de área de transferência
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.style.position = "fixed";
    campo.style.opacity = "0";
    document.body.appendChild(campo);
    campo.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(campo);
    return ok;
  }
}

export default function MapaModal({ onClose }: { onClose: () => void }) {
  return convite.mapaArteUrl ? <MapaArte onClose={onClose} /> : <MapaSimples onClose={onClose} />;
}

// Zoom do mapa: cada passo muda a área mostrada pela metade (nível 0 = padrão)
const NIVEL_MIN = -2;
const NIVEL_MAX = 3;

function useCopiar() {
  const [copiado, setCopiado] = useState<"idle" | "ok" | "erro">("idle");
  const copiarEndereco = async () => {
    const ok = await copiar(`${convite.local} - ${enderecoLimpo()}`);
    setCopiado(ok ? "ok" : "erro");
    setTimeout(() => setCopiado("idle"), 2500);
  };
  return { copiado, copiarEndereco };
}

// Pop-up com a arte como moldura: janela do mapa, botão de fechar, +/− e 4 botões na imagem
function MapaArte({ onClose }: { onClose: () => void }) {
  const { copiado, copiarEndereco } = useCopiar();
  const [nivel, setNivel] = useState(0);
  const [mapaCarregado, setMapaCarregado] = useState(false);

  const zoom = (delta: number) => {
    const novo = Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, nivel + delta));
    if (novo === nivel) return;
    setMapaCarregado(false);
    setNivel(novo);
  };

  return (
    <Modal titulo="Como chegar" onClose={onClose} arte>
      <div className="mapa-arte">
        <img
          className="mapa-arte-img"
          src={assetUrl(convite.mapaArteUrl)}
          alt={`Como chegar: ${convite.local}, ${enderecoLimpo()}`}
          draggable={false}
        />

        <div className="mapa-arte-janela">
          {!mapaCarregado && <span className="mapa-carregando mapa-arte-carregando">CARREGANDO MAPA...</span>}
          <iframe
            key={nivel}
            className="mapa"
            title={`Mapa: ${convite.local}`}
            src={mapaEmbutidoUrl(Math.pow(0.5, nivel))}
            loading="lazy"
            onLoad={() => setMapaCarregado(true)}
          />
        </div>

        <button className="arte-hit arte-x" aria-label="Fechar" onClick={onClose} />
        <button className="arte-hit arte-zoom arte-mais" aria-label="Aproximar o mapa" onClick={() => zoom(1)}>
          +
        </button>
        <button className="arte-hit arte-zoom arte-menos" aria-label="Afastar o mapa" onClick={() => zoom(-1)}>
          −
        </button>

        <a
          className="arte-hit arte-google"
          aria-label="Abrir no Google Maps"
          href={linkGoogleMaps()}
          target="_blank"
          rel="noreferrer"
        />
        <a
          className="arte-hit arte-waze"
          aria-label="Abrir no Waze"
          href={linkWaze()}
          target="_blank"
          rel="noreferrer"
        />
        <a
          className="arte-hit arte-apple"
          aria-label="Abrir no Apple Maps"
          href={linkAppleMaps()}
          target="_blank"
          rel="noreferrer"
        />
        <button className="arte-hit arte-copiar" aria-label="Copiar endereço" onClick={copiarEndereco} />

        {copiado !== "idle" && (
          <div className="arte-aviso" role="status">
            {copiado === "ok" ? "COPIADO! ✔" : "NÃO COPIOU"}
          </div>
        )}
      </div>
    </Modal>
  );
}

// Pop-up simples feito em código (usado quando mapaArteUrl está vazio)
function MapaSimples({ onClose }: { onClose: () => void }) {
  const { copiado, copiarEndereco } = useCopiar();
  const [mapaCarregado, setMapaCarregado] = useState(false);

  return (
    <Modal titulo="COMO CHEGAR" onClose={onClose}>
      <div className="mapa-caixa">
        {!mapaCarregado && <span className="mapa-carregando">CARREGANDO MAPA...</span>}
        <iframe
          className="mapa"
          title={`Mapa: ${convite.local}`}
          src={mapaEmbutidoUrl()}
          loading="lazy"
          onLoad={() => setMapaCarregado(true)}
        />
      </div>

      <p className="modal-local">
        <b>{convite.local}</b>
        <br />
        <span>{enderecoLimpo()}</span>
      </p>

      <div className="modal-botoes">
        <a className="btn" href={linkGoogleMaps()} target="_blank" rel="noreferrer">
          GOOGLE MAPS
        </a>
        <a className="btn blue" href={linkWaze()} target="_blank" rel="noreferrer">
          WAZE
        </a>
        <a className="btn gray" href={linkAppleMaps()} target="_blank" rel="noreferrer">
          APPLE MAPS
        </a>
        <button className="btn yellow" onClick={copiarEndereco}>
          {copiado === "ok"
            ? "COPIADO! ✔"
            : copiado === "erro"
              ? "NÃO COPIOU"
              : "COPIAR ENDEREÇO"}
        </button>
      </div>
    </Modal>
  );
}
