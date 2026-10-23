#!/usr/bin/env python3
"""Lista quem confirmou presença e salva tools/confirmacoes.csv.

Precisa de duas variáveis de ambiente (Supabase > Project Settings > API):
    SUPABASE_URL          ex.: https://SEU-PROJETO.supabase.co
    SUPABASE_SERVICE_KEY  chave SECRETA (service_role). Nunca commite nem
                          coloque no site: ela lê tudo.

Uso:
    export SUPABASE_URL=...  SUPABASE_SERVICE_KEY=...
    python tools/listar_confirmacoes.py

Se a mesma pessoa responder mais de uma vez, vale a resposta mais recente.
Só usa a biblioteca padrão do Python.
"""

import csv
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


def buscar(url: str, chave: str) -> list[dict]:
    endpoint = f"{url.rstrip('/')}/rest/v1/confirmacoes?select=*&order=criado_em.asc"
    req = urllib.request.Request(
        endpoint, headers={"apikey": chave, "Authorization": f"Bearer {chave}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"Erro {e.code} do Supabase: {e.read().decode(errors='replace')[:300]}")
    except urllib.error.URLError as e:
        sys.exit(f"Não consegui conectar: {e.reason}")


def ultimas_respostas(linhas: list[dict]) -> list[dict]:
    """Mantém só a resposta mais recente de cada convidado/responsável."""
    por_chave: dict[str, dict] = {}
    for r in linhas:  # já vem em ordem de criação
        chave = r.get("convidado") or r["responsavel"].strip().lower()
        por_chave[chave] = r
    return list(por_chave.values())


def main() -> None:
    url = os.environ.get("SUPABASE_URL")
    chave = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not chave:
        sys.exit("Defina SUPABASE_URL e SUPABASE_SERVICE_KEY (veja o topo deste arquivo).")

    respostas = ultimas_respostas(buscar(url, chave))
    vao = [r for r in respostas if r["vai"]]
    nao_vao = [r for r in respostas if not r["vai"]]
    total_pessoas = sum(len(r["pessoas"]) for r in vao)

    for r in vao:
        print(f"✔ {r['responsavel']}  ({len(r['pessoas'])} pessoa(s))")
        for nome in r["pessoas"]:
            print(f"    - {nome}")
        if r.get("recado"):
            print(f"    recado: {r['recado']}")
    for r in nao_vao:
        print(f"✘ {r['responsavel']}  (não vai)")

    print(
        f"\nRespostas: {len(respostas)} | Confirmaram: {len(vao)} "
        f"| Não vão: {len(nao_vao)} | TOTAL DE PESSOAS: {total_pessoas}"
    )

    saida = Path(__file__).with_name("confirmacoes.csv")
    with open(saida, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["quando", "responsavel", "vai", "qtd_pessoas", "pessoas", "recado"])
        for r in respostas:
            w.writerow(
                [
                    r["criado_em"],
                    r["responsavel"],
                    "sim" if r["vai"] else "não",
                    len(r["pessoas"]),
                    "; ".join(r["pessoas"]),
                    r.get("recado") or "",
                ]
            )
    print(f"Planilha salva em {saida}")


if __name__ == "__main__":
    main()
