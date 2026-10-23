import { useState, type FormEvent } from "react";
import { convidadoDoLink, convite, linkWhatsapp } from "../config/convite";
import { enviarConfirmacao } from "../lib/supabase";

const MAX_ACOMPANHANTES = 8;

type Status = "idle" | "sending" | "ok" | "error";

export default function RsvpForm() {
  const convidado = convidadoDoLink();
  const [vai, setVai] = useState(true);
  const [responsavel, setResponsavel] = useState(convidado?.nome ?? "");
  const [acompanhantes, setAcompanhantes] = useState<string[]>([]);
  const [recado, setRecado] = useState("");
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

    setErro("");
    setStatus("sending");
    try {
      await enviarConfirmacao({
        convidado: convidado?.slug ?? null,
        responsavel: nome,
        vai,
        pessoas,
        recado: recado.trim() || null,
      });
      setEnviados(pessoas);
      setStatus("ok");
    } catch {
      setStatus("error");
      setErro("Não deu certo. Tente de novo ou fale com a gente pelo WhatsApp.");
    }
  };

  if (status === "ok") {
    return (
      <div className="rsvp">
        <h3>{vai ? "PRESENÇA CONFIRMADA!" : "RECEBEMOS SUA RESPOSTA"}</h3>
        <p className="rsvp-msg rsvp-ok">
          {vai
            ? `${enviados.join(", ")} — até a festa de ${convite.nome}! 🎉`
            : `Que pena que não dá! Obrigado por avisar.`}
        </p>
        <button className="link" onClick={() => setStatus("idle")}>
          alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form className="rsvp" onSubmit={enviar}>
      <h3>CONFIRME SUA PRESENÇA</h3>

      <div className="rsvp-choice">
        <button type="button" className={vai ? "on" : ""} onClick={() => setVai(true)}>
          VOU! 🎉
        </button>
        <button type="button" className={!vai ? "on" : ""} onClick={() => setVai(false)}>
          NÃO VOU
        </button>
      </div>

      <label>
        SEU NOME
        <input
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          maxLength={80}
          autoComplete="name"
          placeholder="Nome e sobrenome"
        />
      </label>

      {vai && (
        <>
          {acompanhantes.map((nome, i) => (
            <div className="rsvp-person" key={i}>
              <label>
                ACOMPANHANTE {i + 1}
                <input
                  value={nome}
                  onChange={(e) => alterar(i, e.target.value)}
                  maxLength={80}
                  placeholder="Nome da pessoa"
                />
              </label>
              <button
                type="button"
                className="x"
                aria-label={`Remover acompanhante ${i + 1}`}
                onClick={() => remover(i)}
              >
                ✕
              </button>
            </div>
          ))}

          {acompanhantes.length < MAX_ACOMPANHANTES && (
            <button
              type="button"
              className="add"
              onClick={() => setAcompanhantes((l) => [...l, ""])}
            >
              + ADICIONAR PESSOA
            </button>
          )}
        </>
      )}

      <label>
        RECADO (OPCIONAL)
        <textarea
          value={recado}
          onChange={(e) => setRecado(e.target.value)}
          maxLength={300}
          placeholder="Alergia, dúvida, carinho…"
        />
      </label>

      {erro && <p className="rsvp-msg erro">{erro}</p>}

      <button className="btn green" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "ENVIANDO..." : "ENVIAR"}
      </button>

      <a className="link" href={linkWhatsapp()} target="_blank" rel="noreferrer">
        prefiro responder pelo WhatsApp
      </a>
    </form>
  );
}
