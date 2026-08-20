// NOTA: "Sequelize" representa uma clnpasse, "sequelize" representa uma instancia desta classe.
import { Sequelize } from "sequelize";
import { Client } from "pg";
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Caminho da pasta migrations para verificação.
const migrationsDir = path.resolve(__dirname, './Migrations');

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (...msg) => console.log(`\x1b[42m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m ${msg}.`)
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

            console.log(`\x1b[42m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Banco de dados criado com sucesso`);
        } else {
            console.log(`\x1b[42m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Banco de dados existe`);
        }
    } catch(error) {
        console.log(`\x1b[41m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m ${error}.`);
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

        console.log(`\x1b[42m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Conexão com banco de dados esbelecida.`);
    } catch(error) {
        console.error(`\x1b[41m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m ${error}.`);
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
        console.warn(`\x1b[41m\x1b[1;32m DATABASE \x1b[0m\x1b[0m Banco de dados indisponível. Pulando check de migrations.`);

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
        await EnsureDatabaseExists();
        await AuthenticateDatabase();
        const pending = await PendingMigrations(sequelize, migrationsDir);
        const executed = await ExecutedMigrations(sequelize);
        await LoadModels();
        await RunSeeds();

        if (pending)
            console.log(`\x1b[43m\x1b[1;30m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Migrations pendentes: ${pending}.`);
        else if (pending == null) {
            throw Error(`\x1b[41m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Não foi possível retornar as instâncias pendentes do banco de dados.`);
        }

        if (executed)
            console.log(`\x1b[42m\x1b[1;30m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Migrations executados: ${executed}.`);
        else if (executed == null)
            throw Error(`\x1b[41m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m Não foi possível retornar as instâncias executadas/criadas do banco de dados.`);

    } catch(error) {
        console.error(`\x1b[41m\x1b[1;32m DATABASE | ${process.env.NODE_ENV} \x1b[0m\x1b[0m ${error}.`);
        throw error;
    }
}

export default sequelize;
