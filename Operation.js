const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Compte = require('./compte');

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
        type: DataTypes.STRING, // "DEPOT", "RETRAIT", "INTERETS"
        allowNull: false
    }
}, {
    tableName: 'operations',
    timestamps: false
});

// Relation 1 à N (Un compte a plusieurs opérations)
Compte.hasMany(Operation, { foreignKey: 'compteId', as: 'operations' });
Operation.belongsTo(Compte, { foreignKey: 'compteId', as: 'compte' });

module.exports = Operation;