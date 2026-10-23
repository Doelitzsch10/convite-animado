// Tudo que muda de um convite para outro fica aqui.
// Troque os valores abaixo e o convite inteiro se atualiza.

export const convite = {
  nome: "Thomas",
  idade: 6 ,

  // Data e hora da festa (ISO com fuso de São Paulo)
  dataISO: "2027-02-13T13:00:00-03:00",

  local: "Girafestas Buffet",
  endereco: " Av. Waldemar Carlos Pereira, 1697 - Vila Talarico, São Paulo ",
  mapsUrl: "https://www.google.com/maps/place/Girafestas+Buffet/@-23.5469765,-46.5134408,807m/data=!3m2!1e3!4b1!4m6!3m5!1s0x94ce67538d4b3379:0xb5c6c33039951ab0!8m2!3d-23.5469765!4d-46.5108659!16s%2Fg%2F11spp4w982?entry=ttu&g_ep=EgoyMDI2MTAxOS4wIKXMDSoASAFQAw%3D%3D",

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

export function linkWhatsapp(): string {
  const msg = `Oi! Confirmo presença na festa de ${convite.nome}! 🎉`;
  return `https://wa.me/${convite.whatsapp}?text=${encodeURIComponent(msg)}`;
}
