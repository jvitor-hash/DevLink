import dotenv from 'dotenv';

// Importação das variáveis de ambiente, global.
dotenv.config({ path: "./env.env" });
    
// Acrescenta informações do banco baseado no ambiente configurado.
const envFiles = {
    "Development": "./dev.env.development",
    "Testing": "./test.env.testing",
    "Staging": "./stag.env.staging",
    "Production": "./prod.env.production"
};

if (process.env.NODE_ENV !== undefined) {
    dotenv.config({ path: envFiles[process.env.NODE_ENV], override: true });
} else {
    throw new Error("Configuracao do arquivo .env nao contem NODE_ENV");
}