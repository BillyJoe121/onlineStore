const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Rutas de los archivos JSON
const invoicesFilePath = path.join(__dirname, '../data/invoices.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Ruta para guardar una factura
router.post('/', (req, res) => {
    const newInvoice = req.body;

    // Simulación: Obtener el correo del usuario desde la sesión o token
    const userEmail = req.user?.email || 'cliente@example.com'; // Reemplaza con lógica real de autenticación
    newInvoice.userEmail = userEmail; // Agregar el correo del usuario a la factura

    // Leer el archivo de facturas
    fs.readFile(invoicesFilePath, 'utf8', (err, invoiceData) => {
        if (err) {
            console.error('Error leyendo el archivo de facturas:', err);
            return res.status(500).json({ message: 'Error reading invoices file.' });
        }

        const invoices = invoiceData ? JSON.parse(invoiceData) : [];
        invoices.push(newInvoice);

        // Guardar la nueva factura
        fs.writeFile(invoicesFilePath, JSON.stringify(invoices, null, 2), (err) => {
            if (err) {
                console.error('Error escribiendo el archivo de facturas:', err);
                return res.status(500).json({ message: 'Error saving invoice.' });
            }

            // Actualizar inventario
            updateProductInventory(newInvoice.product.name, newInvoice.product.quantity, res);
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
            return res.status(500).json({ message: 'Error reading invoices file.' });
        }

        const invoices = invoiceData ? JSON.parse(invoiceData) : [];
        const userInvoices = invoices.filter(invoice => invoice.userEmail === userEmail);

        res.status(200).json(userInvoices);
    });
});

// Función para actualizar el inventario
function updateProductInventory(productName, quantityPurchased, res) {
    fs.readFile(productsFilePath, 'utf8', (err, productData) => {
        if (err) {
            console.error('Error leyendo el archivo de productos:', err);
            return res.status(500).json({ message: 'Error reading products file.' });
        }

        const products = productData ? JSON.parse(productData) : [];
        const productIndex = products.findIndex((p) => p.name === productName);

        if (productIndex === -1) {
            return res.status(404).json({ message: `Product "${productName}" not found.` });
        }

        if (products[productIndex].stock < quantityPurchased) {
            return res.status(400).json({ message: 'Insufficient stock for the product.' });
        }

        // Reducir el stock
        products[productIndex].stock -= quantityPurchased;

        // Guardar los productos actualizados
        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                console.error('Error escribiendo el archivo de productos:', err);
                return res.status(500).json({ message: 'Error updating product inventory.' });
            }

            res.status(201).json({ message: 'Invoice saved and inventory updated successfully!' });
        });
    });
}

module.exports = router;
