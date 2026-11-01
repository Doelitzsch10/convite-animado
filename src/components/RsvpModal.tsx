import Modal from "./Modal";
import RsvpForm from "./RsvpForm";
import { rsvpAtivo } from "../lib/planilha";

// Pop-up de confirmação no mesmo estilo do "Como chegar": moldura dourada, fundo xadrez azul
export default function RsvpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal titulo="Confirmar presença" onClose={onClose} arte>
      <div className="rsvp-moldura">
        <div className="rsvp-topo">
          <h3>CONFIRMAR PRESENÇA</h3>
          <button className="rsvp-x" aria-label="Fechar" onClick={onClose}>
            ✕
          </button>
        </div>
        {rsvpAtivo ? (
          <RsvpForm onFechar={onClose} />
        ) : (
          <div className="rsvp-corpo">
            <div className="rsvp-painel">
              <p className="rsvp-texto">A confirmação de presença ainda não está disponível.</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
