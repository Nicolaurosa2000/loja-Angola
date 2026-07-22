# Angola Express — Plataforma de E-commerce

> Loja virtual completa, moderna, escalável e segura para o mercado angolano.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + React Router + Axios + React Hook Form + Zod + Context API + React Query |
| Backend | Node.js + Express + TypeScript + Prisma ORM |
| Banco | MySQL (XAMPP — desenvolvimento) / MySQL (produção) |
| Auth | JWT + Refresh Token + BCrypt + RBAC |
| Pagamento | PaymentService (abstração) + Multicaixa Express (fluxo WhatsApp) |
| Deploy | VPS (Linode/DigitalOcean) |

---

## Fases de Desenvolvimento

### ✅ FASE 1 — Fundação (Concluída)

- Setup monorepo (`backend/`, `frontend/`, `docs/`)
- Configuração TypeScript, Vite, Express, Prisma
- Schema do banco completo (19 models — User, Role, Permission, Category, Brand, Product, ProductImage, ProductTag, ProductRelation, ProductReview, Address, Cart, CartItem, WishlistItem, Coupon, Order, OrderItem, PaymentTransaction, Banner, NewsletterSubscriber, Setting, Upload, AuditLog)
- Autenticação JWT + Refresh Token + RBAC
- Estrutura base do frontend (layouts, rotas, providers)
- Middlewares: auth, rate-limit, validação (Zod), error-handler, auditoria
- Swagger/OpenAPI docs
- Pagination, helpers, utils
- Seed: 2 users, 8 categorias, 3 marcas, 5 produtos, 3 banners, configurações

### ✅ FASE 2 — Catálogo (Concluída)

- CRUD completo de categorias (com subcategorias)
- CRUD completo de produtos (com imagens, tags)
- CRUD completo de marcas
- Pesquisa inteligente com filtros (preço, categoria, marca, ordenação)
- Rotas admin protegidas (RBAC: ADMIN/STAFF)
- Páginas públicas: Home, Produtos (com filtros), Detalhe do Produto
- Páginas admin: Dashboard, Gestão de Produtos, Categorias, Marcas
- Endpoints testados e funcionando

### ✅ FASE 3 — Cliente (Concluída)

- [x] Registo e Login completos
- [x] Perfil do cliente (editar dados — `PATCH /auth/me`)
- [x] Gestão de endereços (CRUD — `GET|POST|PUT|DELETE /addresses`)
- [x] Lista de desejos (favoritos — `GET|POST|DELETE /wishlist`)
- [x] Histórico de pedidos (`GET|POST /orders`, `GET /orders/:id`)
- [x] Carrinho persistente (autenticado — `GET|POST|PATCH|DELETE /cart`)
- [x] Cupões de desconto no carrinho
- [x] Checkout funcional (endereço → método pagamento → confirmação)
- [x] Botão "Adicionar aos favoritos" na página do produto
- [x] Área de Cliente: Perfil, Endereços, Pedidos (com detalhes), Favoritos

### ✅ FASE 4 — Pagamento (Concluída)

- [x] PaymentService (interface abstrata — `IPaymentService`)
- [x] Fluxo Multicaixa Express:
  - Mobile: deep link `multicaixaexpress://pay?amount=X&reference=Y`
  - Desktop: recibo + WhatsApp pré-preenchido (`wa.me` link)
- [x] Cash on Delivery (pagamento na entrega)
- [x] Página de confirmação com recibo e instruções de pagamento
- [x] Admin: listar todos os pedidos (`GET /admin/orders`)
- [x] Admin: atualizar estado do pedido (`PATCH /admin/orders/:id/status`)
- [x] Admin: atualizar estado do pagamento (`PATCH /admin/orders/:id/payment`)
- [x] Admin: UI completa para gestão de pedidos (filtros, search, paginação)
- [x] Botão "Enviar Comprovativo via WhatsApp" no detalhe do pedido
- [x] Carrinho limpo + stock decrementado após confirmação do pedido

### ✅ FASE 5 — Admin Completo (Concluída)

- [x] Dashboard com métricas e gráficos (vendas totais, pedidos, clientes, receita por período, últimos pedidos, top produtos)
- [x] Gestão de Pedidos (status workflow — feito na Fase 4)
- [x] Gestão de Clientes (listar, pesquisar, bloquear/desbloquear)
- [x] Gestão de Utilizadores (CRUD completo para STAFF/ADMIN + RBAC)
- [x] Gestão de Estoque (stock tracking via produtos — campo `stock` + `minStock`)
- [x] Promoções e Cupons (CRUD completo: PERCENTAGE | FIXED, validação de datas/limites)
- [x] Gestão de Banners (CRUD: HERO/SIDEBAR/PROMO, ordenação, ativação)
- [x] Gestão de Avaliações (listar, aprovar/rejeitar)
- [x] Newsletter (listar subscritores, remover)
- [x] Configurações da loja (key-value agrupadas por grupo: geral, checkout, shipping)

### ✅ FASE 6 — Extras & Performance (Concluída)

