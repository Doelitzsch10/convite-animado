# convite-animado

Convite de aniversário animado: o personagem corre por um cenário com parallax, coleta estrelas e passa por placas com os dados da festa. No final, contagem regressiva, botão de localização e confirmação de presença com o nome de cada pessoa.

Tudo gratuito: Vite + React + TypeScript, Canvas 2D, Supabase (plano gratuito) e hospedagem estática. Scripts em Python (só biblioteca padrão) para gerar links e listar confirmados.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera /dist
```

## Personalizar

Edite `src/config/convite.ts`: nome, idade, data/hora, local, mapa, WhatsApp, música (opcional) e sprite próprio (opcional).

## Confirmação de presença (Supabase)

O convidado informa o próprio nome e quantos acompanhantes quiser (um nome por pessoa, até 8), ou avisa que não vai. Sem o Supabase configurado, o botão cai para o WhatsApp.

1. Crie uma conta e um projeto em supabase.com (plano gratuito).
2. No painel, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e rode. Isso cria a tabela e garante que o site só consiga **inserir** respostas, nunca ler ou apagar.
3. Em **Project Settings > API**, copie a URL do projeto e a chave pública (`anon`/`publishable`).
4. Local: copie `.env.example` para `.env.local` e preencha.
5. Publicado: cadastre as mesmas duas variáveis (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) nas configurações do Cloudflare Pages/Vercel/Netlify e faça um novo deploy. O Vite grava os valores no momento do build.

Nunca coloque a chave secreta (`service_role`) no site nem no repositório.

## Links personalizados por convidado

```bash
python tools/gerar_links.py --base-url https://SEU-SITE.pages.dev "Maria Silva" "João Souza"
# ou, com um nome por linha em um arquivo:
python tools/gerar_links.py --base-url https://SEU-SITE.pages.dev --arquivo convidados.txt
```

Cada link (`?convidado=maria-silva`) mostra "MARIA SILVA, você foi convidado!" e já preenche o nome no formulário. Os links também ficam em `tools/links.csv`.

## Ver quem confirmou

```bash
export SUPABASE_URL=https://SEU-PROJETO.supabase.co
export SUPABASE_SERVICE_KEY=sua-chave-secreta   # service_role, só na sua máquina
python tools/listar_confirmacoes.py
```

Mostra cada resposta com os nomes, os recados e o total de pessoas, e salva `tools/confirmacoes.csv` (abre no Excel/Planilhas). Se alguém responder de novo, vale a resposta mais recente.

## Estrutura

```
src/
├─ config/convite.ts     # dados da festa e link do convidado
├─ game/runner.ts        # cena de corrida (canvas, parallax, estrelas, placas)
├─ scenes/               # Start, Run, Details
├─ components/           # Countdown, RsvpForm
├─ lib/supabase.ts       # envio da confirmação
└─ audio.ts              # efeitos (WebAudio) e música (Howler)
supabase/schema.sql      # tabela + regras de segurança
tools/                   # scripts Python
```

## Publicar de graça

Conecte o repositório à Cloudflare Pages, Vercel ou Netlify (build: `npm run build`, saída: `dist`). O endereço gratuito sai como `nome-do-projeto.pages.dev` (ou `.vercel.app` / `.netlify.app`). Domínio próprio é opcional e pago.

## Arte e áudio

O personagem é original, desenhado por código. Use apenas música e imagens que você tenha direito de usar (Pixabay Music, Freesound, OpenGameArt, conferindo cada licença).
