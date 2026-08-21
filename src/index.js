// Ponto de inicio.
import dotenv from 'dotenv';
import { InitServer } from './Back-End/app.js';

/*
    Nome: InitStart
    Desc: Após o comando "npm start" o nodemon procura por um arquivo nomeado index.js na pasta src/
*/
function InitStart() {
    // Importação das variáveis de ambiente.
    dotenv.config({ path: "./env.env" });

    // Redirecionamento para o arquivo app.js
    InitServer();
}

InitStart();