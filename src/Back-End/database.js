// NOTA: "Sequelize" representa uma clnpasse, "sequelize" representa uma instancia desta classe.
import { Sequelize } from "sequelize";
import { Client } from "pg";
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
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
// Caminho da pasta migrations para verificação.
const migrationsDir = path.resolve(__dirname, './Migrations');

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (...msg) => logger.info(`ENV: ${process.env.NODE_ENV} | ${msg}`)
});

/*
    Nome: EnsureDatabaseExists
    Autor: Jvitor
    Desc: Verifica se o banco de dados existe e, caso não exista,
          cria o banco configurado nas variáveis de ambiente.
*/
async function EnsureDatabaseExists() {
    const dbName = process.env.DB_NAME;

    // Validacao do nome do banco antes de executar uma query.
    if (!dbName || !/^[a-z_][a-z0-9_]*$/.test(dbName)) {
        throw new Error('Invalid DB_NAME');
    }

    const client = new Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres'
    });

    try {
        await client.connect();
        const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE ${dbName}`);

            logger.info(`ENV: ${process.env.NODE_ENV} | Banco de dados criado com sucesso`);
        } else {
            logger.info(`ENV: ${process.env.NODE_ENV} | Banco de dados existe`);
        }
    } catch(error) {
        logger.error(`ENV: ${process.env.NODE_ENV} | ${error}`);
        throw error;
    } finally {
        await client.end();
    }
}

/*
    Nome: AuthenticateDatabase
    Autor: Jvitor
    Desc: Testa a conexão com o banco de dados e sincroniza as tabelas.
*/
async function AuthenticateDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        logger.info(`ENV: ${process.env.NODE_ENV} | Conexão com banco de dados esbelecida`);
    } catch(error) {
        logger.error(`ENV: ${process.env.NODE_ENV} | ${error}`);
        throw error;
    }
}

/*
    Nome: PendingMigrations
    Autor: Jvitor
    Desc: Retornar uma lista de migrations de acordo com os arquivos na
    pasta migration e retorna as instâncias pendentens.
    @return: Pendentes (array[str])
*/
async function PendingMigrations(sequelize, migrationsDir) {
    const files = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith('.js'))
        .sort();

    try {
        const [rows] = await sequelize.query(
            'SELECT name FROM "SequelizeMeta"'
        );

        const executed = new Set(rows.map(row => row.name));

        return files.filter(file => !executed.has(file));
    } catch (error) {
        logger.warn(`Banco de dados indisponível. Pulando check de migrations.`);

        return [];
    }
}

/*
    Nome: ExecutedMigrations
    Autor: Jvitor
    Desc: Retornar as instâncias que foram executadas/criadas no banco de dados.
    @return: Executados (array[str])
*/
async function ExecutedMigrations(sequelize) {
  const [rows] = await sequelize.query(
    'SELECT name FROM "SequelizeMeta" ORDER BY name'
  );

  return rows.map(row => row.name);
}

async function LoadModels() {
    // TODO: Carregar modelos.
    return;
}

async function RunSeeds() {
    // TODO: Executar as seeds
    return;
}

export async function InitializeDatabase() {
    try {
        let pending, executed = [];

        await EnsureDatabaseExists();
        await AuthenticateDatabase();
        pending = await PendingMigrations(sequelize, migrationsDir);
        if (pending !== null)
            executed = await ExecutedMigrations(sequelize);

        await LoadModels();
        await RunSeeds();

        if (pending && pending.length > 0)
            logger.info(`ENV: ${process.env.NODE_ENV} | Migrations pendentes: ${pending}`);
        else if (pending === null) {
            logger.error(`ENV: ${process.env.NODE_ENV} | Não foi possível retornar as instâncias pendentes do banco de dados`);
        }

        if (executed)
            logger.info(`ENV: ${process.env.NODE_ENV} | Migrations executados: ${executed}`);
        else if (executed == null)
            logger.error(`ENV: ${process.env.NODE_ENV} | Não foi possível retornar as instâncias executadas/criadas do banco de dados`);

    } catch(error) {
        logger.error(`ENV: ${process.env.NODE_ENV} | ${error}`);
        throw error;
    }
}

export default sequelize;
