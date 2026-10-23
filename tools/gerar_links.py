#!/usr/bin/env python3
"""Gera um link personalizado por convidado.

Exemplos:
    python tools/gerar_links.py --base-url https://convite-ravi.pages.dev "Maria Silva" "João Souza"
    python tools/gerar_links.py --base-url https://convite-ravi.pages.dev --arquivo convidados.txt

O arquivo de convidados tem um nome por linha. O resultado é impresso na tela
e salvo em tools/links.csv (nome, link) para você copiar e mandar no WhatsApp.
Só usa a biblioteca padrão do Python.
"""

import argparse
import csv
import re
import sys
import unicodedata
from pathlib import Path


def slugify(nome: str) -> str:
    """'João da Silva' -> 'joao-da-silva' (sem acento, só a-z, 0-9 e hífen)."""
    sem_acento = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")
    return slug[:60].strip("-")


def montar_links(nomes: list[str], base_url: str) -> list[tuple[str, str]]:
    base = base_url.rstrip("/")
    usados: dict[str, int] = {}
    resultado = []
    for nome in nomes:
        slug = slugify(nome)
        if not slug:
            print(f"Ignorado (sem letras ou números): {nome!r}", file=sys.stderr)
            continue
        usados[slug] = usados.get(slug, 0) + 1
        if usados[slug] > 1:  # nomes repetidos ganham sufixo -2, -3...
            slug = f"{slug[:57]}-{usados[slug]}"
        resultado.append((nome, f"{base}/?convidado={slug}"))
    return resultado


def main() -> None:
    p = argparse.ArgumentParser(description="Gera links personalizados do convite.")
    p.add_argument("--base-url", required=True, help="endereço do site publicado")
    p.add_argument("--arquivo", help="arquivo de texto com um nome por linha")
    p.add_argument("--saida", default=str(Path(__file__).with_name("links.csv")))
    p.add_argument("nomes", nargs="*", help="nomes dos convidados")
    args = p.parse_args()

    nomes = [n.strip() for n in args.nomes if n.strip()]
    if args.arquivo:
        linhas = Path(args.arquivo).read_text(encoding="utf-8").splitlines()
        nomes += [l.strip() for l in linhas if l.strip()]
    if not nomes:
        p.error("informe ao menos um nome (ou use --arquivo)")

    links = montar_links(nomes, args.base_url)

    with open(args.saida, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["nome", "link"])
        w.writerows(links)

    for nome, link in links:
        print(f"{nome}\n  {link}")
    print(f"\n{len(links)} link(s) salvos em {args.saida}")


if __name__ == "__main__":
    main()
