# Angola Express — Guia de Utilização

> Guia completo para executar, testar e utilizar a plataforma de e-commerce Angola Express.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Primeira Vez — Setup Inicial](#2-primeira-vez--setup-inicial)
3. [Executar o Projeto](#3-executar-o-projeto)
4. [Base de Dados](#4-base-de-dados)
5. [Credenciais de Teste](#5-credenciais-de-teste)
6. [Estrutura de Rotas](#6-estrutura-de-rotas)
7. [Fluxo da Loja](#7-fluxo-da-loja)
8. [Área Administrativa](#8-área-administrativa)
9. [Testes Automatizados](#9-testes-automatizados)
10. [Build para Produção](#10-build-para-produção)
11. [Solução de Problemas](#11-solução-de-problemas)

---

## 1. Requisitos

| Ferramenta | Versão Mínima |
|------------|---------------|
| Node.js | 18.x |
| npm | 9.x |
| Git | Qualquer |

---

## 2. Primeira Vez — Setup Inicial

### 2.1 Instalar dependências

```bash
# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd ../frontend
npm install
```

### 2.2 Configurar variáveis de ambiente

O ficheiro `backend/.env` já vem com valores predefinidos funcionais:

```
NODE_ENV=development
PORT=3000
API_PREFIX=/api
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> **Nota:** Em produção, altere as chaves JWT, configure a `DATABASE_URL` para MySQL e ajuste o `CORS_ORIGIN`.

### 2.3 Criar base de dados e popular

```bash
cd backend

# Criar as tabelas no banco
npx prisma db push

# Popular com dados de exemplo (admin, cliente, categorias, produtos, etc.)
npm run prisma:seed
```

---

## 3. Executar o Projeto

### 3.1 Iniciar Backend (terminal 1)

```bash
cd backend
npm run dev
```

A API fica disponível em: **http://localhost:3000**

- Health check: http://localhost:3000/health
- Documentação Swagger: http://localhost:3000/api-docs

### 3.2 Iniciar Frontend (terminal 2)

```bash
cd frontend
npm run dev
```

A loja fica disponível em: **http://localhost:5173**

O Vite faz proxy automático de `/api` e `/uploads` para o backend.

---

## 4. Base de Dados

### 4.1 Tecnologia

- **Desenvolvimento:** SQLite (ficheiro `backend/prisma/dev.db`)
- **Produção:** MySQL (configurar `DATABASE_URL` no `.env`)

### 4.2 Estado atual

A base de dados contém 23 modelos (tabelas):

| Modelo | Descrição |
|--------|-----------|
| User | Utilizadores (admin, staff, clientes) |
| Role / Permission | Controlo de permissões RBAC |
| Category / Subcategory | Categorias de produtos |
| Brand | Marcas |
| Product | Produtos com preço, stock, imagens |
| ProductImage | Imagens dos produtos (isCover, ordenação) |
| ProductTag | Tags para pesquisa |
| ProductRelation | Relações entre produtos (relacionados) |
| ProductReview | Avaliações de clientes |
| Address | Endereços dos clientes |
| Cart / CartItem | Carrinho de compras persistente |
| WishlistItem | Lista de desejos |
| Coupon / CouponUsage | Cupões de desconto |
| Order / OrderItem / OrderDiscount | Pedidos |
| PaymentTransaction | Transações de pagamento |
| Banner | Banners da loja |
| NewsletterSubscriber | Subscritores newsletter |
| Setting | Configurações chave-valor |
| Upload | Ficheiros enviados |
| AuditLog | Registo de auditoria |

> **Nota:** Todos os modelos suportam soft delete (campo `deletedAt`).

### 4.3 Comandos Prisma

```bash
# Ver dados no browser (interface gráfica)
npm run prisma:studio

# Criar nova migração
npx prisma migrate dev --name descricao

# Gerar cliente Prisma (após alterar schema)
npx prisma generate

# Aplicar migrações em produção
npx prisma migrate deploy

# Resetar base de dados (apaga tudo)
npx prisma db push --force-reset
npm run prisma:seed
```

---

## 5. Credenciais de Teste

| Tipo | Email | Senha | Acesso |
|------|-------|-------|--------|
| **Administrador** | admin@angolaexpress.co.ao | admin123 | Loja + Admin completo |
| **Cliente** | cliente@teste.co.ao | admin123 | Apenas loja |

---

## 6. Estrutura de Rotas

### 6.1 API Pública (`/api`)

| Rota | Métodos | Descrição |
|------|---------|-----------|
| `/auth/register` | POST | Registo de cliente |
| `/auth/login` | POST | Login |
| `/auth/refresh` | POST | Renovar token |
| `/auth/me` | GET, PATCH | Perfil do utilizador |
| `/auth/change-password` | POST | Alterar senha |
| `/products` | GET | Listar produtos (com filtros) |
| `/products/featured` | GET | Produtos em destaque |
| `/products/:slug` | GET | Detalhe do produto |
| `/categories` | GET | Listar categorias |
| `/categories/:slug/products` | GET | Produtos por categoria |
| `/brands` | GET | Listar marcas |
| `/cart` | GET | Ver carrinho |
| `/cart/items` | POST | Adicionar ao carrinho |
| `/cart/items/:id` | PATCH, DELETE | Atualizar/remover item |
| `/cart/coupon` | POST, DELETE | Aplicar/remover cupão |
| `/orders` | GET, POST | Listar/criar pedidos |
| `/orders/:id` | GET | Detalhe do pedido |
| `/addresses` | GET, POST | Listar/criar endereços |
| `/addresses/:id` | PUT, DELETE | Atualizar/remover endereço |
| `/wishlist` | GET | Ver favoritos |
| `/wishlist/:productId` | POST, DELETE | Adicionar/remover favorito |
| `/wishlist/count` | GET | Contar favoritos |
| `/uploads` | POST, DELETE | Upload de ficheiros (admin) |

### 6.2 API Administrativa (`/api/admin`) — requer autenticação ADMIN/STAFF

| Rota | Métodos | Descrição |
|------|---------|-----------|
| `/categories` | CRUD | Gestão de categorias |
| `/products` | CRUD | Gestão de produtos |
| `/brands` | CRUD | Gestão de marcas |
| `/orders` | GET | Listar pedidos |
| `/orders/:id` | GET | Detalhe do pedido |
| `/orders/:id/status` | PATCH | Atualizar estado |
| `/orders/:id/payment` | PATCH | Atualizar pagamento |
| `/dashboard/overview` | GET | Métricas do dashboard |
| `/dashboard/recent-orders` | GET | Últimos pedidos |
| `/dashboard/top-products` | GET | Produtos mais vendidos |
| `/dashboard/sales` | GET | Vendas por período |
| `/coupons` | CRUD | Gestão de cupões |
| `/banners` | CRUD | Gestão de banners |
| `/settings` | CRUD | Configurações da loja |
| `/settings/key/:key` | GET | Obter config por chave |
| `/customers` | GET | Listar clientes |
| `/customers/:id/toggle-active` | PATCH | Bloquear/ativar cliente |
| `/users` | CRUD | Gestão de utilizadores staff/admin |
| `/users/:id/toggle-active` | PATCH | Ativar/bloquear staff |
| `/reviews` | GET | Listar avaliações |
| `/reviews/:id/status` | PATCH | Aprovar/rejeitar avaliação |
| `/newsletter` | GET, DELETE | Gerir subscritores |
| `/reports/product-sales` | GET | Relatório de vendas por produto |
| `/reports/customer-orders` | GET | Relatório de clientes |
| `/reports/daily-sales` | GET | Vendas diárias |
| `/reports/payment-methods` | GET | Métodos de pagamento |
| `/reports/stock` | GET | Relatório de stock |

---

## 7. Fluxo da Loja

### 7.1 Navegação do Cliente

```
Home → Produtos (filtros) → Detalhe do Produto → Carrinho → Checkout → Confirmação
```

1. **Home** — Banner, produtos em destaque, categorias
2. **Produtos** — Grid com filtros por preço, categoria, marca, ordenação
3. **Detalhe** — Imagens, descrição, preço, avaliações, adicionar ao carrinho/favoritos
4. **Carrinho** — Gerir quantidades, aplicar cupão de desconto
5. **Checkout** — 3 passos: selecionar/novo endereço → método de pagamento → confirmar
6. **Confirmação** — Nº do pedido, recibo, instruções de pagamento

### 7.2 Métodos de Pagamento

| Método | Descrição |
|--------|-----------|
| **Multicaixa Express** | Gera recibo com IBAN + valor + referência. O cliente envia comprovativo via WhatsApp. Operador confirma manualmente no admin. |
| **Pagamento na Entrega** | Cash on delivery. Pedido é processado sem necessidade de confirmação de pagamento. |

### 7.3 Estados do Pedido

```
PENDING → PAID → SEPARATING → SHIPPED → IN_TRANSIT → DELIVERED
  ↓                                         ↓
CANCELLED                                REFUNDED
```

### 7.4 Conta do Cliente (`/conta`)

| Aba | Funcionalidades |
|-----|----------------|
| Perfil | Editar nome, email, telefone, avatar |
| Endereços | CRUD de endereços de entrega |
| Pedidos | Histórico com detalhes, link WhatsApp para comprovativo |
| Favoritos | Lista de produtos favoritos |

---

## 8. Área Administrativa

Acesso: **http://localhost:5173/admin** (apenas ADMIN/STAFF)

| Página | Funcionalidades |
|--------|----------------|
| **Dashboard** | Métricas: vendas, pedidos, clientes, receita por período, top produtos, últimos pedidos |
| **Produtos** | CRUD com imagens, tags, preço promocional, stock |
| **Pedidos** | Lista com filtros, detalhe, atualizar estado e pagamento |
| **Categorias** | CRUD com subcategorias |
| **Marcas** | CRUD de marcas |
| **Clientes** | Lista, pesquisa, bloquear/ativar |
| **Utilizadores** | CRUD de staff/admin com controlo RBAC |
| **Promoções** | CRUD de cupões (percentual/fixo, prazos, limites) |
| **Banners** | CRUD com preview de imagem |
| **Avaliações** | Lista, aprovar/rejeitar |
| **Newsletter** | Lista de subscritores, remover |
| **Configurações** | Chave-valor agrupadas (geral, checkout, shipping) |
| **Relatórios** | Vendas por produto, clientes, vendas diárias, métodos de pagamento, stock |

### 8.1 Workflow de Pagamento (Multicaixa Express)

1. Cliente faz checkout com Multicaixa Express
2. Cliente vê recibo com IBAN, valor e referência
3. Cliente clica "Enviar Comprovativo via WhatsApp"
4. Administrador recebe a notificação e confirma o pagamento no admin
5. Admin vai a **Pedidos** → detalhe do pedido → **Atualizar Pagamento** → **PAID**
6. O estado do pedido atualiza automaticamente para **PAID**

---

## 9. Testes Automatizados

```bash
cd backend

# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch
```

### Testes existentes

| Ficheiro | Testes |
|----------|--------|
| `tests/health.test.ts` | Health check retorna 200 |
| `tests/auth.test.ts` | Login válido retorna token; login inválido retorna 401 |

Para adicionar mais testes, criar ficheiros em `backend/tests/*.test.ts`.

---

## 10. Build para Produção

### Backend

```bash
cd backend
npm run build            # Compila TypeScript → dist/
npm run prisma:migrate:prod  # Aplicar migrações MySQL
npm start                # node dist/server.js
```

### Frontend

```bash
cd frontend
npm run build            # Gera dist/ com PWA + service worker
npm run preview          # Servir build localmente
```

O build do frontend gera:
- `dist/` — ficheiros estáticos (HTML, JS, CSS)
- `dist/sw.js` — Service Worker (Workbox)
- `dist/manifest.webmanifest` — Manifest PWA
- Múltiplos chunks JS (code splitting) para carregamento lazy

---

## 11. Solução de Problemas

### "Porta já em uso"

```bash
# No Windows, matar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Base de dados não encontrada"

```bash
cd backend
npx prisma db push
npm run prisma:seed
```

### "Erro de compilação TypeScript"

```bash
cd backend
npx tsc --noEmit          # Ver erros
cd ../frontend
npx tsc --noEmit          # Ver erros
```

### "Upload de ficheiros não funciona"

- Verificar se a pasta `backend/uploads/` existe
- Verificar permissões de escrita
- O proxy do Vite encaminha `/uploads` para o backend

### "PWA não regista"

- O service worker só funciona em produção (`npm run build` + `npm run preview`)
- Em desenvolvimento (`npm run dev`), o PWA não é ativado

---

## Comandos Rápidos

```bash
# Iniciar tudo (desenvolvimento)
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2

# Resetar base de dados
cd backend
npx prisma db push --force-reset
npm run prisma:seed

# Ver dados
cd backend && npm run prisma:studio

# Testar
cd backend && npm test

# Build produção
cd backend && npm run build
cd frontend && npm run build
```
