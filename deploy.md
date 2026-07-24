# Angola Express — Guia de Deploy

## Visão Geral

O projecto Angola Express é uma aplicação fullstack de e-commerce composta por:

| Componente | Stack | Porta |
|-----------|-------|-------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + PWA | Estático (servido por Nginx) |
| **Backend** | Node.js + Express + TypeScript + Prisma ORM | 3000 |
| **Banco de Dados** | MySQL | 3306 |

---

## Pré-requisitos

- VPS com **Ubuntu 22.04 LTS** (ou similar)
- Acesso SSH ao servidor
- Um domínio/subdomínio apontado para o IP do servidor
- MySQL 8.0+ instalado e configurado no servidor
- Node.js **20.x** ou superior instalado no servidor
- npm **10.x** ou superior
- Git instalado no servidor

---

## Passo 1 — Preparar o Servidor

### 1.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar dependências essenciais

```bash
sudo apt install -y git curl build-essential wget
```

### 1.3 Instalar Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verificar a instalação:

```bash
node -v
npm -v
```

### 1.4 Instalar MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Criar o banco de dados e utilizador:

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE angola_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'angola_express'@'localhost' IDENTIFIED BY 'SUA_SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON angola_express.* TO 'angola_express'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Passo 2 — Clonar o Repositório

```bash
cd /var/www
git clone https://github.com/seu-usuario/angola-express.git
cd angola-express
```

Ou, se pretende usar uma pasta diferente:

```bash
sudo mkdir -p /opt/angola-express
sudo chown -R $USER:$USER /opt/angola-express
cd /opt/angola-express
git clone https://github.com/seu-usuario/angola-express.git .
```

---

## Passo 3 — Configurar o Backend

### 3.1 Instalar dependências do backend

```bash
cd backend
npm install
```

### 3.2 Criar o ficheiro `.env`

Copie o ficheiro de exemplo e adapte para produção:

```bash
cp .env.example .env
```

Edite o `.env` com os valores de produção:

```env
NODE_ENV=production
PORT=3000
API_PREFIX=/api
DATABASE_URL="mysql://angola_express:SUA_SENHA_SEGURA_AQUI@localhost:3306/angola_express"
JWT_SECRET=COLOQUE_UMA_SECRET_LONGA_E_UNICA_AQUI
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=COLOQUE_OUTRA_SECRET_LONGA_E_UNICA_AQUI
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-dominio.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Nota:** Nunca commite o ficheiro `.env` ao repositório — ele já está no `.gitignore`.

### 3.3 Gerar o client Prisma e migrar o banco

```bash
npx prisma generate
npx prisma migrate deploy
```

### 3.4 (Opcional — Popular com dados iniciais)

Se precisar de dados seed para o ambiente de produção:

```bash
npx tsx src/database/seed/index.ts
```

### 3.5 Compilar o backend

```bash
npm run build
```

Isto gera a pasta `dist/` com o código compilado em JavaScript.

---

## Passo 4 — Configurar o Frontend

### 4.1 Instalar dependências do frontend

```bash
cd ../frontend
npm install
```

### 4.2 Construir o frontend para produção

```bash
npm run build
```

Isto gera a pasta `dist/` com os ficheiros estáticos (HTML, CSS, JS).

---

## Passo 5 — Configurar Nginx como Reverse Proxy

### 5.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 5.2 Criar a configuração do servidor

```bash
sudo nano /etc/nginx/sites-available/angola-express
```

Cole a seguinte configuração (substitua `seu-dominio.com` pelo seu domínio real):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/angola-express/frontend/dist;
    index index.html;

    # PWA — service worker precisa de cache-control adequado
    location /sw.js {
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }

    location /manifest.webmanifest {
        add_header Content-Type "application/manifest+json";
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }

    # Servir ficheiros estáticos do frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Servir uploads de imagens
    location /uploads/ {
        alias /var/www/angola-express/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para a API do backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Documentação Swagger
    location /api-docs {
        proxy_pass http://127.0.0.1:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 Ativar o site e restartar o Nginx

```bash
sudo ln -s /etc/nginx/sites-available/angola-express /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Passo 6 — Configurar o Backend como Serviço do Sistema (systemd)

### 6.1 Criar o ficheiro de serviço

