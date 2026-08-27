import dotenv from 'dotenv';

// Importação das variáveis de ambiente, global.
dotenv.config({ path: "./env.env" });
    
// Acrescenta informações do banco baseado no ambiente configurado.
const envFiles = {
    "Development": "./dev.env.development",
    "Production": "./prod.env.production"
};

if (process.env.NODE_ENV === undefined) 
    console.error("Configuração do arquivo .env não existe ou contem NODE_ENV");

dotenv.config({ path: envFiles[process.env.NODE_ENV], override: true });