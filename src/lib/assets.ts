// "video/cena.mp4" vira "<base>/video/cena.mp4" (funciona no GitHub Pages).
// Endereços completos (https://...) são mantidos como estão.
export const assetUrl = (p: string) =>
  /^(https?:)?\/\//.test(p) ? p : import.meta.env.BASE_URL + p.replace(/^\.?\//, "");
