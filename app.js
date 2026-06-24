const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 🛠️ CONFIGURATION DE SWAGGER UI
// ==========================================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Bancaire - ICT 304',
            version: '1.0.0',
            description: 'Documentation interactive de la gestion des comptes bancaires et opérations',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Modifie le port (ex: 8080) si ton serveur local tourne sur un autre port
                description: 'Serveur Local'
            },
            {
                url: 'https://tp-api-bancaire.onrender.com', // Met l'URL exacte de ton application Render
                description: 'Serveur de Production Render'
            }
        ],
    },
    // On dit à Swagger de chercher les annotations JSDoc directement dans app.js, compteController.js et le dossier controllers/
    apis: ['./app.js', './compteController.js', './controllers/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ==========================================

// --- TES ROUTES RESTE INCHANGÉES ICI ---
// Exemple : app.post('/comptes/creer', ...) 
// Laisse ton code actuel ici


// Export de l'application pour tes tests unitaires (Vitest)
module.exports = app;

// Démarrage du serveur si on n'est pas en environnement de test
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(` Serveur démarré sur le port ${PORT}`);
        console.log(` Swagger disponible sur http://localhost:${PORT}/api-docs`);
    });
}