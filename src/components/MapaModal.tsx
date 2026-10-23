import { useEffect, useRef, useState } from "react";
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
  const fecharRef = useRef<HTMLButtonElement>(null);
  const [copiado, setCopiado] = useState<"idle" | "ok" | "erro">("idle");
  const [mapaCarregado, setMapaCarregado] = useState(false);

  useEffect(() => {
    // trava a rolagem da página, fecha com ESC e põe o foco no botão de fechar
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [onClose]);

  const copiarEndereco = async () => {
    const ok = await copiar(`${convite.local} - ${enderecoLimpo()}`);
    setCopiado(ok ? "ok" : "erro");
    setTimeout(() => setCopiado("idle"), 2500);
  };

  return (
    <div className="modal-fundo" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-topo">
          <h3 id="modal-titulo">COMO CHEGAR</h3>
          <button ref={fecharRef} className="modal-x" aria-label="Fechar" onClick={onClose}>
            ✕
          </button>
        </div>

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
      </div>
    </div>
  );
}
