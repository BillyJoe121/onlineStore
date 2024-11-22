const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const cartFilePath = path.join(__dirname, '../data/cart.json'); // Ruta de cart.json

// Leer carrito desde JSON
function getCart() {
    if (fs.existsSync(cartFilePath)) {
        const data = fs.readFileSync(cartFilePath, 'utf-8');
        return JSON.parse(data).cart || [];
    }
    return [];
}

// Guardar carrito en JSON
function saveCart(cart) {
    fs.writeFileSync(cartFilePath, JSON.stringify({ cart }), 'utf-8');
}

// GET: Obtener el carrito completo
router.get('/', (req, res) => {
    try {
        const cart = getCart();
        res.json({ cart });
    } catch (error) {
        console.error('Error al leer el carrito:', error);
        res.status(500).json({ message: 'Error al obtener el carrito.' });
    }
});

// POST: Añadir producto al carrito
router.post('/', (req, res) => {
    const { productId, productName, quantity, price, stock } = req.body;

    if (!productId || !productName || !quantity || !price || !stock) {
        return res.status(400).json({ message: 'Datos inválidos.' });
    }

    // Leer el carrito actual
    const cart = getCart();

    // Buscar si el producto ya está en el carrito
    const existingProduct = cart.find((item) => item.productId === productId);

    if (existingProduct) {
        // Verificar si la cantidad total excede el stock
        if (existingProduct.quantity + quantity > stock) {
            return res.status(400).json({
                message: `No puedes añadir más del stock disponible (${stock}).`,
            });
        }
        existingProduct.quantity += quantity; // Incrementar cantidad
    } else {
        // Validar cantidad inicial no excede el stock
        if (quantity > stock) {
            return res.status(400).json({
                message: `No puedes añadir más del stock disponible (${stock}).`,
            });
        }

        // Añadir producto nuevo al carrito
        cart.push({ productId, productName, quantity, price, stock });
    }

    // Guardar carrito actualizado
    saveCart(cart);

    res.json({ message: 'Producto añadido al carrito', cart });
});

router.delete('/', (req, res) => {
    console.log('DELETE request received to clear the cart.');
    const emptyCart = { cart: [] };

    fs.writeFile(cartFilePath, JSON.stringify(emptyCart, null, 2), (err) => {
        if (err) {
            console.error('Error al vaciar el carrito:', err);
            return res.status(500).json({ message: 'Error al vaciar el carrito.' });
        }
        console.log('Carrito vaciado correctamente en el archivo cart.json');
        res.status(200).json({ message: 'Carrito vaciado correctamente.' });
    });
});




module.exports = router;
