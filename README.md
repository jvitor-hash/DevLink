# DevLink
Versão: v2.0.2

## Decisões técnicas

### API

A API foi desenvolvida em TypeScript utilizando o runtime Bun e orientada pelos princípios SOLID com uma organização modular inspirada no padrão MVC/Clean Architecture, integrando PostgreSQL, Elysia para alto desempenho em rotas e Better Auth para autenticação de usuários de forma simples e segura. A API apresenta as seguintes decisões arquiteturais:

- **Arquitetura em Camadas e Desacoplamento**:
  - **Rotas (`routes/v1/`)**: Declaração tipada e versionada dos endpoints via Elysia, integrando schemas Zod e documentação OpenAPI/Swagger automática.
  - **Controladores (`domains/*/controller.ts`)**: Orquestração das requisições isolada da camada de persistência, utilizando o executor `executeController` para padronização de respostas e tratamento de falhas.
  - **Tratamento de Erros de Domínio**: Hierarquia centralizada com `DomainError` e mapeamento de status codes (`HttpStatus`), eliminando falhas silenciosas e vazamento de detalhes internos.
  - **Repositórios e Abstração de Dados (`infrastructure/database/`)**: Acesso ao PostgreSQL gerenciado pelo Drizzle ORM através de um **Generic CRUD Factory** (`crud_factory.ts`), reduzindo boilerplate para operações rotineiras e padronizando logs de operações do banco.

- **Padrões de Projeto (Design Patterns)**:
  - **Strategy Pattern (`WorkItemSupervisor`)**: Implementado para unificar a gestão de itens de trabalho (`TicketStrategy` e `TodoStrategy`), permitindo que a API processe e redirecione operações entre chamados técnicos (tickets) e tarefas (todos) de forma polimórfica e intercambiável sem duplicação de regras.
  - **Factory Method**: Utilizado no gerador de repositórios CRUD para tipagem estática e desacoplamento das entidades do Drizzle.

- **Autenticação, Autorização e Sessão**:
  - Integração do **Better Auth** com adapter nativo para Drizzle ORM e PostgreSQL.
  - Middleware em plugin Elysia (`authPlugin`) no ciclo de vida da requisição para extração de sessões, garantindo autenticação declarativa nas rotas (`auth: true` / `authOptional: true`) e validações de permissões granulares (`requireRole`, `requireSameUser`).

- **Comunicação em Tempo Real (SSE)**:
  - Implementação de um hub de **Server-Sent Events** (`SseHub`) para envio unidirecional de eventos e atualizações ao vivo (mensagens de chat e notificações de projetos).
  - Controle de conexões por cliente, roteamento direcionado por audiência (`userId`) e rotina de *heartbeat* periódico (20s) para manter conexões ativas através de proxies reversos e balanceadores.

- **Contratos e Validação de Dados**:
  - Uso de **Zod** para definição rigorosa de DTOs (Data Transfer Objects), garantindo validação de schemas em tempo de execução e inferência de tipos estáticos no TypeScript.

---

### Front-End (V2)

O front-end foi realizado inteiramente em React 19 com TypeScript, construído sobre o Vite e evoluído na versão V2 de uma estrutura tradicional para uma arquitetura modular orientada a funcionalidades (**Feature-Driven / Modular Architecture**). O projeto conta com dependências como Tailwind CSS v4 para estilização, Shaders para efeitos visuais, React Router para gerenciamento de rotas e React Feather para ícones de interface. As principais decisões de design incluem:

- **Arquitetura Modular por Funcionalidade (Feature-Driven Design)**:
  - **`features/`**: Cada domínio de negócio (`auth`, `chat`, `project`, `work_items`, `notifications`, `reviews`, `settings`, `questionaire`, `user`) é autocontido, agrupando seus próprios componentes visuais, custom hooks de estado/efeito, serviços de comunicação com a API e tipos locais.
  - **`shared/`**: Recursos transversais e compartilhados, incluindo uma biblioteca completa de componentes de UI atômicos (`button`, `card`, `drawer`, `badge`, form inputs especializados), hooks reutilizáveis (`use_cache`, `use_redirect`), tipos globais do banco e clientes HTTP.
  - **`pages/`**: Camada de visualização enxuta, atuando como orquestradora e agregadora das features para cada rota da aplicação.
  - **`app/`**: Inicialização, provedores globais e configuração centralizada do roteador.

- **Roteamento, Code Splitting e Proteção de Rotas**:
  - Utilização do **React Router v7** (`createBrowserRouter`) com divisão dinâmica de código por rota (`React.lazy` + `Suspense`), utilizando telas de carregamento intermediárias (`LoadingScreen`) para otimizar o tempo de resposta e carregamento inicial.
  - Rotas autenticadas encapsuladas em layouts de proteção (`ProtectedRoute`), garantindo navegação segura e redirecionamento de usuários não autenticados.

- **Reatividade e Eventos em Tempo Real**:
  - Consumo de eventos Server-Sent Events (SSE) do back-end através de custom hooks especializados (`use_chat_events`, `use_project_events`, `use_notifications`), permitindo atualizações de interface em tempo real sem a necessidade de polling.
  - Barramento de eventos global e sistema de notificações desacoplado (`toast_store`, `event_bus.ts`).

- **Segurança e Criptografia no Cliente**:
  - Módulo de criptografia dedicado (`crypto_service.ts`) no chat para suporte à troca segura de mensagens e chaves públicas/privadas na camada de cliente antes do tráfego de dados sensíveis.

## Ferramentas de teste

- **Front-End**: Utilização do **Cypress** para testes end-to-end (E2E) nas partes críticas dos fluxos e interfaces do usuário, além de verificação estática de tipos com **TypeScript** (`tsc -b`) e padronização com **ESLint**.
- **Back-End (API)**: Utilização do **Bun Test** runtime para execução de testes unitários e de integração (rotas, autenticação, controllers, permissões e repositórios) com geração de relatórios de cobertura (`bun test --coverage`).

## Tecnologias utilizadas
- ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
- ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
- ![React](https://img.shields.io/badge/react-%2320232a.svg?logo=react&logoColor=%2361dafb&style=for-the-badge)
- ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
- ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
- ![Drizzle](https://img.shields.io/badge/Drizzle-%23000000.svg?style=for-the-badge&logo=drizzle&logoColor=C5F74F)
- ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
- ![Cypress](https://img.shields.io/badge/cypress-%239FE5C8.svg?logo=cypress&logoColor=%231C1E2E&style=for-the-badge)
- ElysiaJS
- Better Auth (Autenticação)
- Zod (Validação de Schemas)

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
