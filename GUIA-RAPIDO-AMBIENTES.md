# ⚡ Guia Rápido: Configurar Ambientes Dev/Prod

> **Primeira venda feita? Hora de separar os ambientes!** 🎉

## 🎯 O que você precisa fazer AGORA

### 1️⃣ Push dos Branches (5 min)

```bash
# Você está no branch dev, commite as configurações
git add .
git commit -m "chore: configurar ambientes dev e prod"
git push -u origin dev

# Volte para main e faça push
git checkout main
git push origin main
```

### 2️⃣ Configurar Supabase - Schema Dev (10 min)

1. Acesse: https://supabase.com/dashboard/project/qiesufjousyxqejchhts/editor
2. Clique em **SQL Editor**
3. Cole e execute o script: `scripts/setup-dev-schema.sql`
4. Rode as migrations no schema dev:

```bash
DATABASE_URL="postgresql://postgres.qiesufjousyxqejchhts:kTO%5D%21%3DSzWdu%27cV-Jg3%7B%3D@db.qiesufjousyxqejchhts.supabase.co:5432/postgres?schema=dev" npx prisma migrate deploy
```

### 3️⃣ Configurar Vercel - Variáveis de Ambiente (15 min)

Acesse: https://vercel.com/dashboard → Seu Projeto → **Settings** → **Environment Variables**

#### Variáveis para PREVIEW (branch dev):

| Variável | Valor |
|----------|-------|
| `NEXTAUTH_URL` | `https://saas-oduo-dev.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://saas-oduo-dev.vercel.app` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `saas-oduo-dev.vercel.app` |
| `DATABASE_URL` | `postgresql://...?schema=dev` (adicione `&schema=dev` no final) |
| `DIRECT_URL` | `postgresql://...?schema=dev` |
| `ASAAS_ENVIRONMENT` | `SANDBOX` |

> ⚠️ **Importante:** Selecione apenas "Preview" para estas variáveis!

#### Variáveis para PRODUCTION (branch main):

Verifique se estão corretas (devem ter apenas "Production" marcado):

| Variável | Valor |
|----------|-------|
| `NEXTAUTH_URL` | `https://oduoloc.com.br` |
| `NEXT_PUBLIC_APP_URL` | `https://oduoloc.com.br` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `oduoloc.com.br` |
| `DATABASE_URL` | URL do banco PROD (sem `schema=dev`) |
| `DIRECT_URL` | URL do banco PROD (sem `schema=dev`) |
| `ASAAS_ENVIRONMENT` | `PRODUCTION` |

### 4️⃣ Testar o Fluxo (5 min)

```bash
# Faça uma mudança de teste no dev
git checkout dev
echo "# Teste" >> test.md
git add test.md
git commit -m "test: testar deploy dev"
git push origin dev
```

1. Aguarde o deploy na Vercel (1-2 min)
2. Acesse a URL de preview que aparece no dashboard
3. Verifique se está usando o banco DEV (confira no dashboard Supabase)

---

## 🔄 Fluxo do Dia a Dia

### Desenvolver Nova Feature:

```bash
git checkout dev
git pull origin dev
# ... faça suas alterações ...
git add .
git commit -m "feat: nova funcionalidade"
git push origin dev
# Testa no ambiente de preview
```

### Promover para Produção:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
# Deploy automático em oduoloc.com.br
```

---

## 🆘 Problemas Comuns

### "Variável não está funcionando"
→ Após alterar variável na Vercel, clique em **Redeploy** no último deploy

### "Conectou no banco errado"
→ Verifique se adicionou `?schema=dev` na URL do banco para Preview

### "Deploy falhou"
→ Veja os logs na Vercel Dashboard → Deployments → Seu Deploy → Logs

---

## 📚 Documentação Completa

Leia: [AMBIENTES.md](./AMBIENTES.md)

---

**Pronto! Agora você tem:**
- ✅ Branch `dev` para desenvolvimento
- ✅ Branch `main` para produção
- ✅ Bancos de dados separados (schemas)
- ✅ Deploy automático para ambos
- ✅ Variáveis de ambiente isoladas

**Próximos passos:**
- Configure alertas de erro (Sentry, LogRocket, etc.)
- Configure monitoramento (Vercel Analytics)
- Configure backup automático do banco de produção
