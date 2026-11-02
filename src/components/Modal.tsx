import { useEffect, useRef, type ReactNode } from "react";

// Pop-up genérico: fecha com ESC, clique fora ou no X, e trava a rolagem da página.
// Com `arte`, não desenha casca nem título: o conteúdo traz o visual e o próprio botão de fechar.
export default function Modal({
  titulo,
  onClose,
  children,
  arte = false,
}: {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  arte?: boolean;
}) {
  const fecharRef = useRef<HTMLButtonElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);

  // Sempre chama a versão mais recente de onClose sem refazer o efeito abaixo
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Roda só quando o pop-up abre. Antes dependia de onClose, que muda a cada renderização
  // do componente pai (ex.: a contagem regressiva atualiza todo segundo) e devolvia o foco
  // para a janela, tirando o cursor do campo de texto.
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (arte ? caixaRef.current : fecharRef.current)?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [arte]);

  if (arte) {
    return (
      <div className="modal-fundo modal-fundo-arte" onClick={onClose}>
        <div
          ref={caixaRef}
          className="modal-arte"
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }

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
