#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ABC="${ABC:?Задай свои инициалы: export ABC=SGA}"
mkdir -p out

openssl genrsa -out out/server.key 2048
openssl req -new -key out/server.key -out out/resource.csr \
  -subj "/CN=RS-LAB22-${ABC}"

echo "CSR: out/resource.csr (CN=RS-LAB22-${ABC})"
echo "Отправь CA файл out/resource.csr"
echo "Сохрани out/server.key — не передавай никому!"
