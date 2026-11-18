# DevLink
Versão: v2.0.2

## Decisões tecnicas

### API

O API foi desenvolvida em volta do typescript junto com os princípios SOLID com uma organização de rotas baseado em MVC, em conjunto com postgres, elysia para rotas e better-auth para autenticação de usuários de forma fácil. A API Apresenta 

### Front-End

Front-end foi realizando inteiramente em React em typescript com algumas dependências como shaders, react-dom-router e react-feather para icones para as interfaces.

## Ferramentas de teste

No Front-end foi utilizado cypress para testes end-to-end nas partes criticas das interfaces, em conjunto com o bun runtime test para testes unitários

## Tecnologias utilizadas
- ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
- ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
- Elysia
- Better Auth (Autenticação)
- ![Drizzle](https://img.shields.io/badge/Drizzle-%23000000.svg?style=for-the-badge&logo=drizzle&logoColor=C5F74F)
- ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
- ![Cypress](https://img.shields.io/badge/cypress-%239FE5C8.svg?logo=cypress&logoColor=%231C1E2E&style=for-the-badge)
- ![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361dafb&style=for-the-badge)

## Pré-requisitos
- Bun.js (1.4.0+)
- PostgreSQL(Versão 17+)

## Instalação

1. Clonar o repositório:
```bash
git clone https://github.com/jvitor-hash/DevLink
cd '.\DevLink\'
```

2. Instalação das dependências do projeto:
```bash
bun install
```

3. Configuração das variáveis de ambiente: (BACK-END)
```text
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
FRONT_END_URL=
DATABASE_URL=
LOGGER_LEVEL="ERROR"
PORT=3333
```

3.1 Configuração das variáveis de ambiente: (FRONT-END)
```text
API_URL=
```
