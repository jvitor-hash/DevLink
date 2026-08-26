import { DataTypes, Model } from "sequelize";
import { sequelize } from '../database.js';

export class Projeto extends Model {};

Projeto.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subCategory: {
        type: DataTypes.STRING,
        allowNull: false
    },
    problem: {
        type: DataTypes.TEXT,
        defaultValue: '',
        allowNull: true
    },
    audience: {
        type: DataTypes.STRING,
        allowNull: false
    },
    platforms: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'Python',
        allowNull: false
    },
    internetAccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    adminPanel: {
        type: DataTypes.ENUM('sim', 'nao', 'talvez'),
        defaultValue: 'talvez',
        allowNull: false,
    },
    authenticationSystem: {
        type: DataTypes.ENUM('sim', 'nao', 'talvez'),
        defaultValue: 'sim',
        allowNull: false
    },
    paymentSystem: {
        type: DataTypes.ENUM('sim', 'nao', 'talvez'),
        defaultValue: 'nao',
        allowNull: false
    },
    userSteps: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    styling: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: true,
    },
    inspiration: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: true
    },
    hasLogo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATE, // DATE no sequelize representa Datetime
        allowNull: false
    },
    minBudget: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    maxBudget: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }

    }, {
    sequelize,
    modelName: "Projeto"
});
