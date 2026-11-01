import { useEffect, useRef, type ReactNode } from "react";

// Pop-up genérico: fecha com ESC, clique fora ou no X, e trava a rolagem da página.
export default function Modal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
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
          <h3 id="modal-titulo">{titulo}</h3>
          <button ref={fecharRef} className="modal-x" aria-label="Fechar" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
