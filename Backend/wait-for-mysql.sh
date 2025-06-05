#!/bin/sh
# wait-for-mysql.sh
set -e
host="$1"
shift
until nc -z "$host" 3306; do
  echo "Esperando a que MySQL ($host:3306) esté disponible..."
  sleep 2
done
exec "$@"
