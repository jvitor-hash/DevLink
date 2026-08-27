import { engine } from 'express-handlebars';
import { InitializeDatabase } from './database.js';
import { fileURLToPath } from "node:url";
import { rateLimiter } from './Middleware/rate_limiter.js';
import usuarioRouter from './Routes/usuario_routes.js';
import projetoRouter from './Routes/projetos_routes.js';
import express from 'express';
import path from 'path';
import cors from 'cors';
import pino from 'pino';
import './config.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  app.use('/api/projeto', projetoRouter);

  app.get('/', (req, res) => {
    res.render('home', {
      ip: process.env.IP || '127.0.0.1',
      port: process.env.PORT || 8080
    });
  });

  app.get('/config', (req, res) => {
    res.render('configuracao');
  });

  app.get('/questionario', (req, res) => {
    res.render('questionario');
  });

  app.get('/projetos', (req, res) => {
    res.render('projetos');
  });

  app.get('/notificacao', (req, res) => {
    res.render('notificacao');
  });

  app.get('/perfil', (req, res) => {
    res.render('perfil');
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
  const ip = process.env.IP || "127.0.0.1";

  logger.info(`Inicializando servidor | Porta: ${port}`);

  // Criação da instancia do express-js.
  const app = express();

  // TODO(Jvitor): Configurar de forma apropriada o cors.
  app.use(cors({
    origin: "*"
  }));

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
  app.use(express.static(path.join(__dirname, "../../public")));

  app.use(rateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    max: 5               // número maximo de requests em 1 minuto
  }));

  SetupRoutes(app);

  // Nota: Utilizei uma anonymous function para circunver a parte assíncrona de lidar com banco de dados
  (async () => {
    if (process.env.NODE_ENV)
      await InitializeDatabase();
  })();

  // Inicia a aplicação e começar a ouvir na porta definida nas variáveis de ambiente.
  app.listen(port, ip, () => {
    logger.info(`Servidor esperando conexões na porta: ${port} e ip ${ip}`);
  });
};
