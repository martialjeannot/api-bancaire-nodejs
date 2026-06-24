const Compte = require('../models/compte');
const Operation = require('../models/operation');
const { Op } = require('sequelize');

// TACHE 1 : CRÉER UN COMPTE
exports.creerCompte = async (req, res) => {
    try {
        const { nomClient, solde, tauxInteret } = req.body;
        const numeroCompte = "CB-" + Math.floor(1000 + Math.random() * 9000);
        
        const nouveauCompte = await Compte.create({
            numeroCompte, nomClient, solde: solde || 0, tauxInteret: tauxInteret || 0.03, actif: true
        });
        res.status(201).json(nouveauCompte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// TACHE 2 : CONNEXION AU COMPTE (Authentification simplifiée par Numéro de Compte)
exports.connexionCompte = async (req, res) => {
    try {
        const { numeroCompte } = req.body;
        const compte = await Compte.findOne({ where: { numeroCompte } });
        
        if (!compte) return res.status(404).json({ error: "Numéro de compte invalide ou inexistant" });
        if (!compte.actif) return res.status(403).json({ error: "Ce compte est bloqué" });

        res.json({ message: "Connexion réussie", compte });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// TACHE 3 & 4 : DEPOT ET RETRAIT
exports.faireTransaction = async (req, res) => {
    try {
        const { numero, montant, type } = req.body; // type: "DEPOT" ou "RETRAIT"
        const compte = await Compte.findOne({ where: { numeroCompte: numero } });

        if (!compte) return res.status(404).json({ error: "Compte introuvable" });
        if (!compte.actif) return res.status(403).json({ error: "Ce compte est bloqué !" });

        if (type.toUpperCase() === 'RETRAIT') {
            if (compte.solde < montant) return res.status(400).json({ error: "Solde insuffisant" });
            compte.solde -= parseFloat(montant);
        } else if (type.toUpperCase() === 'DEPOT') {
            compte.solde += parseFloat(montant);
        } else {
            return res.status(400).json({ error: "Type de transaction invalide" });
        }

        await compte.save();

        await Operation.create({
            montant,
            type: type.toUpperCase(),
            compteId: compte.id
        });

        res.json({ message: "Transaction réussie", nouveauSolde: compte.solde });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// TACHE 5 : TRANSFERT D'ARGENT (Compte à Compte)
exports.transfererArgent = async (req, res) => {
    try {
        const { numeroSource, numeroDestination, montant } = req.body;

        const compteSource = await Compte.findOne({ where: { numeroCompte: numeroSource } });
        const compteDest = await Compte.findOne({ where: { numeroCompte: numeroDestination } });

        if (!compteSource || !compteDest) return res.status(404).json({ error: "Un ou deux comptes sont introuvables" });
        if (!compteSource.actif || !compteDest.actif) return res.status(403).json({ error: "L'un des comptes est bloqué" });
        if (compteSource.solde < montant) return res.status(400).json({ error: "Solde insuffisant pour effectuer le transfert" });

        // Débit Source
        compteSource.solde -= parseFloat(montant);
        await compteSource.save();
        await Operation.create({ montant, type: 'TRANSFERT_SORTANT', compteId: compteSource.id });

        // Crédit Destination
        compteDest.solde += parseFloat(montant);
        await compteDest.save();
        await Operation.create({ montant, type: 'TRANSFERT_ENTRANT', compteId: compteDest.id });

        res.json({ message: "Transfert effectué avec succès", soldeRestant: compteSource.solde });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// TACHE 6 : SUPPRESSION DU COMPTE PAR L'ADMIN
exports.supprimerCompteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const compte = await Compte.findByPk(id);

        if (!compte) return res.status(404).json({ error: "Compte introuvable" });

        // Supprimer d'abord les opérations liées à cause des clés étrangères
        await Operation.destroy({ where: { compteId: id } });
        // Supprimer le compte
        await compte.destroy();

        res.json({ message: "Compte supprimé définitivement par l'administrateur" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Pour l'affichage sur le front
exports.getTousLesComptes = async (req, res) => {
    try { const comptes = await Compte.findAll(); res.json(comptes); } catch (e) { res.status(500).json({ error: e.message }); }
};