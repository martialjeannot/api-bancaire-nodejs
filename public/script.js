const log = (data) => {
    document.getElementById('consoleResultat').innerText = JSON.stringify(data, null, 2);
};

// 1. Applique la création de compte
async function creerCompte() {
    const nomClient = document.getElementById('creerNom').value;
    const solde = document.getElementById('creerSolde').value;
    
    const res = await fetch('/api/comptes/creer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomClient, solde })
    });
    const data = await res.json();
    log(data);
}

// 2. Connexion
async function connexionCompte() {
    const numeroCompte = document.getElementById('connexionNumero').value;
    const res = await fetch('/api/comptes/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroCompte })
    });
    const data = await res.json();
    log(data);
}

// 3. Dépôt et Retrait
async function faireTransaction() {
    const numero = document.getElementById('transacNumero').value;
    const montant = document.getElementById('transacMontant').value;
    const type = document.getElementById('transacType').value;

    const res = await fetch('/api/comptes/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, montant, type })
    });
    const data = await res.json();
    log(data);
}

// 4. Transfert de compte à compte
async function faireTransfert() {
    const numeroSource = document.getElementById('transfSource').value;
    const numeroDestination = document.getElementById('transfDest').value;
    const montant = document.getElementById('transfMontant').value;

    const res = await fetch('/api/comptes/transfert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroSource, numeroDestination, montant })
    });
    const data = await res.json();
    log(data);
}

// 5. Suppression administrative
async function supprimerCompte() {
    const id = document.getElementById('supprId').value;
    if(!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce compte ?")) return;

    const res = await fetch(`/api/comptes/${id}/supprimer`, { method: 'DELETE' });
    const data = await res.json();
    log(data);
}

// 6. Charger tous les comptes
async function chargerTousLesComptes() {
    const res = await fetch('/api/comptes');
    const data = await res.json();
    log(data);
}