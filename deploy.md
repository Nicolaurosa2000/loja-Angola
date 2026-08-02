# Angola Express — Guia de Deploy

## Visão Geral

A Angola Express é uma aplicação fullstack de e-commerce composta por:

| Componente | Stack | Onde roda |
|-----------|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + PWA | Estático (Vercel / Render Static) |
| **Backend** | Node.js + Express + TypeScript + Prisma ORM | Render (Web Service) |
| **Banco de Dados** | PostgreSQL (Supabase) | Supabase (nuvem) |
| **Imagens** | Supabase Storage (bucket público `products`) | Supabase (nuvem) |
| **Auth** | JWT + Refresh Token + BCrypt + RBAC | Backend |

O deploy é totalmente na nuvem: backend e frontend na Render/Vercel e dados (banco + imagens) no Supabase. Não é necessário VPS.

---

## Pré-requisitos

- Conta na **Render** (https://render.com)
- Conta no **Supabase** (https://supabase.com) com um projeto criado
- Repositório no **GitHub** (ex.: `Nicolaurosa2000/loja-Angola`)
- Git instalado localmente

---

## Passo 1 — Preparar o Supabase

### 1.1 Criar o projeto

1. No dashboard do Supabase, clica em **New Project** e cria um projeto na região `eu-west-3` (Paris).
2. Anota a **project ref** (ex.: `yvrprvnbqcdwghnidmwl`).

### 1.2 Obter as credenciais da base de dados

1. Acede a **Project Settings → Database → Connection string**.
2. Ativa o **Connection pooling** (Supavisor).
3. Copia a **URI de ligação** (transacional/session, porta 5432):
   ```
   postgresql://postgres.<ref>:<password>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require
   ```
   - `DATABASE_URL` → esta URI (usada em runtime pelo Prisma).
   - `DIRECT_URL` → a mesma URI (ou a ligação direta se não estiveres por trás de firewall).

### 1.3 Obter as credenciais do Storage

1. Acede a **Project Settings → API**.
2. Copia o **Project URL** → `SUPABASE_URL` (ex.: `https://<ref>.supabase.co`).
3. Copia a **service role / secret key** → `SUPABASE_KEY` (formato `sb_secret_...`).

### 1.4 Criar o bucket de imagens

1. Acede a **Storage → New bucket**.
2. Nome: `products`.
3. **Importante:** ativa **Public bucket** (as imagens são servidas sem autenticação).

---

## Passo 2 — Configurar o Backend Localmente

### 2.1 Instalar dependências

```bash
cd backend
npm install
```

### 2.2 Criar o ficheiro `.env`

Copia o `.env.example` e preenche com os valores do Supabase (Passo 1):

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api

DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require"

JWT_SECRET=gerar-secret-longa
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=gerar-outra-secret-longa
JWT_REFRESH_EXPIRES_IN=7d

SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_KEY=sb_secret_...

CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=30
```

> **Nota:** o ficheiro `.env` está no `.gitignore` e **nunca** deve ser commitado.

### 2.3 Aplicar as migrations e popular com dados (opcional)

```bash
npx prisma migrate deploy   # aplica as migrations ao Supabase
npx tsx src/database/seed/index.ts  # popula dados de exemplo
```

### 2.4 Testar localmente

```bash
npm run build
npm start                    # http://localhost:3000
```

---

## Passo 3 — Deploy do Backend na Render

### 3.1 Via Blueprint (recomendado)

O repositório já contém o ficheiro `render.yaml` na raiz com toda a configuração.

1. Na Render: **New → Blueprint**.
2. Liga o repositório `loja-Angola` do GitHub.
3. A Render lê o `render.yaml` e cria o serviço `angola-express-backend`.
4. Preenche as variáveis de ambiente marcadas como `sync: false` (ver Passo 4).
5. Clica em **Apply**.

O `render.yaml` define:

```yaml
services:
  - type: web
    name: angola-express-backend
    runtime: node
    rootDir: backend
    plan: free
    buildCommand: npm install --include=dev && npx prisma generate && npx prisma migrate deploy && npm run build
    startCommand: node dist/server.js
    healthCheckPath: /health
    autoDeploy: true
    envVars: ...
```

### 3.2 Via Web Service manual

Caso prefiras criar manualmente: **New → Web Service → seleciona o repo**.

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Environment** | Node |
| **Build Command** | `npm install --include=dev && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command** | `node dist/server.js` |
| **Health Check Path** | `/health` |

### 3.3 Notas importantes (free tier)

- O free tier **não suporta `preDeployCommand`** — por isso as migrations correm no comando de build (são idempotentes).
- A Render define `NODE_ENV=production` durante a build, o que faz o `npm install` omitir as `devDependencies`. Por isso:
  - O build usa `--include=dev`; e
  - `typescript`, `prisma` e os `@types/*` vivem em `dependencies` (não `devDependencies`).
- A versão do Node é controlada pelo campo `engines` (`>=20`) no `backend/package.json`.

---

## Passo 4 — Variáveis de Ambiente no Dashboard

No serviço `angola-express-backend` → **Environment**, define:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | URI do pooler Supabase (com `sslmode=require`) |
| `DIRECT_URL` | URI do pooler Supabase |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_KEY` | chave `sb_secret_...` |
| `JWT_SECRET` | gerar longa (`openssl rand -base64 48`) |
| `JWT_REFRESH_SECRET` | gerar outra longa |
| `CORS_ORIGIN` | URL do frontend em produção (ex.: `https://loja.vercel.app`) |
| `NODE_ENV` | `production` (definido automaticamente) |

> **Segurança:** usa secrets reais em produção — nunca os valores de exemplo do `.env.example`. Se a chave `sb_secret` foi partilhada em algum canal, **rotaciona-a** no Supabase (Settings → API → New key).

---

## Passo 5 — Deploy do Frontend

### 5.1 Configurar a URL da API

O frontend usa `VITE_API_URL`. No ambiente de build define:

```bash
VITE_API_URL=https://angola-express-backend.onrender.com/api
```

Sem esta variável, os fallbacks em `frontend/src/services/api.ts` e `frontend/src/utils/format.ts` apontam para `https://angola-express-backend.onrender.com`.

### 5.2 Build

```bash
cd frontend
npm install
npm run build    # gera a pasta dist/
```

### 5.3 Hosting

- **Vercel:** importa o repo, define `VITE_API_URL`, build command `npm run build`, output `dist`.
- **Render Static Site:** serviço estático com root `frontend`, build `npm install && npm run build`, publish `dist`.

---

## Passo 6 — Verificação

```bash
# 1. Health check do backend
curl https://angola-express-backend.onrender.com/health
# → {"success":true,"message":"API is running",...}

# 2. API docs (Swagger)
# Abrir no browser: https://angola-express-backend.onrender.com/api-docs

# 3. Dados reais
curl https://angola-express-backend.onrender.com/api/categories
curl https://angola-express-backend.onrender.com/api/products

# 4. Imagens (devem vir do Supabase Storage)
# https://<ref>.supabase.co/storage/v1/object/public/products/uploads/<ficheiro>
```

---

## Passo 7 — Manutenção

### 7.1 Actualizações de código

```bash
git pull origin main        # o push para main dispara auto-deploy na Render
```

### 7.2 Alterações ao `render.yaml`

A Render **não** reaplica automaticamente alterações ao `render.yaml` num serviço já existente. Depois de alterar o ficheiro:

1. Faz push das alterações.
2. Na Render: **Blueprints → o teu blueprint → Sync**.

### 7.3 Novas migrations

Como as migrations correm no comando de build, basta:

```bash
cd backend
npx prisma migrate dev       # cria a migration localmente
git add prisma/migrations && git commit && git push
# a Render aplica a migration no próximo deploy
```

### 7.4 Backups

Configura backups no Supabase (Dashboard → Database → Backups) antes de receberes dados reais.

---

## Checklist Rápido de Deploy

| Tarefa | Status |
|--------|--------|
| Projeto Supabase criado (região eu-west-3) | ☐ |
| Credenciais `DATABASE_URL`/`DIRECT_URL` obtidas | ☐ |
| Bucket `products` público criado | ☐ |
| Backend `.env` configurado | ☐ |
| Backend deployado na Render (Blueprint/Web Service) | ☐ |
| Env vars no dashboard preenchidas | ☐ |
| `JWT_SECRET`/`JWT_REFRESH_SECRET` gerados novos | ☐ |
| Frontend build com `VITE_API_URL` correcta | ☐ |
| `/health` responde | ☐ |
| `/api-docs` acessível | ☐ |
| Imagens dos produtos carregam (Supabase Storage) | ☐ |

---

## Notas Importantes

- **Secrets:** nunca uses placeholders em produção; rotaciona qualquer secret partilhada.
- **`.env`:** nunca commitado — está no `.gitignore`.
- **Bucket público:** necessário para as URLs públicas do Storage funcionarem.
- **CORS:** em produção, `CORS_ORIGIN` deve apontar para o domínio real do frontend.
- **Trust proxy:** o backend define `app.set("trust proxy", 1)` em produção para o rate limiter ver o IP real do cliente (a app inteira fica limitada por utilizador, não por proxy).
- **Ficheiros antigos:** os registos antigos que apontavam para `/uploads/...` foram migrados para o Supabase Storage (`backend/scripts/migrate-images-to-supabase.ts`).
