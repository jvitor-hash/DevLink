import { DataTypes, Model } from "sequelize";
import { sequelize } from '../database.js';

export class Usuario extends Model {};

Usuario.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    platforms: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userType: {
      type: DataTypes.STRING,
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
    modelName: "Usuario"
});
