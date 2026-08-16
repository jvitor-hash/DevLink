// Ponto de inicio.
import { InitServer } from './Back-End/app.js';

/*
    Nome: InitStart
    Autor: Jvitor
    Desc: Após o comando "npm start" o nodemon procura por um arquivo nomeado index.js na pasta src/
*/
function InitStart() {
    // Redirecionamento para o arquivo app.js
    InitServer();
}

InitStart();