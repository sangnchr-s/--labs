#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

XYZ="${XYZ:?Задай инициалы CA: export XYZ=GNM}"
mkdir -p out in

openssl genrsa -out out/ca.key 2048
openssl req -x509 -new -nodes -key out/ca.key -sha256 -days 3650 \
  -out out/ca.crt -subj "/CN=CA-LAB22-${XYZ}"

echo "CA создан: out/ca.crt (CN=CA-LAB22-${XYZ})"
