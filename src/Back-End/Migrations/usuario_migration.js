import { INTEGER, STRING, DATE, ARRAY } from "sequelize";

export async function up(queryInterface) {
    await queryInterface.createTable('Usuarios', {
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
        platforms: {
            type: ARRAY(STRING),
            defaultValue: [],
            allowNull: false
        },
        description: {
            type: STRING,
            defaultValue: '',
            allowNull: true
        },
        password: {
            type: STRING,
            allowNull: false
        },
        userType: {
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
    await queryInterface.dropTable('Usuarios');
}
