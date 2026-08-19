import express from 'express';
import { engine } from 'express-handlebars';
import { InitializeDatabase } from './database.js';
import usuarioRouter from './Routes/usuario_routes.js';
import path from 'path';
import './config.js';

/*
    Nome: SetupRoutes
    Autor: Jvitor
    Desc: Lista a rotas e os métodos sendo usados por estas rotas,
    além dos arquivos associados a partir da pasta Front-End/
    @params: App (express)
*/
function SetupRoutes(app) {
  // Configuração das rotas.
  app.use('/api/usuario', usuarioRouter);

  app.get('/', (req, res) => {
    res.render('home');
  });
}

/*
    Nome: InitServer
    Autor: Jvitor
    Desc: O ponto de partido do Back-end dando início a estabelecer
    uma conexão com o banco de dados, caso seja a primeira vez o servidor
    irá iniciar as migrations e preencher as tabelas com as seeds no banco de testes.
*/
export function InitServer() {
  const port = process.env.PORT || 8080;

  console.log(`\x1b[42m\x1b[1;32m BACK-END \x1b[0m\x1b[0m Inicializando servidor | Porta: ${port}`);

  // Criação da instancia do express-js.
  const app = express();

  // Configuração da handlebars.
  app.engine('handlebars', engine());

  // Definição dos arquivos usando .hbs
  app.engine('hbs', engine({
    extname: '.hbs'
  }));

  app.set('view engine', 'hbs');

  // Usar formatacão json.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuração da pasta das views e public.
  app.set('views', './src/Front-End');
  // app.use(express.static(path.join(__dirname, "../../public")));

  SetupRoutes(app);

  // Nota: Utilizei uma anonymous function para circunver a parte assíncrona de lidar com banco de dados
  (async () => {
    if (process.env.NODE_ENV)
      await InitializeDatabase();
  })();

  // Inicia a aplicação e começar a ouvir na porta definida nas variáveis de ambiente.
  app.listen(port, () => {
    console.log(`\x1b[42m\x1b[1;32m BACK-END \x1b[0m\x1b[0m Servidor esperando conexões na porta: ${port}`);
  });
};
