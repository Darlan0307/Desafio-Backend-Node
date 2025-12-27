# API REST – Desafio Técnico Back-end

API REST para gerenciamento de usuários e pedidos, com autenticação JWT, paginação, filtros e testes unitários.

## Stack

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Docker & Docker Compose
- Vitest (testes)
- Zod (validação)
- ESLint + Prettier

## Rodando o projeto

### Pré-requisitos

- Docker e Docker Compose instalados

### Setup

```bash
git clone <repo-url>
cd <repo-name>
cp .env.example .env
docker compose up -d
```

A API estará disponível em `http://localhost:3000`

### Variáveis de ambiente

| Variável             | Descrição                                | Exemplo                                  |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| PORT                 | Porta da API                             | 3000                                     |
| MONGODB_URI          | Connection string do MongoDB             | mongodb://mongodb:27017/database_mongodb |
| NODE_ENV             | Ambiente de execução                     | development                              |
| LOG_LEVEL            | Nível de log                             | debug                                    |
| TOKEN_SECRET         | Chave secreta para assinar os tokens JWT | secret                                   |
| TOKEN_EXPIRES_IN     | Tempo de expiração do token              | 1h                                       |
| PASSWORD_SALT_ROUNDS | Rounds do bcrypt para hash de senha      | 10                                       |

## Arquitetura

O projeto segue uma arquitetura inspirada em MVC, com separação clara entre camadas HTTP, regras de negócio e acesso a dados, priorizando baixo acoplamento e facilidade de testes.

```
src/
├── @types/
├── app/
│   ├── users/
│   │   ├── http/          # controllers e rotas
│   │   ├── repository/    # acesso ao banco
│   │   └── use-cases/     # regras de negócio
│   └── orders/
│       ├── http/
│       ├── repository/
│       └── use-cases/
├── infra/
│   ├── errors/            # classes de erro customizadas
│   ├── middlewares/       # auth, error handler, etc
│   ├── models/            # schemas do mongoose
│   └── logger.ts
├── shared/
├── http-server.ts
└── main.ts
```

### Camadas

- **http**: Controllers e definição das rotas
- **use-cases**: Regras de negócio isoladas do framework
- **repository**: Acesso a dados via Mongoose
- **infra/models**: Schemas do banco
- **infra/middlewares**: Auth, error handler, etc
- **infra/errors**: Classes de erro padronizadas

Essa estrutura facilita testes porque os use-cases não dependem diretamente do Express.

## Autenticação

A API usa JWT para autenticação. O fluxo é:

1. Usuário faz login/registro e recebe um token
2. Nas próximas requisições, envia o token no header:

```
Authorization: Bearer <token>
```

### Middleware de autenticação

O middleware valida o token e injeta o `userId` na request. Se o token for inválido ou estiver ausente, retorna `401`.

Validações feitas:

- Presença do token no header
- Assinatura válida
- Token não expirado

## Rotas

### Auth

#### POST /auth/register

Cria um novo usuário.

```json
// Request
{
  "email": "darlan@gmail.com",
  "password": "12345678"
}

// Response 201
{
  "user": {
    "id": "...",
    "email": "darlan@gmail.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Status | Descrição           |
| ------ | ------------------- |
| 201    | Usuário criado      |
| 400    | Dados inválidos     |
| 409    | Email já cadastrado |

#### POST /auth/login

Autentica um usuário existente.

```json
// Request
{
  "email": "darlan@gmail.com",
  "password": "12345678"
}

