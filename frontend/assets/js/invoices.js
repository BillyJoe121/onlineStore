document.addEventListener('DOMContentLoaded', async () => {
    const invoiceTableBody = document.getElementById('invoiceTableBody');

    // Obtener el token de autenticación
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Debes iniciar sesión para ver tus facturas.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Decodificar el token para obtener el correo del usuario
        const userPayload = JSON.parse(atob(authToken.split('.')[1]));
        const userEmail = userPayload.email;

        // Obtener facturas del backend usando el email
        const response = await fetch(`http://localhost:3000/api/invoices/${userEmail}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const invoices = await response.json();

        if (response.ok && invoices.length > 0) {
            // Llenar la tabla con las facturas
            invoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.classList.add('hover-row', 'border-b', 'border-gray-200');

                row.innerHTML = `
                    <td class="p-4">${invoice.customer.name}</td>
                    <td class="p-4">${invoice.products.map(p => p.name).join(', ')}</td>
                    <td class="p-4">$${invoice.total.toFixed(2)}</td>
                `;

                invoiceTableBody.appendChild(row);
            });
        } else {
            invoiceTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center p-4">No tienes facturas registradas.</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error al cargar las facturas:', error);
        alert('Hubo un problema al cargar las facturas.');
    }
});