```bash
sudo nano /etc/systemd/system/angola-express-backend.service
```

Cole o seguinte conteúdo (ajuste o `User` se necessário):

```ini
[Unit]
Description=Angola Express Backend API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/angola-express/backend
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/angola-express/backend/.env

[Install]
WantedBy=multi-user.target
```

### 6.2 Iniciar e habilitar o serviço

```bash
sudo systemctl daemon-reload
sudo systemctl start angola-express-backend
sudo systemctl enable angola-express-backend
```

### 6.3 Verificar o status do serviço

```bash
sudo systemctl status angola-express-backend
```

---

## Passo 7 — Configurar HTTPS com Certbot (SSL/TLS)

### 7.1 Instalar o Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obter e instalar o certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções no ecrã. O Certbot configurará automaticamente o Nginx para HTTPS.

### 7.3 Configurar renovação automática

```bash
sudo crontab -e
```

Adicione a seguinte linha:

```
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## Passo 8 — Configurar Permissões e Uploads

### 8.1 Criar o directório de uploads e dar permissões

```bash
sudo mkdir -p /var/www/angola-express/backend/uploads
sudo chown -R www-data:www-data /var/www/angola-express/backend/uploads
sudo chmod -R 755 /var/www/angola-express/backend/uploads
```

### 8.2 Garantir permissões na pasta do ficheiro de log

```bash
sudo mkdir -p /var/www/angola-express/backend/logs
sudo chown -R www-data:www-data /var/www/angola-express/backend/logs
sudo chmod -R 755 /var/www/angola-express/backend/logs
```

---

## Passo 9 — Testar o Deploy

### 9.1 Verificar que o backend está a funcionar

```bash
curl http://localhost:3000/api/health
```

### 9.2 Verificar que o frontend está acessível

Abra o browser e aceda a `https://seu-dominio.com`.

### 9.3 Verificar a API docs

Aceda a `https://seu-dominio.com/api-docs`.

### 9.4 Verificar os logs caso haja problemas

```bash
# Logs do backend
sudo journalctl -u angola-express-backend -f

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Logs da aplicação backend
tail -f /var/www/angola-express/backend/logs/*.log
```

---

## Passo 10 — Manutenção e Actualizações

### 10.1 Actualizar o código

```bash
cd /var/www/angola-express
git pull origin main
```

### 10.2 Actualizar dependências do backend

```bash
cd backend
npm install
npm run build
sudo systemctl restart angola-express-backend
```

### 10.3 Actualizar dependências do frontend

```bash
cd frontend
npm install
npm run build
sudo systemctl restart nginx
```

### 10.4 Migrar o banco de dados

```bash
cd backend
npx prisma migrate deploy
```

### 10.5 Reiniciar todos os serviços

```bash
sudo systemctl restart angola-express-backend nginx
```

---

## Checklist Rápido de Deploy

| Tarefa | Status |
|--------|--------|
| VPS com Ubuntu 22.04+ preparada | ☐ |
| Node.js 20.x+ instalado | ☐ |
| MySQL instalado e configurado | ☐ |
| Repositório clonado | ☐ |
| Backend `.env` configurado (produção) | ☐ |
| Backend compilado (`npm run build`) | ☐ |
| Frontend compilado (`npm run build`) | ☐ |
| Nginx configurado e funcionando | ☐ |
| SSL/HTTPS (Certbot) configurado | ☐ |
| Backend como serviço systemd | ☐ |
| Permissões de uploads definidas | ☐ |
| Testes de saúde passou | ☐ |

---

## Notas Importantes

- **JWT Secrets:** Nunca use os valores de placeholder em produção. Gere secrets longos e únicas.
- **CORS_ORIGIN:** Deve apontar sempre para o domínio de produção (https://...), nunca para `localhost`.
- **`.env`:** Este ficheiro nunca deve ser commited ao Git. Certifique-se de que está no `.gitignore`.
- **Backups do MySQL:** Configure backups automáticos antes de iniciar a receber dados reais de utilizadores:
  ```bash
  sudo apt install -y automysqlbackup
  sudo dpkg-reconfigure automysqlbackup
  ```
- **Firewall:** Configure o UFW para permitir apenas portas 80, 443 e SSH:
  ```bash
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw enable
  ```