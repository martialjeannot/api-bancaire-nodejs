const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Compte = sequelize.define('Compte', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    numeroCompte: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    nomClient: {
        type: DataTypes.STRING,
        allowNull: false
    },
    solde: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.0
    },
    tauxInteret: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.03
    },
    actif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'comptes',
    timestamps: false
});

module.exports = Compte;