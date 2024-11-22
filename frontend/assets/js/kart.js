document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('name');
    const unitPrice = parseFloat(urlParams.get('price'));
    const productImage = urlParams.get('imageUrl');

    const quantityInput = document.getElementById('quantity');
    const summaryQuantity = document.getElementById('summaryQuantity');
    const totalPrice = document.getElementById('totalPrice');
    const confirmOrderButton = document.getElementById('confirmOrder');
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const invoiceDetails = document.getElementById('invoiceDetails');
    const closePopup = document.getElementById('closePopup');

    // Mostrar datos del producto en el resumen
    document.getElementById('productName').textContent = productName;
    document.getElementById('unitPrice').textContent = unitPrice.toFixed(2);

    // Actualiza el resumen de compra
    function updateSummary() {
        const quantity = parseInt(quantityInput.value, 10);
        summaryQuantity.textContent = quantity;
        totalPrice.textContent = (unitPrice * quantity).toFixed(2);
    }

    quantityInput.addEventListener('input', updateSummary);


    // Confirmar pedido
    confirmOrderButton.addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const quantity = parseInt(quantityInput.value, 10);

        if (!name || !address || !phone || quantity < 1) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Crear factura
        const invoice = {
            customer: { name, address, phone },
            product: { name: productName, unitPrice, quantity },
            total: unitPrice * quantity,
            paymentMethod: "Pago contra entrega"
        };

        // Guardar factura en JSON en el servidor
        saveInvoice(invoice);

        // Mostrar factura en popup
        invoiceDetails.innerHTML = `
            <p><strong>Cliente:</strong> ${name}</p>
            <p><strong>Dirección:</strong> ${address}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Producto:</strong> ${productName}</p>
            <p><strong>Cantidad:</strong> ${quantity}</p>
            <p><strong>Total:</strong> $${(unitPrice * quantity).toFixed(2)}</p>
            <p><strong>Método de pago:</strong> Pago contra entrega</p>
        `;
        popup.classList.add('active');
        overlay.classList.add('active');
    });

    closePopup.addEventListener('click', () => {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Simulación de guardado en JSON
    function saveInvoice(invoice) {
        fetch('http://localhost:3000/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice)
        })
        .then(response => response.json())
        .then(data => console.log('Invoice saved:', data))
        .catch(error => console.error('Error saving invoice:', error));
    }    

    // Inicializar resumen
    updateSummary();
});