- [x] SEO completo: Open Graph, Twitter Cards, react-helmet-async em todas as páginas, meta tags dinâmicas (título, descrição, imagem)
- [x] PWA: vite-plugin-pwa com manifest.webmanifest, service worker (Workbox), runtime caching para API e uploads, ícones
- [x] Upload de imagens com compressão (sharp): controller + rotas REST, FileUploader component (frontend), static serving
- [x] Lazy loading + Code splitting: React.lazy() em todas as páginas, 32 chunks individuais, bundle principal reduzido de 458KB → 274KB
- [x] Cache e compressão: compression (Gzip/Brotli) no Express, Cache-Control headers para /api/products, /api/categories, /uploads
- [x] Relatórios: 5 endpoints admin (/admin/reports/product-sales, customer-orders, daily-sales, payment-methods, stock)
- [x] Logs de auditoria detalhados: IP, user-agent, params, URL, ação detetada, entidade extraída
- [x] Testes: Vitest + supertest configurados, 3 testes a passar (health + auth)

---

## Como Executar

```bash
# 0. Requisitos: XAMPP com MySQL ligado (porta 3306)

# 1. Backend
cd backend
npm install
npx prisma db push             # Cria as 23 tabelas no MySQL
npx tsx src/database/seed/index.ts  # Popula dados de exemplo
npx tsx src/server.ts          # http://localhost:3000

# 2. Frontend
cd frontend
npm install
npm run dev                    # http://localhost:5173

# 3. Documentação API
# http://localhost:3000/api-docs
```

## Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@angolaexpress.co.ao | admin123 |
| Cliente | cliente@teste.co.ao | admin123 |

---

## Estrutura do Projeto

```
angola-express/
├── backend/
│   ├── prisma/schema.prisma       # Schema do banco
│   ├── src/
│   │   ├── config/                # App, DB, Logger, Swagger
│   │   ├── controllers/           # Auth, Product, Category, Brand
│   │   ├── middlewares/           # Auth, RBAC, Rate-Limit, Validation, Error
│   │   ├── repositories/          # Data access layer
│   │   ├── routes/                # auth, product, category, brand, admin
│   │   ├── services/              # auth, product, category, brand, payment, upload
│   │   ├── dto/                   # Zod schemas
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── utils/                 # Helpers, pagination, slug, response
│   │   ├── database/seed/         # Seed data
│   │   ├── app.ts / server.ts     # Entry point
│   │   ├── uploads/               # File storage
│   │   └── logs/                  # Winston logs
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/            # UI, Layout, Shared
│   │   ├── contexts/              # AuthContext, CartContext
│   │   ├── layouts/               # Store, Admin, Auth
│   │   ├── pages/                 # store/, auth/, account/, admin/
│   │   ├── routes/                # Protected route guards
│   │   ├── services/              # API clients (Axios)
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Formatters, validators
│   │   └── styles/                # Tailwind globals
│   └── ...
└── docs/
```

---

## Funcionalidades da Loja

### Página Inicial
- Banner principal (carrossel)
- Produtos em destaque
- Categorias
- Produtos mais vendidos

### Produtos
- Nome, descrição, preço, SKU, stock
- Imagens, tags, avaliações
- Preço promocional
- Categoria e subcategoria

### Pesquisa
- Por nome, descrição, SKU, tags
- Filtros por preço, categoria, marca
- Ordenação (preço, nome, data)

### Carrinho
- Adicionar/remover/alterar quantidade
- Aplicar cupom de desconto
- Cálculo de subtotal, desconto, total

### Checkout
- 5 etapas: Endereço → Entrega → Revisão → Pagamento → Confirmação
- Multicaixa Express (WhatsApp) ou Pagamento na Entrega

### Conta do Cliente
- Perfil, endereços, pedidos, favoritos

### Área Administrativa
- Dashboard com métricas (vendas, pedidos, clientes, receita por período, top produtos, últimos pedidos)
- Gestão completa: Produtos, Categorias, Marcas, Pedidos, Clientes, Utilizadores
- Cupons de desconto (CRUD: percentual, fixo, com validação de prazos e limites)
- Banners (CRUD: HERO, SIDEBAR, PROMO com ordenação)
- Avaliações de produtos (aprovação/rejeição)
- Newsletter (gestão de subscritores)
- Configurações da loja (key-value agrupadas por grupo)
- RBAC (ADMIN, STAFF, CUSTOMER)

---

## Segurança

- JWT + Refresh Token (httpOnly)
- BCrypt (salt rounds = 12)
- Rate limiting por IP/rota
- Helmet (headers de segurança)
- CORS whitelist
- Validação de entrada (Zod)
- RBAC por cargo
- Soft delete em todas as tabelas
- Logs de auditoria

---

## Próximas Integrações Previstas

- Multicaixa Express (API oficial)
- EMIS
- Unitel Money
- Afrimoney
- Correios de Angola
- Transportadoras privadas
- Gateways internacionais (Stripe, PayPal)
- ERP / CRM
- Marketplaces
