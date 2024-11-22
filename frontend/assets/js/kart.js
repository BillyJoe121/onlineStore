document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api'; // Cambia esto según tu entorno
    const orderSummaryContainer = document.getElementById('orderSummary'); // Contenedor del resumen
    const confirmOrderButton = document.getElementById('confirmOrder');
    const popup = document.getElementById('popup'); // Popup de factura
    const overlay = document.getElementById('overlay'); // Overlay
    const invoiceDetails = document.getElementById('invoiceDetails'); // Contenedor de detalles de la factura

    let cart = [];

    // Cargar carrito desde el backend
    async function loadCart() {
        try {
            const response = await fetch(`${API_URL}/cart`);
            const data = await response.json();

            cart = data.cart; // Acceder al array dentro de la clave "cart"

            if (cart.length > 0) {
                renderCart(cart);
            } else {
                orderSummaryContainer.innerHTML = `
                    <p class="text-center text-red-500">El carrito está vacío.</p>
                `;
                confirmOrderButton.disabled = true; // Deshabilitar el botón de compra
            }
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            alert(`Hubo un problema al cargar el carrito. Detalle: ${error.message}`);
        }
    }

    // Renderizar el carrito en el DOM
    function renderCart(cart) {
        orderSummaryContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar productos

        let totalAmount = 0;

        cart.forEach((item) => {
            const { productName, price, quantity } = item;

            // Calcular el total de cada producto
            const itemTotal = price * quantity;
            totalAmount += itemTotal;

            // Crear un elemento para el producto
            const productElement = document.createElement('div');
            productElement.className = 'border-b pb-4 mb-4';

            productElement.innerHTML = `
                <p><strong>Producto:</strong> ${productName}</p>
                <p><strong>Precio Unitario:</strong> $${price.toFixed(2)}</p>
                <p><strong>Cantidad:</strong> ${quantity}</p>
                <p><strong>Subtotal:</strong> $${itemTotal.toFixed(2)}</p>
            `;

            orderSummaryContainer.appendChild(productElement);
        });

        // Agregar el total final
        const totalElement = document.createElement('div');
        totalElement.className = 'pt-4 border-t mt-4';

        totalElement.innerHTML = `
            <p class="text-lg font-bold"><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
        `;

        orderSummaryContainer.appendChild(totalElement);
    }

    // Confirmar pedido
    confirmOrderButton.addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;

        if (!name || !address || !phone) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }

        // Crear factura
        const invoice = {
            customer: { name, address, phone },
            products: cart.map((item) => ({
                name: item.productName,
                unitPrice: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity,
            })),
            total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
            paymentMethod: 'Pago contra entrega',
        };

        // Mostrar la factura inmediatamente
        showInvoicePopup(invoice);

        // Guardar factura en el backend
        await saveInvoice(invoice);

        // Reducir stock
        for (const item of cart) {
            await reduceStock(item.productId, item.quantity);
        }
    });

    // Mostrar factura en popup
    function showInvoicePopup(invoice) {
        const { customer, products, total, paymentMethod } = invoice;

        let productDetails = '';
        products.forEach((product) => {
            productDetails += `
                <p><strong>Producto:</strong> ${product.name}</p>
                <p><strong>Precio Unitario:</strong> $${product.unitPrice.toFixed(2)}</p>
                <p><strong>Cantidad:</strong> ${product.quantity}</p>
                <p><strong>Subtotal:</strong> $${product.subtotal.toFixed(2)}</p>
                <hr>
            `;
        });

        invoiceDetails.innerHTML = `
            <p><strong>Cliente:</strong> ${customer.name}</p>
            <p><strong>Dirección:</strong> ${customer.address}</p>
            <p><strong>Teléfono:</strong> ${customer.phone}</p>
            <hr>
            ${productDetails}
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            <p><strong>Método de pago:</strong> ${paymentMethod}</p>
        `;

        popup.classList.add('active');
        overlay.classList.add('active');
    }

    closePopup.addEventListener('click', () => {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        popup.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Guardar factura
    async function saveInvoice(invoice) {
        const response = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice),
        });
        if (!response.ok) {
            throw new Error('Error al guardar la factura.');
        }
    }

    // Reducir stock
    async function reduceStock(productId, quantity) {
        const response = await fetch(`${API_URL}/products/${productId}/reduce-stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) {
            throw new Error('Error al reducir el stock.');
        }
    }

    // Vaciar el carrito
    async function clearCart() {
        try {
            console.log('Intentando vaciar el carrito en el servidor...');
            const response = await fetch(`${API_URL}/cart`, { method: 'DELETE' });
    
            if (!response.ok) {
                throw new Error('Error al vaciar el carrito en el servidor.');
            }
    
            console.log('Carrito vaciado correctamente en el servidor.');
        } catch (error) {
            console.error('Error al intentar vaciar el carrito:', error);
        }
    }

    loadCart(); // Cargar carrito al inicio
});
