import { useRef, useState, type FormEvent } from "react";
import { convidadoDoLink, convite } from "../config/convite";
import { enviarConfirmacao, idDoEnvio, novaSessao } from "../lib/planilha";

const MAX_ACOMPANHANTES = 8;

type Status = "idle" | "sending" | "ok" | "error";

export default function RsvpForm({ onFechar }: { onFechar: () => void }) {
  const convidado = convidadoDoLink();
  const sessao = useRef(novaSessao());
  const [vai, setVai] = useState(true);
  const [responsavel, setResponsavel] = useState(convidado?.nome ?? "");
  const [acompanhantes, setAcompanhantes] = useState<string[]>([]);
  const [recado, setRecado] = useState("");
  const [isca, setIsca] = useState(""); // campo-isca: pessoas não veem nem preenchem
  const [status, setStatus] = useState<Status>("idle");
  const [erro, setErro] = useState("");
  const [enviados, setEnviados] = useState<string[]>([]);

  const alterar = (i: number, valor: string) =>
    setAcompanhantes((lista) => lista.map((n, idx) => (idx === i ? valor : n)));

  const remover = (i: number) =>
    setAcompanhantes((lista) => lista.filter((_, idx) => idx !== i));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    const nome = responsavel.trim();
    if (!nome) {
      setErro("Escreva o seu nome.");
      return;
    }

    const extras = vai ? acompanhantes.map((n) => n.trim()).filter(Boolean) : [];
    const pessoas = vai ? [nome, ...extras] : [];
    const dados = {
      convidado: convidado?.slug ?? null,
      responsavel: nome,
      vai,
      pessoas,
      recado: recado.trim() || null,
    };

    setErro("");
    setStatus("sending");
    try {
      await enviarConfirmacao({ ...dados, id: idDoEnvio(sessao.current, dados), site: isca });
      setEnviados(pessoas);
      setStatus("ok");
    } catch {
      setStatus("error");
      setErro("Não conseguimos enviar agora. Confira a internet e toque em enviar de novo (não duplica).");
    }
  };

  if (status === "ok") {
    return (
      <div className="rsvp-corpo">
        <div className="rsvp-painel">
          <p className="rsvp-sucesso">{vai ? "PRESENÇA CONFIRMADA!" : "RESPOSTA RECEBIDA"}</p>
          <p className="rsvp-texto">
            {vai
              ? `${enviados.join(", ")} — até a festa de ${convite.nome}! 🎉`
              : "Que pena que não dá! Obrigado por avisar."}
          </p>
        </div>
        <button type="button" className="rsvp-btn rsvp-verde" onClick={onFechar}>
          <span>FECHAR</span>
        </button>
        <button type="button" className="rsvp-link" onClick={() => setStatus("idle")}>
          alterar minha resposta
        </button>
      </div>
    );
  }

  return (
    <form className="rsvp-corpo" onSubmit={enviar} noValidate>
      <div className="rsvp-escolha">
        <button type="button" className={`rsvp-btn ${vai ? "rsvp-amarelo" : "rsvp-azul"}`} aria-pressed={vai} onClick={() => setVai(true)}>
          <span>VOU! 🎉</span>
        </button>
        <button type="button" className={`rsvp-btn ${!vai ? "rsvp-amarelo" : "rsvp-azul"}`} aria-pressed={!vai} onClick={() => setVai(false)}>
          <span>NÃO VOU</span>
        </button>
      </div>

      <label className="rsvp-rotulo">
        SEU NOME
        <input
          className="rsvp-campo"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          maxLength={80}
          autoComplete="name"
          placeholder="Nome e sobrenome"
        />
      </label>

      {vai &&
        acompanhantes.map((nome, i) => (
          <div className="rsvp-pessoa" key={i}>
            <label className="rsvp-rotulo">
              ACOMPANHANTE {i + 1}
              <input
                className="rsvp-campo"
                value={nome}
                onChange={(e) => alterar(i, e.target.value)}
                maxLength={80}
                placeholder="Nome da pessoa"
              />
            </label>
            <button
              type="button"
              className="rsvp-remover"
              aria-label={`Remover acompanhante ${i + 1}`}
              onClick={() => remover(i)}
            >
              ✕
            </button>
          </div>
        ))}

      {vai && acompanhantes.length < MAX_ACOMPANHANTES && (
        <button
          type="button"
          className="rsvp-btn rsvp-cinza"
          onClick={() => setAcompanhantes((l) => [...l, ""])}
        >
          <span>+ ADICIONAR PESSOA</span>
        </button>
      )}

      <label className="rsvp-rotulo">
        RECADO (OPCIONAL)
        <textarea
          className="rsvp-campo"
          value={recado}
          onChange={(e) => setRecado(e.target.value)}
          maxLength={300}
          placeholder="Alergia, dúvida, carinho…"
        />
      </label>

      {/* campo-isca: escondido de pessoas; robôs costumam preencher */}
      <input
        className="rsvp-isca"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        name="site"
        value={isca}
        onChange={(e) => setIsca(e.target.value)}
      />

      {erro && (
        <p className="rsvp-erro" role="alert">
          {erro}
        </p>
      )}

      <button className="rsvp-btn rsvp-verde" type="submit" disabled={status === "sending"}>
        <span>{status === "sending" ? "ENVIANDO..." : "ENVIAR"}</span>
      </button>
    </form>
  );
}
