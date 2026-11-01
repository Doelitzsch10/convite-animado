// Envio das confirmações para a planilha do Google (via Google Apps Script).
// O script fica em google-sheets/Code.gs; passo a passo no README.
import { convite } from "../config/convite";

export const rsvpAtivo = Boolean(convite.planilhaUrl);

export interface Confirmacao {
  id: string;
  convidado: string | null;
  responsavel: string;
  vai: boolean;
  pessoas: string[];
  recado: string | null;
  /** campo-isca: deve ir sempre vazio (robôs costumam preencher) */
  site: string;
}

// Identificador da "sessão" do formulário; junto com o conteúdo forma o id do envio.
export function novaSessao(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Hash curto do conteúdo: o mesmo conteúdo gera o mesmo id, então repetir o envio
// (toque duplo, nova tentativa depois de falha de rede) não cria linhas duplicadas.
export function idDoEnvio(sessao: string, c: Omit<Confirmacao, "id" | "site">): string {
  const texto = JSON.stringify([c.convidado, c.responsavel, c.vai, c.pessoas, c.recado]);
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return `${sessao}-${h.toString(36)}`;
}

export async function enviarConfirmacao(c: Confirmacao): Promise<void> {
  if (!convite.planilhaUrl) throw new Error("planilha não configurada");

  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 20000);
  try {
    // Sem cabeçalho Content-Type: o navegador envia como text/plain e não faz a
    // verificação prévia (preflight) que o Apps Script não responde.
    const res = await fetch(convite.planilhaUrl, {
      method: "POST",
      body: JSON.stringify(c),
      redirect: "follow",
      signal: controle.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: { ok?: boolean; erro?: string } = await res.json();
    if (json.ok !== true) throw new Error(json.erro || "envio recusado");
  } finally {
    clearTimeout(limite);
  }
}
