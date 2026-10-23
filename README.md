# convite-animado

Convite de aniversário animado: o personagem corre por um cenário com parallax, coleta estrelas e passa por placas com os dados da festa. No final, contagem regressiva, mapa e confirmação de presença por WhatsApp.

Tudo gratuito: Vite + React + TypeScript, Canvas 2D, Howler.js e hospedagem estática.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera /dist
```

## Personalizar

Edite só `src/config/convite.ts`: nome, idade, data/hora, local, mapa, WhatsApp, música (opcional) e sprite próprio (opcional).

## Estrutura

```
src/
├─ config/convite.ts   # dados da festa
├─ game/runner.ts      # cena de corrida (canvas, parallax, estrelas, placas)
├─ scenes/             # Start, Run, Details
├─ components/         # Countdown
└─ audio.ts            # efeitos (WebAudio) e música (Howler)
```

## Publicar de graça

### GitHub Pages (configurado)

A cada push na branch `convite-v1`, o GitHub Actions (`.github/workflows/deploy.yml`) roda `npm run build` e publica a pasta `dist`.

Configuração única no GitHub:
1. **Settings > Pages > Build and deployment > Source:** escolha **GitHub Actions**.
2. **Settings > Environments > github-pages > Deployment branches:** adicione a branch `convite-v1` (por padrão só a branch principal pode publicar). Se preferir, faça merge da `convite-v1` na `main` e ajuste o `branches:` do workflow.
3. Acompanhe o deploy na aba **Actions**.

O endereço fica `https://doelitzsch10.github.io/convite-animado/`. Para links por convidado, acrescente `?convidado=nome-sobrenome` (ex.: `.../convite-animado/?convidado=maria-silva`).

Outras opções gratuitas: Cloudflare Pages, Vercel ou Netlify (build: `npm run build`, saída: `dist`).

## Arte e áudio

O personagem é original, desenhado por código. Use apenas música e imagens que você tenha direito de usar (Pixabay Music, Freesound, OpenGameArt, conferindo cada licença).
