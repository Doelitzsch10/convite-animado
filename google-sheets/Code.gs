/**
 * Recebe as confirmações do convite e grava na planilha (uma linha por pessoa).
 *
 * Como usar: veja a seção "Confirmação de presença" do README.
 * Resumo: na planilha, Extensões > Apps Script > cole este arquivo >
 * Implantar > Nova implantação > App da Web > Executar como "Eu" e acesso "Qualquer pessoa".
 *
 * Segurança: este script SÓ grava. Ele nunca devolve o conteúdo da planilha,
 * então quem tem o link do convite não consegue ler a lista.
 */

var ABA = "Confirmações";
var ABA_RESUMO = "Resumo";
var CABECALHO = [
  "Data/hora",
  "Responsável",
  "Link do convidado",
  "Pessoa",
  "Presença",
  "Recado",
  "Status",
  "ID",
];
var COL_RESPONSAVEL = 2;
var COL_LINK = 3;
var COL_STATUS = 7;
var COL_ID = 8;

var MAX_PESSOAS = 10;
var MAX_NOME = 80;
var MAX_RECADO = 300;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var dados = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var c = validar_(dados);
    if (c.ignorar) return resposta_({ ok: true });

    var aba = abaConfirmacoes_();

    // Mesmo envio repetido (ex.: toque duplo ou nova tentativa): não grava de novo
    if (jaExiste_(aba, c.id)) return resposta_({ ok: true, repetido: true });

    // Resposta nova da mesma pessoa/convite substitui a anterior (a antiga fica marcada, não é apagada)
    marcarSubstituidas_(aba, c.chave);

    var agora = new Date();
    var linhas = c.pessoas.map(function (pessoa) {
      return [
        agora,
        seguro_(c.responsavel),
        seguro_(c.convidado),
        seguro_(pessoa),
        c.vai ? "SIM" : "NÃO",
        seguro_(c.recado),
        "ATIVA",
        c.id,
      ];
    });
    aba.getRange(aba.getLastRow() + 1, 1, linhas.length, CABECALHO.length).setValues(linhas);

    return resposta_({ ok: true });
  } catch (err) {
    return resposta_({ ok: false, erro: String(err && err.message ? err.message : err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignorado) {}
  }
}

// Abrir o link no navegador só mostra que o serviço está no ar; não expõe dados.
function doGet() {
  return resposta_({ ok: true, servico: "convite" });
}

function validar_(d) {
  // Campo-isca: pessoas não veem; robôs costumam preencher. Finge sucesso e não grava.
  if (d.site) return { ignorar: true };

  var id = String(d.id || "");
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) throw new Error("id inválido");

  var responsavel = String(d.responsavel || "").trim();
  if (!responsavel || responsavel.length > MAX_NOME) throw new Error("nome inválido");

  var vai = d.vai === true;
  var pessoas = [];
  if (vai) {
    var lista = Array.isArray(d.pessoas) ? d.pessoas : [];
    for (var i = 0; i < lista.length; i++) {
      var nome = String(lista[i] || "").trim();
      if (!nome) continue;
      if (nome.length > MAX_NOME) throw new Error("nome muito longo");
      pessoas.push(nome);
    }
    if (pessoas.length === 0) pessoas.push(responsavel);
    if (pessoas.length > MAX_PESSOAS) throw new Error("pessoas demais");
  } else {
    pessoas.push(responsavel);
  }

  var recado = String(d.recado || "").trim();
  if (recado.length > MAX_RECADO) throw new Error("recado muito longo");

  var convidado = String(d.convidado || "").trim().slice(0, 60);
  var chave = convidado ? "link:" + convidado.toLowerCase() : "nome:" + responsavel.toLowerCase();

  return {
    id: id,
    responsavel: responsavel,
    convidado: convidado,
    vai: vai,
    pessoas: pessoas,
    recado: recado,
    chave: chave,
  };
}

// Evita que um texto começando com = + - @ seja executado como fórmula na planilha
function seguro_(valor) {
  var s = String(valor == null ? "" : valor);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function abaConfirmacoes_() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]).setFontWeight("bold");
    aba.setFrozenRows(1);
    aba.getRange("A:A").setNumberFormat("dd/MM/yyyy HH:mm");
    criarResumo_(planilha);
  }
  return aba;
}

function criarResumo_(planilha) {
  if (planilha.getSheetByName(ABA_RESUMO)) return;
  var r = planilha.insertSheet(ABA_RESUMO);
  var a = "'" + ABA + "'!";
  r.getRange("A1:B3").setValues([
    ["Pessoas confirmadas", ""],
    ["Pessoas que não vão", ""],
    ["Linhas de respostas substituídas", ""],
  ]);
  r.getRange("B1").setFormula("=COUNTIFS(" + a + "E:E,\"SIM\"," + a + "G:G,\"ATIVA\")");
  r.getRange("B2").setFormula("=COUNTIFS(" + a + "E:E,\"NÃO\"," + a + "G:G,\"ATIVA\")");
  r.getRange("B3").setFormula("=COUNTIF(" + a + "G:G,\"SUBSTITUÍDA\")");
  r.getRange("A1:A3").setFontWeight("bold");
  r.setColumnWidth(1, 280);
}

function jaExiste_(aba, id) {
  var n = aba.getLastRow();
  if (n < 2) return false;
  var ids = aba.getRange(2, COL_ID, n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) return true;
  return false;
}

function marcarSubstituidas_(aba, chave) {
  var n = aba.getLastRow();
  if (n < 2) return;
  var valores = aba.getRange(2, 1, n - 1, CABECALHO.length).getValues();
  for (var i = 0; i < valores.length; i++) {
    var linha = valores[i];
    if (linha[COL_STATUS - 1] !== "ATIVA") continue;
    var link = String(linha[COL_LINK - 1] || "").replace(/^'/, "").toLowerCase();
    var nome = String(linha[COL_RESPONSAVEL - 1] || "").replace(/^'/, "").toLowerCase();
    var existente = link ? "link:" + link : "nome:" + nome;
    if (existente === chave) aba.getRange(i + 2, COL_STATUS).setValue("SUBSTITUÍDA");
  }
}
