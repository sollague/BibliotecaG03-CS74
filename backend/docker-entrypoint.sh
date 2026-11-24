#!/bin/sh
set -e

mkdir -p /app/uploads/solicitudes

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "==> Esperando disponibilidad de la base de datos y aplicando migraciones..."
  MAX_RETRIES=15
  COUNT=0
  until npx prisma migrate deploy || [ $COUNT -ge $MAX_RETRIES ]; do
    echo "Base de datos no disponible aún. Reintentando en 2 segundos... ($COUNT/$MAX_RETRIES)"
    COUNT=$((COUNT + 1))
    sleep 2
  done
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "==> Ejecutando seed de base de datos..."
  node prisma/seed.js || echo "Aviso: Seed omitido o ya ejecutado."
fi

exec "$@"
