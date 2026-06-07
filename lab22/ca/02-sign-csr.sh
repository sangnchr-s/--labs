#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ABC="${ABC:?Задай инициалы Resource: export ABC=SGA}"
CSR="${1:-in/resource.csr}"

if [[ ! -f "$CSR" ]]; then
  echo "Нет CSR: $CSR"
  echo "Положи запрос партнёра в ca/in/resource.csr"
  exit 1
fi

if [[ ! -f out/ca.crt || ! -f out/ca.key ]]; then
  echo "Сначала выполни 01-create-ca.sh"
  exit 1
fi

sed "s/__ABC__/${ABC}/g" server.ext.template > out/server.ext

openssl x509 -req -in "$CSR" -CA out/ca.crt -CAkey out/ca.key -CAcreateserial \
  -out out/server.crt -days 365 -sha256 -extfile out/server.ext

echo "Подписан server.crt (SAN: LAB22-${ABC}, ${ABC})"
echo "Отправь Resource: out/ca.crt и out/server.crt"
