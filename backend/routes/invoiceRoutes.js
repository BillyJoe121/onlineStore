const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Rutas de los archivos JSON
const invoicesFilePath = path.join(__dirname, '../data/invoices.json');
const productsFilePath = path.join(__dirname, '../data/products.json');
const cartFilePath = path.join(__dirname, '../data/cart.json'); // Ruta para limpiar el carrito

// Ruta para guardar una factura
router.post('/', (req, res) => {
    const newInvoice = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const userEmail = token ? jwt.decode(token).email : 'cliente@example.com';

 
    newInvoice.userEmail = userEmail; // Agregar el correo del usuario a la factura

    // Leer el archivo de facturas
    fs.readFile(invoicesFilePath, 'utf8', (err, invoiceData) => {
        if (err) {
            console.error('Error leyendo el archivo de facturas:', err);
            return res.status(500).json({ message: 'Error leyendo el archivo de facturas.' });
        }

        const invoices = invoiceData ? JSON.parse(invoiceData) : [];
        invoices.push(newInvoice);

        // Guardar la nueva factura
        fs.writeFile(invoicesFilePath, JSON.stringify(invoices, null, 2), (err) => {
            if (err) {
                console.error('Error escribiendo el archivo de facturas:', err);
                return res.status(500).json({ message: 'Error guardando la factura.' });
            }

            // Actualizar inventario para todos los productos de la factura
            const updateResults = updateProductInventory(newInvoice.products);

            if (updateResults.error) {
                return res.status(400).json({ message: updateResults.error });
            }

            // Limpiar el carrito después de una compra exitosa
            clearCart((cartErr) => {
                if (cartErr) {
                    console.error('Error al limpiar el carrito:', cartErr);
                    return res.status(500).json({ message: 'Error al limpiar el carrito.' });
                }

                res.status(201).json({
                    message: 'Factura guardada, el inventario actualizado y el carrito limpiado con éxito.',
                });
            });
        });
    });
});

// Ruta para obtener facturas por correo del usuario
router.get('/:email', (req, res) => {
    const userEmail = req.params.email;

    // Leer el archivo de facturas
    fs.readFile(invoicesFilePath, 'utf8', (err, invoiceData) => {
        if (err) {
            console.error('Error leyendo el archivo de facturas:', err);
            return res.status(500).json({ message: 'Error leyendo el archivo de facturas.' });
        }

        const invoices = invoiceData ? JSON.parse(invoiceData) : [];
        const userInvoices = invoices.filter((invoice) => invoice.userEmail === userEmail);

        res.status(200).json(userInvoices);
    });
});

// Función para actualizar el inventario
function updateProductInventory(productsInInvoice) {
    try {
        const productData = fs.readFileSync(productsFilePath, 'utf8');
        const products = productData ? JSON.parse(productData) : [];

        productsInInvoice.forEach((invoiceProduct) => {
            const productIndex = products.findIndex((p) => p.name === invoiceProduct.name);

            if (productIndex === -1) {
                console.error(`Producto "${invoiceProduct.name}" no encontrado.`);
                throw new Error(`Producto "${invoiceProduct.name}" no encontrado.`);
            }

            if (products[productIndex].stock < invoiceProduct.quantity) {
                console.error(`Stock insuficiente para "${invoiceProduct.name}".`);
                throw new Error(
                    `Stock insuficiente para "${invoiceProduct.name}". Stock disponible: ${products[productIndex].stock}`
                );
            }

            // Reducir el stock
            products[productIndex].stock -= invoiceProduct.quantity;
        });

        // Guardar los productos actualizados
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
        console.log('Inventario actualizado correctamente.');
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar el inventario:', error);
        return { error: error.message };
    }
}

// Función para limpiar el carrito
function clearCart(callback) {
    const emptyCart = { cart: [] };

    fs.writeFile(cartFilePath, JSON.stringify(emptyCart, null, 2), (err) => {
        if (err) {
            console.error('Error al vaciar el carrito:', err);
            return callback(err);
        }
        console.log('Carrito vaciado correctamente.');
        callback(null); // Sin error
    });
}

module.exports = router;


