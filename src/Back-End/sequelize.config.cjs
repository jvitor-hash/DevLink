require('dotenv').config({ path: './env.env' });

const envFiles = {
  "Development": './dev.env.development',
  "Testing": './test.env.testing',
  "Staging": './stag.env.staging',
  "Production": './prod.env.production',
};

const envFile = envFiles[process.env.NODE_ENV];

if (!envFile) {
  throw new Error(
    `NODE_ENV inválido ou não definido: ${process.env.NODE_ENV}`
  );
}

require('dotenv').config({
  path: envFile,
  override: true,
});

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  },

  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  },

  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  },

  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  },
};