# PC Parts — Sistema de Avaliação de Peças de Computador

Projeto desenvolvido como trabalho acadêmico para a disciplina de Banco de Dados.
A proposta é implementar um sistema de avaliação de peças de computador aplicando conceitos como modelagem de dados (MER), persistência e operações CRUD.

---

## Objetivo

Criar uma aplicação onde usuários possam avaliar peças de hardware, enquanto um administrador gerencia quais itens ficam visíveis no sistema.

Principais focos do projeto:

* Modelagem de banco de dados (MER)
* Relacionamentos entre entidades
* Persistência com PostgreSQL
* Integração entre backend e frontend

---

## Stack utilizada

* Backend: Node.js + Express
* ORM: Prisma
* Banco de dados: PostgreSQL
* Frontend: HTML, CSS e JavaScript puro

---

## Funcionalidades

### Usuário

* Visualizar peças aprovadas
* Avaliar peças com base em 5 critérios:

  * Desempenho
  * Custo-benefício
  * Compatibilidade
  * Durabilidade
  * Ruído
* Ver média das avaliações
* Sugerir novas peças (ficam pendentes de aprovação)

---

### Administrador

* Visualizar todas as peças (incluindo pendentes)
* Aprovar ou rejeitar peças enviadas
* Remover peças do sistema

---

## Modelagem do Banco de Dados (MER)

O sistema possui duas entidades principais:

### Peca

* id (PK)
* nome
* marca
* categoria
* descricao
* fotoUrl
* status (PENDENTE, APROVADO, REJEITADO)
* criadoEm

---

### Avaliacao

* id (PK)
* pecaId (FK)
* nomeUsuario
* desempenho
* custoBeneficio
* compatibilidade
* durabilidade
* ruido
* comentario
* criadoEm

---

### Relacionamento

* Uma **Peça** pode ter várias **Avaliações** (1:N)
* Cada **Avaliação** pertence a uma única **Peça**

---

## Execução do projeto

### 1. Banco de dados

Criar o banco no PostgreSQL:

```sql
CREATE DATABASE pcparts;
```

---

### 2. Backend

```bash
cd backend

npm install

cp .env.example .env
```

Configurar o `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/pcparts"
```

Executar migrations:

```bash
npx prisma migrate dev --name init
```

Opcional (dados de teste):

```bash
node prisma/seed.js
```

Iniciar o servidor:

```bash
npm run dev
```

---

### 3. Frontend

Abrir o arquivo:

```
frontend/index.html
```

Ou utilizar o Live Server no VS Code.

---

## Estrutura da API

```
GET    /api/pecas
GET    /api/pecas/:id
POST   /api/pecas
POST   /api/avaliacoes
GET    /api/avaliacoes/peca/:id

# Rotas administrativas

GET    /api/admin/pendentes
GET    /api/admin/pecas
PATCH  /api/admin/:id/aprovar
PATCH  /api/admin/:id/rejeitar
DELETE /api/admin/:id
```

---

## Considerações

Este projeto foi desenvolvido com foco educacional, visando aplicar na prática conceitos como:

* Modelagem entidade-relacionamento (MER)
* Integridade referencial
* Operações CRUD
* Organização de dados em aplicações reais