// Response 200
{
  "user": {
    "id": "...",
    "email": "darlan@gmail.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Status | Descrição              |
| ------ | ---------------------- |
| 200    | Login OK               |
| 400    | Dados inválidos        |
| 401    | Credenciais incorretas |

### Orders

> Todas as rotas abaixo exigem autenticação.

#### POST /orders

Cria um novo pedido. O pedido inicia com `state: CREATED` e `status: ACTIVE`.

```json
// Request
{
  "lab": "lab01",
  "patient": "paciente 02",
  "customer": "cliente 04",
  "services": [
    {
      "name": "serviço 123",
      "value": 1.5
    }
  ]
}

// Response 201
{
  "id": "...",
  "lab": "lab01",
  "patient": "paciente 02",
  "customer": "cliente 04",
  "state": "CREATED",
  "status": "ACTIVE",
  "services": [
    {
      "name": "serviço 123",
      "value": 1.5,
      "status": "PENDING"
    }
  ],
  "user": {
    "id": "694ee1dd56f4e6db0310ce30",
    "email": "teste@gmail.com"
  },
  "createdAt": "2025-12-26T19:28:39.361Z",
  "updatedAt": "2025-12-26T19:28:39.361Z"
}
```

| Status | Descrição       |
| ------ | --------------- |
| 201    | Pedido criado   |
| 400    | Dados inválidos |
| 401    | Não autenticado |

#### GET /orders

Lista pedidos com paginação e filtro opcional por estado.

**Query params:**

| Param   | Tipo   | Default | Descrição                                        |
| ------- | ------ | ------- | ------------------------------------------------ |
| page    | number | 1       | Página atual                                     |
| perPage | number | 50      | Itens por página                                 |
| state   | string | -       | Filtra por estado (CREATED, ANALYSIS, COMPLETED) |

**Exemplo:** `GET /orders?page=1&perPage=3&state=COMPLETED`

```json
// Response 200
{
  "data": [
    {
      "id": "694ee1cd56f4e6db0310ce27",
      "lab": "lab01",
      "patient": "paciente 02",
      "customer": "cliente 04",
      "state": "COMPLETED",
      "status": "ACTIVE",
      "services": [
        {
          "name": "serviço 123",
          "value": 1.5,
          "status": "PENDING"
        }
      ],
      "user": {
        "id": "694db950a49c9b0bd02b7920",
        "email": "darlan@asdsa.com"
      },
      "createdAt": "2025-12-26T19:28:13.143Z",
      "updatedAt": "2025-12-26T20:15:52.725Z"
    }
  ],
  "totalRecords": 1,
  "totalPages": 1,
  "currentPage": 1,
  "perPage": 3
}
```

#### GET /orders/:id

Retorna um pedido específico.

| Status | Descrição             |
| ------ | --------------------- |
| 200    | OK                    |
| 404    | Pedido não encontrado |
| 422    | ID inválido           |

#### PATCH /orders/:id/advance

Avança o estado do pedido seguindo a ordem definida.

```json
// Request
{
  "state": "ANALYSIS"
}

// Response 200
{
  "id": "...",
  "state": "ANALYSIS",
  ...
}
```

| Status | Descrição             |
| ------ | --------------------- |
| 200    | Estado atualizado     |
| 400    | Transição inválida    |
| 404    | Pedido não encontrado |
| 422    | ID inválido           |

## Regras de negócio

### Transição de estados

O pedido sempre começa em `CREATED` e só pode avançar na ordem:

```
CREATED → ANALYSIS → COMPLETED
```

Transições válidas:

- `CREATED` → `ANALYSIS`
- `ANALYSIS` → `COMPLETED`

Transições inválidas:

- `CREATED` → `COMPLETED` (não pode pular etapa)
- `COMPLETED` → `ANALYSIS` (não pode voltar)
- `ANALYSIS` → `CREATED` (não pode voltar)

Essa regra é validada no use-case e está coberta nos testes unitários.

## Testes

Os testes unitários foram desenvolvidos utilizando **Vitest**, com foco em validar regras do fluxo de criação e atualização dos estados dos pedidos.

Para executar os testes:

```bash
npm run test:unit
```

Os testes usam repositórios mockados, não precisam do banco rodando.

## Possíveis melhorias

- Refresh token para renovação automática
- Cache com Redis ou node-cache
- Documentação com Swagger/OpenAPI
- Testes de integração
- Controle de permissões por perfil
