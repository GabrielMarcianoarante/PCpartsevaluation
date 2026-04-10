# PC Parts — Sistema de Avaliação de Peças de Computador

Sistema full-stack para avaliação de peças de PC com fluxo de aprovação pelo admin.

## Stack

- **Backend:** Node.js + Express + Prisma ORM
- **Banco:** PostgreSQL
- **Frontend:** HTML + CSS + JS puro

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

---

## Deploy (produção)

### Backend → Railway

1. Cria conta em [railway.app](https://railway.app)
2. Novo projeto → "Deploy from GitHub repo" → seleciona a pasta `backend`
3. Adiciona um plugin **PostgreSQL** no mesmo projeto
4. Em **Variables**, adiciona:
   - `DATABASE_URL` → Railway gera automático quando você adiciona o Postgres (copia de lá)
   - `ADMIN_TOKEN` → qualquer senha que quiser
   - `PORT` → `3001`
5. O Railway roda `npx prisma migrate deploy && node src/index.js` automaticamente
6. Copia a URL pública gerada (ex: `https://pc-parts-backend-production.up.railway.app`)

### Frontend → Vercel

1. Edita `frontend/config.js` e cola a URL do Railway:
   ```js
   window.API_URL = 'https://pc-parts-backend-production.up.railway.app'
   ```
2. Cria conta em [vercel.com](https://vercel.com)
3. "Add New Project" → importa o repo → define o **Root Directory** como `frontend`
4. Deploy — pronto

---

## Como rodar

### 1. Banco de dados

Cria o banco no PostgreSQL:

```sql
CREATE DATABASE pcparts;
```

### 2. Backend

```bash
cd backend

# instala dependências
npm install

# cria o .env a partir do exemplo
cp .env.example .env
# edita o .env com sua senha do postgres:
# DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/pcparts"

# roda as migrations (cria as tabelas)
npx prisma migrate dev --name init

# popula com dados de exemplo (opcional)
node prisma/seed.js

# sobe o servidor
npm run dev
```

O backend vai rodar em `http://localhost:3001`

### 3. Frontend

Abre o arquivo `frontend/index.html` direto no navegador.

Ou usa o Live Server do VS Code — clica com botão direito no `index.html` → "Open with Live Server".

---

## Funcionalidades

### Usuário
- Visualiza catálogo com peças aprovadas e médias por critério
- Avalia peças por 5 critérios (Desempenho, Custo-benefício, Compatibilidade, Durabilidade, Ruído)
- A média atualiza automaticamente a cada nova avaliação
- Submete nova peça com foto — fica pendente até o admin aprovar

### Admin
- Acessa o painel com token (`admin123` por padrão, muda no .env)
- Aprova ou rejeita peças pendentes (incluindo a foto)
- Vê todas as peças com seus status
- Pode remover qualquer peça

---

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/pecas | lista peças aprovadas com médias |
| GET | /api/pecas/:id | detalhe de uma peça |
| POST | /api/pecas | submete nova peça (multipart/form-data) |
| POST | /api/avaliacoes | envia avaliação |
| GET | /api/avaliacoes/peca/:id | avaliações de uma peça |
| GET | /api/admin/pendentes | lista pendentes (auth) |
| GET | /api/admin/pecas | lista todas (auth) |
| PATCH | /api/admin/:id/aprovar | aprova peça (auth) |
| PATCH | /api/admin/:id/rejeitar | rejeita peça (auth) |
| DELETE | /api/admin/:id | remove peça (auth) |

Rotas de admin precisam do header `x-admin-token: admin123`

---

## Estrutura do banco

```
Peca
  id, nome, marca, categoria, descricao, fotoUrl, status (PENDENTE/APROVADO/REJEITADO), criadoEm

Avaliacao
  id, pecaId, nomeUsuario, desempenho, custoBeneficio, compatibilidade, durabilidade, ruido, comentario, criadoEm
```
