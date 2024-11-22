const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON donde se guardan los productos
const productsFilePath = path.join(__dirname, '../data/products.json');

// Ruta para obtener todos los productos
router.get('/', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
        res.status(200).json(products);
    } catch (error) {
        console.error('Error reading products file:', error);
        res.status(500).json({ message: 'Error loading products.' });
    }
});

// **Ruta POST para guardar un producto**
router.post('/', (req, res) => {
    const newProduct = req.body;

    try {
        // Leer el archivo de productos
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));

        // Generar un ID único para el producto
        const productId = Date.now();
        newProduct.id = productId;

        // Agregar el nuevo producto con ID
        products.push(newProduct);

        // Guardar el archivo actualizado
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
        res.status(201).json({ message: 'Product saved successfully!', product: newProduct });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ message: 'Error saving product.' });
    }
});

// Exportar el router
module.exports = router;
