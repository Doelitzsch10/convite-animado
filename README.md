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

### GitHub Pages (configurado)

O GitHub Actions (`.github/workflows/deploy.yml`) roda `npm ci` e `npm run build` em **todas as branches**, então qualquer branch nova (criada a partir de outra) já herda o workflow e mostra na aba Actions se compila. A publicação no Pages acontece só quando o push é na branch `convite-v1`, porque o Pages tem um único site no ar. Para publicar outra branch, troque `convite-v1` nas três linhas marcadas com `<-` no workflow.

Configuração única no GitHub:
1. **Settings > Pages > Build and deployment > Source:** escolha **GitHub Actions**.
2. **Settings > Environments > github-pages > Deployment branches:** adicione a branch `convite-v1` (por padrão só a branch principal pode publicar). Se preferir, faça merge da `convite-v1` na `main` e ajuste o `branches:` do workflow.
3. Acompanhe o deploy na aba **Actions**.

O endereço fica `https://doelitzsch10.github.io/convite-animado/`. Para links por convidado, acrescente `?convidado=nome-sobrenome` (ex.: `.../convite-animado/?convidado=maria-silva`).

Outras opções gratuitas: Cloudflare Pages, Vercel ou Netlify (build: `npm run build`, saída: `dist`).

## Arte e áudio

O personagem é original, desenhado por código. Use apenas música e imagens que você tenha direito de usar (Pixabay Music, Freesound, OpenGameArt, conferindo cada licença).
