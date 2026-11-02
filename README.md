# convite-animado

Convite de aniversário animado: o personagem corre por um cenário com parallax, coleta estrelas e passa por placas com os dados da festa. No final, contagem regressiva, botão de localização e confirmação de presença com o nome de cada pessoa.

Tudo gratuito: Vite + React + TypeScript, Canvas 2D, Google Planilhas (via Apps Script) e hospedagem estática. Script em Python (só biblioteca padrão) para gerar links por convidado.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera /dist
```

## Personalizar

Edite `src/config/convite.ts`: nome, idade, data/hora, local, coordenadas do mapa, endereço da planilha (`planilhaUrl`), imagens de capa, final e mapa, vídeo e música (opcionais).

## Confirmação de presença (Google Planilhas)

O convidado toca em "Confirmar presença", informa o próprio nome e quantos acompanhantes quiser (um nome por pessoa, até 8) ou avisa que não vai. Cada pessoa vira **uma linha** na sua planilha. Tudo gratuito, sem servidor.

**Como funciona:** o site envia os dados para um Google Apps Script ligado à planilha (`google-sheets/Code.gs`), que grava as linhas. O script só grava: ele nunca devolve o conteúdo da planilha, então quem tem o link do convite não consegue ler a lista.

### Passo a passo (uma vez só)

1. Em sheets.google.com, crie uma planilha em branco (ex.: "Confirmações Thomas").
2. Menu **Extensões > Apps Script**. Apague o código de exemplo, cole o conteúdo de `google-sheets/Code.gs` e salve (ícone de disquete).
3. Clique em **Implantar > Nova implantação**. Em "Selecionar tipo" (engrenagem), escolha **App da Web**. Configure:
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar** e autorize com a sua conta Google. A sequência costuma ser: escolher a conta > aviso **"O Google não verificou este app"** > link pequeno **Avançado** (embaixo, à esquerda) > **Acessar (nome do projeto) (não seguro)** > **Continuar** > **Permitir**. O aviso é normal: o script é seu e só mexe na própria planilha. Se nenhuma tela de autorização aparecer, force-a: no editor do Apps Script, escolha a função `doGet` na lista ao lado de "Depurar" e clique em **Executar**.
5. Copie o **URL do app da Web** (termina em `/exec`) e cole em `planilhaUrl`, no arquivo `src/config/convite.ts`. Envie o código ao GitHub; o deploy publica sozinho.
6. Teste: abra o convite, confirme presença e veja a linha aparecer na aba **Confirmações** (a aba e o cabeçalho são criados no primeiro envio).

> Se você alterar o `Code.gs` depois, é preciso publicar de novo: **Implantar > Gerenciar implantações > lápis > Versão: Nova versão > Implantar**. O URL continua o mesmo.

### O que aparece na planilha

Aba **Confirmações**, uma linha por pessoa: Data/hora, Responsável, Link do convidado, Pessoa, Presença (SIM/NÃO), Recado, Status e ID.

- Se alguém responder de novo, as linhas antigas dessa pessoa/convite ficam com Status **SUBSTITUÍDA** e as novas com **ATIVA**. Nada é apagado. Filtre por ATIVA para ver a lista atual.
- Aba **Resumo**: total de pessoas confirmadas e que não vão (só contam as ATIVAS).
- Apertar "enviar" duas vezes (ou tentar de novo depois de uma falha de rede) não duplica linhas.

### Proteções

O endereço do script é público (como o de qualquer formulário), então o script valida tamanhos, limita a 10 pessoas por envio, ignora robôs que preenchem um campo-isca invisível e protege contra textos que virariam fórmula na planilha (`=`, `+`, `-`, `@`). Ele não impede alguém determinado de enviar respostas falsas: se isso acontecer, desative a implantação em Implantar > Gerenciar implantações e crie outra (o URL muda).

## Links personalizados por convidado

```bash
python tools/gerar_links.py --base-url https://SEU-SITE.pages.dev "Maria Silva" "João Souza"
# ou, com um nome por linha em um arquivo:
python tools/gerar_links.py --base-url https://SEU-SITE.pages.dev --arquivo convidados.txt
```

Cada link (`?convidado=maria-silva`) mostra "MARIA SILVA, você foi convidado!" e já preenche o nome no formulário. Os links também ficam em `tools/links.csv`.

## Estrutura

```
src/
├─ config/convite.ts     # dados da festa, imagens, vídeo e URL da planilha
├─ game/runner.ts        # cena de corrida em canvas (usada se não houver vídeo)
├─ scenes/               # Start (capa), Video/Run, Details (tela final)
├─ components/           # Countdown, Modal, MapaModal, RsvpModal, RsvpForm
├─ lib/                  # assets.ts (caminhos), planilha.ts (envio da confirmação)
└─ audio.ts              # efeitos (WebAudio) e música (Howler)
google-sheets/Code.gs    # script que grava as confirmações na planilha
tools/gerar_links.py     # links personalizados por convidado
public/img, public/video # capa, tela final, arte do mapa e vídeo
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
