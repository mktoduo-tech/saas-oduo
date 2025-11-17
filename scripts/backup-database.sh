#!/bin/bash

#########################################
# Script de Backup Automático do PostgreSQL
#
# Uso: ./scripts/backup-database.sh
#
# Requer: pg_dump instalado
# Configurar DATABASE_URL no .env
#########################################

set -e

# Carregar variáveis de ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Extrair dados de conexão do DATABASE_URL
# Formato: postgresql://user:password@host:port/database
DB_URL=${DATABASE_URL:-$1}

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL não encontrada. Configure no .env ou passe como argumento."
    exit 1
fi

# Parse DATABASE_URL
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Configurações de backup
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Criar diretório de backups se não existir
mkdir -p $BACKUP_DIR

echo "🔄 Iniciando backup do banco de dados..."
echo "📊 Banco: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "📁 Arquivo: $BACKUP_FILE_GZ"

# Executar backup
PGPASSWORD=$DB_PASS pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > $BACKUP_FILE

# Comprimir backup
echo "📦 Comprimindo backup..."
gzip $BACKUP_FILE

# Calcular tamanho do arquivo
FILE_SIZE=$(du -h $BACKUP_FILE_GZ | cut -f1)

echo "✅ Backup concluído com sucesso!"
echo "📦 Tamanho: $FILE_SIZE"
echo "📁 Local: $BACKUP_FILE_GZ"

# Limpar backups antigos (manter últimos 7 dias)
echo "🧹 Limpando backups antigos (mantendo últimos 7 dias)..."
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Contar backups restantes
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | wc -l)
echo "📊 Total de backups armazenados: $BACKUP_COUNT"

echo "✨ Processo finalizado!"
