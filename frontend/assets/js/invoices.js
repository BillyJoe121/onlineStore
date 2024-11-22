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

        // Obtener facturas del backend
        const response = await fetch(`http://localhost:3000/api/invoices/${userEmail}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        

        const invoices = await response.json();

        if (response.ok) {
            // Llenar la tabla con las facturas
            invoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.classList.add('hover-row', 'border-b', 'border-gray-200');

                row.innerHTML = `
                    <td class="p-4">${invoice.id}</td>
                    <td class="p-4">${invoice.customer.name}</td>
                    <td class="p-4">${invoice.product.name}</td>
                    <td class="p-4">$${invoice.total.toFixed(2)}</td>
                    <td class="p-4">${new Date(invoice.date).toLocaleDateString()}</td>
                `;

                invoiceTableBody.appendChild(row);
            });
        } else {
            alert('No se pudieron cargar las facturas. Intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error al cargar las facturas:', error);
        alert('Hubo un problema al cargar las facturas.');
    }
});
