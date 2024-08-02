document.addEventListener("DOMContentLoaded", function() {
    // Fonction pour ajouter une nouvelle ligne au tableau
    window.addRow = function() {
        const table = document.getElementById("stockTable").getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();
        newRow.classList.add('animate__animated', 'animate__fadeIn');

        // Créer des cellules pour chaque colonne
        const produitCell = newRow.insertCell(0);
        const typeCell = newRow.insertCell(1);
        const qtyInCell = newRow.insertCell(2);
        const qtyOutCell = newRow.insertCell(3);
        const stockCell = newRow.insertCell(4);
        const dateInCell = newRow.insertCell(5);
        const dateOutCell = newRow.insertCell(6);

        // Ajouter des champs de saisie dans les cellules
        produitCell.innerHTML = '<input type="text" class="form-control" placeholder="Produit">';
        typeCell.innerHTML = '<input type="text" class="form-control" placeholder="Type">';
        qtyInCell.innerHTML = '<input type="number" class="form-control" value="0" min="0" oninput="calculateStock(this)">';
        qtyOutCell.innerHTML = '<input type="number" class="form-control" value="0" min="0" oninput="calculateStock(this)">';
        stockCell.innerHTML = '<span>0</span>';
        dateInCell.innerHTML = '<input type="date" class="form-control">';
        dateOutCell.innerHTML = '<input type="date" class="form-control">';

        // Recalculer les stocks pour mettre à jour les alertes
        checkLowStock();
    }

    // Fonction pour calculer la quantité en stock
    window.calculateStock = function(input) {
        const row = input.parentNode.parentNode;
        const qtyIn = parseInt(row.cells[2].getElementsByTagName('input')[0].value) || 0;
        const qtyOut = parseInt(row.cells[3].getElementsByTagName('input')[0].value) || 0;
        const stockCell = row.cells[4].getElementsByTagName('span')[0];
        const stock = qtyIn - qtyOut;

        stockCell.innerText = stock;
        checkLowStock();
    }

    // Fonction pour vérifier les stocks faibles et afficher les alertes
    window.checkLowStock = function() {
        const rows = document.getElementById("stockTable").getElementsByTagName('tbody')[0].rows;
        const alertsContainer = document.getElementById('lowStockAlerts');
        alertsContainer.innerHTML = ''; // Clear existing alerts

        for (let row of rows) {
            const produit = row.cells[0].getElementsByTagName('input')[0].value;
            const stock = parseInt(row.cells[4].getElementsByTagName('span')[0].innerText);

            if (stock < 5) {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item alert-low-stock'; // Ajouter la classe d'alerte
                listItem.textContent = `${produit}: ${stock} en stock`;
                alertsContainer.appendChild(listItem);
            }
        }
    }

    // Fonction pour exporter le tableau en CSV
    window.exportTableToCSV = function() {
        const table = document.getElementById('stockTable');
        let csvContent = '';

        // Ajouter les en-têtes
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent).join(',');
        csvContent += headers + '\n';

        // Ajouter les lignes
        Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
            const rowData = Array.from(row.querySelectorAll('td')).map(td => {
                const input = td.querySelector('input');
                if (input) {
                    return `"${input.value.replace(/"/g, '""')}"`; // Échapper les guillemets
                }
                return `"${td.textContent.replace(/"/g, '""')}"`; // Échapper les guillemets
            }).join(',');
            csvContent += rowData + '\n';
        });

        // Télécharger le fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'stock_data.csv';
        link.click();
    }

    // Fonction pour importer des données depuis un fichier CSV
    window.importFromCSV = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;

            // Détecter le séparateur du CSV (virgule ou point-virgule)
            const separator = text.includes(';') ? ';' : ',';

            // Traiter les lignes du CSV
            const rows = text.split('\n').map(row => row.split(separator).map(cell => cell.trim()));

            // Sélectionner le corps du tableau
            const table = document.getElementById('stockTable').getElementsByTagName('tbody')[0];
            table.innerHTML = ''; // Effacer les lignes existantes

            // Ajouter les lignes au tableau
            rows.forEach((row, index) => {
                if (index === 0) return; // Ignorer la ligne d'en-tête
                const newRow = table.insertRow();
                row.forEach(cell => {
                    const newCell = newRow.insertCell();
                    newCell.textContent = cell;
                });
            });

            // Recalculer les stocks pour mettre à jour les alertes
            checkLowStock();
        };

        reader.readAsText(file, 'UTF-8'); // Spécifier l'encodage
    }
});
