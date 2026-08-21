import express from 'express';
import { engine } from 'express-handlebars';

/*
    Nome: SetupRoutes
    Desc: 
    Lista a rotas e os métodos sendo usados por estas rotas,
    além dos arquivos associados a partir da pasta Front-End/
*/
function SetupRoutes(app) {
    app.get('/', (req, res) => {
        res.render('home');
    });
}

/*
    Nome: InitServer
    Desc: 
    O ponto de partido do Back-end dando início a estabelecer
    uma conexão com o banco de dados, caso seja a primeira vez o servidor
    irá iniciar as migrations e preencher as tabelas com as seeds no banco de testes.
*/
export function InitServer() {
    const port = process.env.PORT;

    console.log(`\x1b[42m\x1b[1;32m BACK-END \x1b[0m\x1b[0m: Inicializando servidor | Porta: ${port}`);

    // Criação da instancia do express-js.
    const app = express();

    // Configuração da handlebars.
    app.engine('handlebars', engine());

    // Definição dos arquivos usando .hbs
    app.engine('hbs', engine({
        extname: '.hbs'
    }));

    app.set('view engine', 'hbs');
    

    // Configuração da pasta das views.
    app.set('views', './src/Front-End');

    SetupRoutes(app);

    // Inicia a aplicação e começar a ouvir na porta definida nas variáveis de ambiente.
    app.listen(port, () => {
        console.log(`\x1b[42m\x1b[1;32m BACK-END \x1b[0m\x1b[0m: Servidor esperando conexões na porta: ${port}`);    
    });
};