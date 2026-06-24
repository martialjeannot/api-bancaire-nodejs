const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });

const supertest = require('supertest');
const app = require('./app');
const sequelize = require('./config/database');

const request = supertest(app);

describe('Tests d integration - API Bancaire', () => {
    let numeroCompteTest;

    beforeAll(async () => {
        // Force la synchronisation sur la base locale propre
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('1. Devrait creer un nouveau compte bancaire', async () => {
        const res = await request
            .post('/api/comptes/creer')
            .send({
                nomClient: "Parfait Test",
                solde: 5000,
                tauxInteret: 0.05
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('numeroCompte');
        expect(res.body.nomClient).toBe("Parfait Test");
        expect(res.body.solde).toBe(5000);
        
        numeroCompteTest = res.body.numeroCompte;
    });

    it('2. Devrait connecter l utilisateur via son numero de compte', async () => {
        const res = await request
            .post('/api/comptes/connexion')
            .send({
                numeroCompte: numeroCompteTest
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Connexion réussie");
    });

    it('3. Devrait effectuer un depot d argent', async () => {
        const res = await request
            .post('/api/comptes/transaction')
            .send({
                numero: numeroCompteTest,
                montant: 2000,
                type: "DEPOT"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.nouveauSolde).toBe(7000);
    });

    it('4. Devrait effectuer un retrait d argent', async () => {
        const res = await request
            .post('/api/comptes/transaction')
            .send({
                numero: numeroCompteTest,
                montant: 3000,
                type: "RETRAIT"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.nouveauSolde).toBe(4000);
    });

    it('5. Devrait refuser un retrait si le solde est insuffisant', async () => {
        const res = await request
            .post('/api/comptes/transaction')
            .send({
                numero: numeroCompteTest,
                montant: 10000,
                type: "RETRAIT"
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});