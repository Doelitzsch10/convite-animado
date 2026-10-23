// Cliente mínimo do Supabase (REST), sem biblioteca extra.
// A chave "anon" é pública por design: a segurança vem das regras (RLS)
// definidas em supabase/schema.sql, que só permitem inserir.

const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const CHAVE = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const rsvpAtivo = Boolean(URL_BASE && CHAVE);

export interface Confirmacao {
  convidado: string | null;
  responsavel: string;
  vai: boolean;
  pessoas: string[];
  recado: string | null;
}

export async function enviarConfirmacao(c: Confirmacao): Promise<void> {
  if (!URL_BASE || !CHAVE) throw new Error("Supabase não configurado");

  const res = await fetch(`${URL_BASE.replace(/\/$/, "")}/rest/v1/confirmacoes`, {
    method: "POST",
    headers: {
      apikey: CHAVE,
      Authorization: `Bearer ${CHAVE}`,
      "Content-Type": "application/json",
      // sem permissão de leitura, então não pedimos o registro de volta
      Prefer: "return=minimal",
    },
    body: JSON.stringify(c),
  });

  if (!res.ok) throw new Error(`Falha ao salvar (${res.status})`);
}
