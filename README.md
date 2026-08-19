# Projeto sem nome
Versão: 1.0.0v

*(Nota: Testes são rodados automaticamente após um pull-request ou push)*

## Tecnologias utilizadas
- Node.js
- Express.js
- Sequelize (PostgreSQL)
- JWT (Autenticação)
- Vitest (Framework de testes)
- Dotenv (Variáveis de ambiente)
- Bcrypt (Encriptação de senhas)
- Socket.io (Comunicação por meio de chat)
- Handlebars (Engine de renderização de páginas) 
- Bootstrap (Framework de componentes HTML)
- Bootstrap-icons (Icones)
- Nodemon (Ambiente de desenvolvimento)


## Pré-requisitos
- Node.js (Versão 18+)
- PostgreSQL(Versão 18+)

# Instalação

1. Clonar o repositório:
```
git clone https://github.com/jvitor-hash/Projeto-sem-nome
cd '.\Projeto sem nome\'
```

2. Instalação das dependências do projeto:
```
npm install
```

3. Configuração das variáveis de ambiente:
```
# development, staging, testing, production
NODE_ENV=development 
SALT_ROUNDS=24
PORT=8080
```

4. Configuração secundaria das variáveis de ambiente

- ".env.development"
- ".env.staging"
- ".env.testing"
- ".env.production"

Exemplo de configuração secundária:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_development
DB_USER=postgres
DB_PASSWORD=123
```

# Commandos

```
npm start
npm test
npm run test:run # Executa uma unica vez e não espera para o usuário precionar 'q'
npm run db:migrate
npm run db:migrate:undo # Desfaz todas as migrations criadas
npm run db:seed
npm run db:seed:undo # Mesmo conceito do commando 'db:migrate:undo'
```
