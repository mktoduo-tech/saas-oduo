#########################################
# Script de Backup Automático do PostgreSQL (Windows)
#
# Uso: .\scripts\backup-database.ps1
#
# Requer: pg_dump no PATH
# Configurar DATABASE_URL no .env
#########################################

# Carregar variáveis de ambiente do .env
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Obter DATABASE_URL
$DB_URL = $env:DATABASE_URL

if (-not $DB_URL) {
    Write-Host "❌ DATABASE_URL não encontrada. Configure no .env" -ForegroundColor Red
    exit 1
}

# Parse DATABASE_URL
# Formato: postgresql://user:password@host:port/database
$DB_URL -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)' | Out-Null
$DB_USER = $matches[1]
$DB_PASS = $matches[2]
$DB_HOST = $matches[3]
$DB_PORT = $matches[4]
$DB_NAME = $matches[5]

# Configurações de backup
$BACKUP_DIR = "backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\backup_${DB_NAME}_${TIMESTAMP}.sql"
$BACKUP_FILE_GZ = "$BACKUP_FILE.gz"

# Criar diretório de backups se não existir
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 Iniciando backup do banco de dados..." -ForegroundColor Cyan
Write-Host "📊 Banco: $DB_NAME"
Write-Host "🖥️  Host: ${DB_HOST}:${DB_PORT}"
Write-Host "📁 Arquivo: $BACKUP_FILE_GZ"

# Configurar senha do PostgreSQL
$env:PGPASSWORD = $DB_PASS

# Executar backup
try {
    & pg_dump `
        -h $DB_HOST `
        -p $DB_PORT `
        -U $DB_USER `
        -d $DB_NAME `
        --no-owner `
        --no-acl `
        --clean `
        --if-exists `
        -f $BACKUP_FILE

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump falhou com código $LASTEXITCODE"
    }

    Write-Host "📦 Comprimindo backup..." -ForegroundColor Cyan

    # Comprimir usando .NET (gzip)
    $sourceStream = [System.IO.File]::OpenRead($BACKUP_FILE)
    $destStream = [System.IO.File]::Create($BACKUP_FILE_GZ)
    $gzipStream = New-Object System.IO.Compression.GzipStream($destStream, [System.IO.Compression.CompressionMode]::Compress)

    $sourceStream.CopyTo($gzipStream)

    $gzipStream.Close()
    $destStream.Close()
    $sourceStream.Close()

    # Remover arquivo SQL não comprimido
    Remove-Item $BACKUP_FILE

    # Calcular tamanho do arquivo
    $FILE_SIZE = (Get-Item $BACKUP_FILE_GZ).Length / 1MB
    $FILE_SIZE_STR = "{0:N2} MB" -f $FILE_SIZE

    Write-Host "✅ Backup concluído com sucesso!" -ForegroundColor Green
    Write-Host "📦 Tamanho: $FILE_SIZE_STR"
    Write-Host "📁 Local: $BACKUP_FILE_GZ"

    # Limpar backups antigos (manter últimos 7 dias)
    Write-Host "🧹 Limpando backups antigos (mantendo últimos 7 dias)..." -ForegroundColor Cyan
    $cutoffDate = (Get-Date).AddDays(-7)
    Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.sql.gz" |
        Where-Object { $_.LastWriteTime -lt $cutoffDate } |
        Remove-Item

    # Contar backups restantes
    $BACKUP_COUNT = (Get-ChildItem -Path $BACKUP_DIR -Filter "backup_*.sql.gz").Count
    Write-Host "📊 Total de backups armazenados: $BACKUP_COUNT"

    Write-Host "✨ Processo finalizado!" -ForegroundColor Green

} catch {
    Write-Host "❌ Erro durante o backup: $_" -ForegroundColor Red
    exit 1
} finally {
    # Limpar senha da memória
    Remove-Item -Path "env:PGPASSWORD" -ErrorAction SilentlyContinue
}
