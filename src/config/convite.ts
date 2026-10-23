// Tudo que muda de um convite para outro fica aqui.
// Troque os valores abaixo e o convite inteiro se atualiza.

export const convite = {
  nome: "Ravi",
  idade: 3,

  // Data e hora da festa (ISO com fuso de São Paulo)
  dataISO: "2026-12-12T15:00:00-03:00",

  local: "Salão de Festas Aventura",
  endereco: "Rua das Estrelas, 123 - São Paulo, SP",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+das+Estrelas+123+Sao+Paulo",

  // WhatsApp com DDI + DDD + número, só dígitos
  whatsapp: "5511999999999",

  // Opcional: música de fundo (use arquivo livre de direitos em /public/audio)
  musicUrl: "",

  // Opcional: imagem PNG do personagem corredor (sua própria arte), ex.: "./sprites/heroi.png"
  // Se vazio, usa o personagem original desenhado pelo código.
  spriteUrl: "",
};

const fuso = "America/Sao_Paulo";

export function dataFesta(): Date {
  return new Date(convite.dataISO);
}

export function dataCurta(): string {
  return dataFesta().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: fuso,
  });
}

export function dataLonga(): string {
  return dataFesta().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: fuso,
  });
}

export function hora(): string {
  return dataFesta().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: fuso,
  });
}

// Textos das placas que aparecem durante a corrida
export function placasDaCorrida(): string[] {
  return [
    "CONVITE ESPECIAL",
    `${convite.nome.toUpperCase()} FAZ ${convite.idade} ANOS!`,
    `DIA ${dataCurta()} AS ${hora()}`,
    convite.local.toUpperCase(),
  ];
}

// Link personalizado: https://seu-site/?convidado=maria-silva
// Mostra "Maria Silva" no convite e identifica a resposta no banco.
export function convidadoDoLink(): { slug: string; nome: string } | null {
  const bruto = new URLSearchParams(window.location.search).get("convidado");
  if (!bruto) return null;
  const slug = bruto.toLowerCase().slice(0, 60);
  const nome = slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return nome ? { slug, nome } : null;
}

export function linkWhatsapp(): string {
  const msg = `Oi! Confirmo presença na festa de ${convite.nome}! 🎉`;
  return `https://wa.me/${convite.whatsapp}?text=${encodeURIComponent(msg)}`;
}
