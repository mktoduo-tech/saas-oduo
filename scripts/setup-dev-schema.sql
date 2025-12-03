-- ===========================================
-- Script para criar schema de desenvolvimento
-- Execute no Supabase SQL Editor
-- ===========================================

-- 1. Criar schema dev
CREATE SCHEMA IF NOT EXISTS dev;

-- 2. Dar permissões ao usuário postgres
GRANT ALL ON SCHEMA dev TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA dev TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dev TO postgres;

-- 3. Comentário para documentação
COMMENT ON SCHEMA dev IS 'Schema para ambiente de desenvolvimento/staging';

-- ===========================================
-- IMPORTANTE:
-- ===========================================
-- Após executar este script:
-- 1. Configure a variável DATABASE_URL no ambiente de preview da Vercel:
--    DATABASE_URL="postgresql://USER:PASS@HOST:6543/postgres?pgbouncer=true&schema=dev"
--
-- 2. Rode as migrations no schema dev:
--    DATABASE_URL="postgresql://...?schema=dev" npx prisma migrate deploy
--
-- 3. (Opcional) Copie dados de teste do schema public:
--    -- Faça isso manualmente ou com um script de seed
-- ===========================================

-- 4. Verificar se foi criado
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'dev';
