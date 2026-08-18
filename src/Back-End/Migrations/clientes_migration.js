import { INTEGER, STRING, DATE } from "sequelize";

export async function up(queryInterface) {
    await queryInterface.createTable('Clientes', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: STRING,
            allowNull: false
        },
        email: {
            type: STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: STRING,
            allowNull: false
        },
        createdAt: {
            type: DATE,
            allowNull: false
        },
        updatedAt: {
            type: DATE,
            allowNull: false,
        }
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable('Clientes');
}