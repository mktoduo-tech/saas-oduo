# 🚀 Guia de Ambientes - Dev e Produção

Este documento explica como funciona a separação de ambientes de desenvolvimento e produção no projeto SaaS ODuoLoc.

## 📋 Índice

- [Estrutura de Branches](#estrutura-de-branches)
- [Ambientes na Vercel](#ambientes-na-vercel)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Banco de Dados](#banco-de-dados)
- [Deploys](#deploys)

---

## 🌳 Estrutura de Branches

### Branch `main` (Produção)
- **URL:** https://oduoloc.com.br
- **Ambiente:** Produção
- **Deploy:** Automático ao fazer push/merge
- **Banco de Dados:** Supabase - Schema `public` (produção)
- **Uso:** Apenas código testado e aprovado

### Branch `dev` (Desenvolvimento)
- **URL:** https://saas-oduo-dev.vercel.app (ou URL de preview da Vercel)
- **Ambiente:** Development/Staging
- **Deploy:** Automático ao fazer push
- **Banco de Dados:** Supabase - Schema `dev` (ou banco separado)
- **Uso:** Desenvolvimento e testes

---

## 🌐 Ambientes na Vercel

### Configuração no Dashboard da Vercel

1. **Projeto Principal** (se ainda não existe)
   - Nome: `saas-oduo`
   - Production Branch: `main`
   - Framework: Next.js

2. **Configurar Domínios**
   - **Produção (main):** oduoloc.com.br
   - **Dev (dev):** saas-oduo-dev.vercel.app (URL automática da Vercel)

   > 💡 **Opcional:** Configure um subdomínio personalizado como `dev.oduoloc.com.br`

---

## 🔐 Variáveis de Ambiente

### Como Configurar na Vercel

1. Acesse: Vercel Dashboard → Seu Projeto → **Settings** → **Environment Variables**

2. Para cada variável, selecione em qual ambiente ela será usada:
   - ✅ **Production** (branch `main`)
   - ✅ **Preview** (branch `dev` e outros)
   - ⬜ **Development** (local)

### Variáveis que DEVEM ser diferentes:

| Variável | Produção | Desenvolvimento |
|----------|----------|-----------------|
| `NEXTAUTH_URL` | `https://oduoloc.com.br` | `https://saas-oduo-dev.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://oduoloc.com.br` | `https://saas-oduo-dev.vercel.app` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `oduoloc.com.br` | `saas-oduo-dev.vercel.app` |
| `DATABASE_URL` | Prod DB | Dev DB ou schema `dev` |
| `DIRECT_URL` | Prod DB | Dev DB ou schema `dev` |
| `ASAAS_ENVIRONMENT` | `PRODUCTION` | `SANDBOX` |
| `ASAAS_API_KEY` | Chave PROD | Chave SANDBOX |

### Variáveis que podem ser IGUAIS:

- `AUTH_SECRET`
- `CLOUDINARY_*` (ou criar conta separada para dev)
- `RESEND_API_KEY` (ou criar projeto separado)
- `FISCAL_ENCRYPTION_KEY`

---

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento Local

```bash
# Trabalhe no branch dev
git checkout dev

# Faça suas alterações
# ... edite arquivos ...

# Commit
git add .
git commit -m "feat: nova funcionalidade"

# Push para branch dev (vai criar deploy de preview)
git push origin dev
```

### 2. Testando no Ambiente de Dev

1. Após o push, a Vercel cria um deploy automático
2. Acesse a URL de preview (comentário no GitHub ou dashboard da Vercel)
3. Teste a funcionalidade no ambiente de dev
4. Se houver problemas, corrija e faça novo push no `dev`

### 3. Promovendo para Produção

```bash
# Certifique-se que está no branch dev atualizado
git checkout dev
git pull origin dev

# Mude para main
git checkout main
git pull origin main

# Merge do dev para main
git merge dev

# Push para produção (vai fazer deploy automático)
git push origin main
```

### 4. Hotfix Urgente em Produção

```bash
# Crie branch de hotfix a partir do main
git checkout main
git checkout -b hotfix/nome-do-problema

# Faça a correção
# ... edite arquivos ...

# Commit
git commit -m "fix: correção urgente"

# Merge direto no main
git checkout main
git merge hotfix/nome-do-problema
git push origin main

# Não esqueça de atualizar o dev também!
git checkout dev
git merge main
git push origin dev

# Delete o branch de hotfix
git branch -d hotfix/nome-do-problema
```

---

## 🗄️ Banco de Dados

### Opção 1: Schemas Separados (RECOMENDADO)

Use o mesmo banco Supabase, mas schemas diferentes:

- **Produção:** Schema `public` (padrão)
- **Dev:** Schema `dev`

#### Como criar o schema dev:

```sql
-- Execute no Supabase SQL Editor (apenas uma vez)
CREATE SCHEMA IF NOT EXISTS dev;

-- Copie todas as tabelas de public para dev (opcional)
-- Ou rode as migrations no schema dev
```

#### Configurar no Prisma:

```env
# .env.development
DATABASE_URL="postgresql://...?schema=dev"

# .env.production
DATABASE_URL="postgresql://...?schema=public"
```

#### Rodar migrations no schema dev:

```bash
# Dev
DATABASE_URL="postgresql://...?schema=dev" npx prisma migrate dev

# Prod
DATABASE_URL="postgresql://...?schema=public" npx prisma migrate deploy
```

### Opção 2: Bancos de Dados Separados

Crie dois projetos no Supabase:
- `saas-oduo-prod`
- `saas-oduo-dev`

**Vantagens:** Isolamento total
**Desvantagens:** Custo duplicado, mais complexo

---

## 🚀 Deploys

### Deploy Automático

A Vercel faz deploy automático quando você:

1. **Push no `main`** → Deploy de Produção (oduoloc.com.br)
2. **Push no `dev`** → Deploy de Preview
3. **Pull Request** → Deploy de Preview para o PR

### Deploy Manual (se necessário)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy para produção
vercel --prod

# Deploy para preview
vercel
```

### Verificar Deploys

- Dashboard da Vercel: https://vercel.com/dashboard
- Logs em tempo real
- Rollback disponível se necessário

---

## 📝 Checklist: Configurar Ambiente pela Primeira Vez

### No GitHub/Git:

- [x] Branch `main` existe
- [x] Branch `dev` criado
- [ ] Push do branch `dev` para origin: `git push -u origin dev`

### Na Vercel:

- [ ] Projeto conectado ao repositório GitHub
- [ ] Production Branch definido como `main`
- [ ] Variáveis de ambiente de **Produção** configuradas (Environment: Production)
- [ ] Variáveis de ambiente de **Dev** configuradas (Environment: Preview)
- [ ] Domínio `oduoloc.com.br` configurado no branch `main`

### No Supabase:

- [ ] Schema `dev` criado (ou projeto dev separado)
- [ ] Migrations rodadas no schema dev
- [ ] Usuário de teste criado no banco dev

### Local:

- [ ] Arquivo `.env.local` configurado para desenvolvimento local
- [ ] Arquivo `.env.development` commitado (sem secrets!)
- [ ] Arquivo `.env.production.example` commitado como referência

---

## 🆘 Troubleshooting

### Deploy falhou na Vercel

1. Verifique os logs no dashboard da Vercel
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se o banco de dados está acessível

### Variável de ambiente não está funcionando

1. Na Vercel, verifique se a variável está marcada para o ambiente correto (Production/Preview)
2. Após adicionar/alterar variáveis, faça um novo deploy (Redeploy)
3. Variáveis `NEXT_PUBLIC_*` precisam de rebuild para serem atualizadas

### Banco de dados errado sendo usado

1. Verifique a variável `DATABASE_URL` no ambiente correto
2. Confirme o schema na connection string (`?schema=dev` ou `?schema=public`)
3. Cheque os logs do Prisma para ver qual DB está conectando

### Merge deu conflito

```bash
# Aborte o merge
git merge --abort

# Resolva conflitos manualmente
git checkout main
git merge dev
# ... resolva conflitos ...
git add .
git commit
git push origin main
```

---

## 📚 Recursos Adicionais

- [Documentação Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentação Prisma - Multiple Schemas](https://www.prisma.io/docs/concepts/components/prisma-schema/data-sources#multiple-schemas)
- [Supabase - Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

**Última atualização:** 2025-12-03
**Mantido por:** Equipe ODuoLoc
