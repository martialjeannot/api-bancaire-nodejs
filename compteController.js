const Compte = require('../models/compte');
const Operation = require('../models/operation');
const { Op } = require('sequelize');

// 1. LISTER TOUS LES COMPTES (Espace Admin)
exports.getTousLesComptes = async (req, res) => {
    try {
        const comptes = await Compte.findAll();
        res.json(comptes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. RECHERCHE AVANCÉE ET FILTRAGE
exports.rechercherClient = async (req, res) => {
    try {
        const { nom } = req.query;
        const comptes = await Compte.findAll({
            where: {
                nomClient: { [Op.like]: `%${nom}%` }
            }
        });
        res.json(comptes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. STATISTIQUES GLOBALES
exports.getGlobalStats = async (req, res) => {
    try {
        const comptes = await Compte.findAll();
        const totalSolde = comptes.reduce((sum, c) => sum + c.solde, 0);
        const nombreComptes = comptes.length;
        const comptesActifs = comptes.filter(c => c.actif).length;

        res.json({
            totalDepotsBanque: totalSolde,
            nombreTotalComptes: nombreComptes,
            nombreComptesActifs: comptesActifs,
            moyenneSolde: nombreComptes > 0 ? totalSolde / nombreComptes : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. CRÉATION DE COMPTE (Avec Email & Téléphone)
exports.creerCompte = async (req, res) => {
    try {
        // Ajout de email et telephone récupérés du corps de la requête (req.body)
        const { nomClient, solde, tauxInteret, email, telephone } = req.body;
        const numeroCompte = "CB-" + Math.floor(1000 + Math.random() * 9000);
        
        const nouveauCompte = await Compte.create({
            numeroCompte, 
            nomClient, 
            email,       // Sauvegarde l'email
            telephone,   // Sauvegarde le téléphone
            solde, 
            tauxInteret, 
            actif: true
        });
        res.status(201).json(nouveauCompte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. TRANSACTION AVEC HISTORIQUE (Dépôt / Retrait)
exports.faireTransaction = async (req, res) => {
    try {
        const { numero, montant, type } = req.body;
        const compte = await Compte.findOne({ where: { numeroCompte: numero } });

        if (!compte) return res.status(404).send("Erreur : Compte introuvable");
        if (!compte.actif) return res.status(403).send("Erreur : Ce compte est bloqué !");

        if (type.toLowerCase() === 'retrait') {
            if (compte.solde < montant) return res.status(400).send("Erreur : Solde insuffisant");
            compte.solde -= montant;
        } else {
            compte.solde += montant;
        }

        await compte.save();

        // Sauvegarde de l'historique
        await Operation.create({
            montant,
            type: type.toUpperCase(),
            compteId: compte.id
        });

        res.send(`Transaction réussie. Nouveau solde : ${compte.solde}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. CALCUL D'INTÉRÊTS
exports.appliquerInterets = async (req, res) => {
    try {
        const { id } = req.params;
        const compte = await Compte.findByPk(id);

        if (!compte) return res.status(404).send("Compte non trouvé");

        const interets = compte.solde * compte.tauxInteret;
        compte.solde += interets;
        await compte.save();

        await Operation.create({
            montant: interets,
            type: "INTERETS",
            compteId: compte.id
        });

        res.send(`Intérêts appliqués : +${interets}. Nouveau solde : ${compte.solde}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. BLOCAGE / DÉBLOCAGE
exports.changerStatut = async (req, res) => {
    try {
        const { id } = req.params;
        const { actif } = req.body;
        
        const compte = await Compte.findByPk(id);
        if (!compte) return res.status(404).send("Compte non trouvé");

        compte.actif = actif;
        await compte.save();
        res.json(compte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. SUPPRESSION ADMINISTRATIVE DU COMPTE (Nettoyage en cascade automatique)
exports.supprimerCompteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const compte = await Compte.findByPk(id);

        if (!compte) {
            return res.status(404).json({ error: "Compte introuvable" });
        }

        // Détruit le compte. Grâce au onDelete: 'CASCADE', Sequelize s'occupe des opérations liées.
        await compte.destroy();
        res.json({ message: `Le compte ID ${id} et ses opérations liées ont été supprimés.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. TRANSFERT D'ARGENT DE COMPTE À COMPTE
exports.transfererArgent = async (req, res) => {
    try {
        const { sourceNumero, destNumero, montant } = req.body;

        const compteSource = await Compte.findOne({ where: { numeroCompte: sourceNumero } });
        const compteDest = await Compte.findOne({ where: { numeroCompte: destNumero } });

        if (!compteSource || !compteDest) return res.status(404).send("Erreur : Compte source ou destination introuvable");
        if (!compteSource.actif || !compteDest.actif) return res.status(403).send("Erreur : L'un des comptes est bloqué !");
        if (compteSource.solde < montant) return res.status(400).send("Erreur : Solde de l'émetteur insuffisant");

        // Traitement
        compteSource.solde -= montant;
        compteDest.solde += montant;

        await compteSource.save();
        await compteDest.save();

        // Historique pour les deux comptes
        await Operation.create({ montant, type: 'RETRAIT', compteId: compteSource.id });
        await Operation.create({ montant, type: 'DEPOT', compteId: compteDest.id });

        res.send(`Virement effectué avec succès. Nouveau solde émetteur : ${compteSource.solde}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};