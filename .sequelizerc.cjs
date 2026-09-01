const path = require('path');

module.exports = {
    config: path.resolve(__dirname, 'src/Config/database.cjs'),
    'models-path': path.resolve(__dirname, 'src/Back-End/Models'),
    'seeders-path': path.resolve(__dirname, 'src/Back-End/Seeds'),
    'migrations-path': path.resolve(__dirname, 'src/Back-End/Migrations'),
};
