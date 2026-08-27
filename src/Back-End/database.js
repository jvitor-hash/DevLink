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

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: (...msg) => logger.info(`${msg}`)
});

/*
    Nome: EnsureDatabaseExists
    Autor: Jvitor
    Desc: Verifica se o banco de dados existe e, caso não exista,
          cria o banco configurado nas variáveis de ambiente.
*/
async function EnsureDatabaseExists() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not defined');
    }

    let url;

    try {
        url = new URL(databaseUrl);
    } catch {
        throw new Error('Invalid DATABASE_URL');
    }

    const dbName = decodeURIComponent(url.pathname.slice(1));

    // Validate database name before using it in CREATE DATABASE.
    if (!dbName || !/^[a-z_][a-z0-9_]*$/i.test(dbName)) {
        throw new Error('Invalid database name');
    }

    // Connect to the "postgres" maintenance database,
    // not the database we're trying to create/check.
    url.pathname = '/postgres';

    const client = new Client({
        connectionString: url.toString()
    });

    try {
        await client.connect();

        const result = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [dbName]
        );

        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);

            logger.info(`Banco de dados criado com sucesso`);
        } else {
            logger.info(`Banco de dados existe`);
        }
    } catch (error) {
        logger.error(error);
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

        logger.info(`Conexão com banco de dados esbelecida`);
    } catch(error) {
        logger.error(`${error}`);
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

export async function InitializeDatabase() {
    try {
        let pending, executed = [];

        await EnsureDatabaseExists();
        await AuthenticateDatabase();
        pending = await PendingMigrations(sequelize, migrationsDir);
        if (pending !== null)
            executed = await ExecutedMigrations(sequelize);

        if (pending && pending.length > 0)
            logger.info(`Migrations pendentes: ${pending}`);
        else if (pending === null) {
            logger.error(`Não foi possível retornar as instâncias pendentes do banco de dados`);
        }

        if (executed)
            logger.info(`Migrations executados: ${executed}`);
        else if (executed == null)
            logger.error(`Não foi possível retornar as instâncias executadas/criadas do banco de dados`);

    } catch(error) {
        logger.error(error);
        throw error;
    }
}

export default sequelize;
