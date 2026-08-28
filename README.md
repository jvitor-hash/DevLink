# DevLink
Versão: v1.2.2a

*(Nota: Testes são rodados automaticamente após um pull-request ou push)*

## Tecnologias utilizadas
- Node.js
- Express.js
- Sequelize (PostgreSQL)
- React.Js (interface)
- Tailwindcss (CSS Framework)
- DaisyUI (Biblioteca de componentes)
- JWT (Autenticação)
- Pino (Logger)
- Vitest (Framework de testes)
- Dotenv (Variáveis de ambiente)
- Bcrypt (Encriptação de senhas)
- Socket.io (Comunicação por meio de chat)
- Nodemon (Ambiente de desenvolvimento)


## Pré-requisitos
- Node.js (Versão 24.0+)
- PostgreSQL(Versão 16.0+)

# Instalação

1. Clonar o repositório:
```
git clone https://github.com/jvitor-hash/DevLink
cd '.\DevLink\'
```

2. Configuração das variáveis de ambiente:
```
# development, staging, testing, production
DATABASE_URL="postgres://postgres:admin@localhost:5432/testdb"
ACCESS_TOKEN_SECRET="HEX32"
REFRESH_TOKEN_SECRET="HEX32"
SALT_ROUNDS=12
PORT=8080
LOG_LEVEL="info"
IP="127.0.0.1"
```

3. Instalação das dependências do projeto:
```
npm install
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
