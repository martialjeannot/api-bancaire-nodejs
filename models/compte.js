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
    // NOUVEAU : Champ Email
    email: {
        type: DataTypes.STRING,
        allowNull: true // true pour éviter de bloquer tes anciens comptes sans email
    },
    // NOUVEAU : Champ Téléphone
    telephone: {
        type: DataTypes.STRING,
        allowNull: true
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

// ==========================================
// CONFIGURATION DES RELATIONS (ASSOCIATIONS)
// ==========================================
// On importe le modèle Operation pour créer le lien
const Operation = require('./operation'); 

// Un Compte possède plusieurs Opérations
Compte.hasMany(Operation, { 
    foreignKey: 'compteId', 
    onDelete: 'CASCADE' // Si le compte est supprimé, toutes ses opérations disparaissent aussi
});

// Une Opération appartient à un Compte
Operation.belongsTo(Compte, { 
    foreignKey: 'compteId' 
});

module.exports = Compte;