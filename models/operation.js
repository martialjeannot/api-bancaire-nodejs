const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Operation = sequelize.define('Operation', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    montant: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // "DEPOT", "RETRAIT" ou "INTERETS"
        allowNull: false
    }
}, {
    tableName: 'operations',
    timestamps: false
});

module.exports = Operation;