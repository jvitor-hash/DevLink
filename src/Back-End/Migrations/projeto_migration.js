import { INTEGER, STRING, TEXT, FLOAT, BOOLEAN, ARRAY, ENUM, DATE } from "sequelize";

export async function up(queryInterface) {
    await queryInterface.createTable('Projetos', {
        id: {
            type: INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: STRING,
            unique: true,
            allowNull: false
        },
        category: {
            type: STRING,
            allowNull: false
        },
        subCategory: {
            type: STRING,
            allowNull: false
        },
        problem: {
            type: TEXT,
            defaultValue: '',
            allowNull: true
        },
        audience: {
            type: STRING,
            allowNull: false
        },
        platforms: {
            type: ARRAY(STRING),
            defaultValue: [],
            allowNull: false
        },
        language: {
            type: STRING,
            defaultValue: 'Python',
            allowNull: false
        },
        internetAccess: {
            type: BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        adminPanel: {
            type: ENUM('sim', 'nao', 'talvez'),
            defaultValue: 'talvez',
            allowNull: false,
        },
        authenticationSystem: {
            type: ENUM('sim', 'nao', 'talvez'),
            defaultValue: 'sim',
            allowNull: false
        },
        paymentSystem: {
            type: ENUM('sim', 'nao', 'talvez'),
            defaultValue: 'nao',
            allowNull: false
        },
        userSteps: {
            type: TEXT,
            allowNull: false,
        },
        styling: {
            type: STRING,
            defaultValue: '',
            allowNull: true,
        },
        inspiration: {
            type: STRING,
            defaultValue: '',
            allowNull: true
        },
        hasLogo: {
            type: BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        deadline: {
            type: DATE, // DATE no sequelize representa Datetime
            allowNull: false
        },
        minBudget: {
            type: FLOAT,
            allowNull: false
        },
        maxBudget: {
            type: FLOAT,
            allowNull: false
        },
        createdAt: {
            type: DATE,
            allowNull: false
        },
        updatedAt: {
            type: DATE,
            allowNull: false
        }
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable('Projetos');
}