const { readUsersFromFile, writeUsersToFile } = require('../data/jsonHandler');
const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs'); // Importar File System


// Ruta del archivo de productos
const productsFilePath = path.join(__dirname, '../data/products.json');

// Funciones auxiliares para manejar productos
const readProductsFromFile = () => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error leyendo el archivo de productos:', err);
        return [];
    }
};

const writeProductsToFile = (products) => {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    } catch (err) {
        console.error('Error escribiendo el archivo de productos:', err);
    }
};

// Obtener todos los productos
const getProducts = (req, res) => {
    const products = readProductsFromFile();
    res.json(products);
};

// Obtener un producto por ID
const getProductById = (req, res) => {
    const products = readProductsFromFile();
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
};

// Crear un nuevo producto
const createProduct = (req, res) => {
    const { name, description, price, stock, imageUrl } = req.body;

    // Validar datos
    const validation = Product.validate({ name, price, description, stock, imageUrl});
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const products = readProductsFromFile();

    // Crear el nuevo producto
    const newProduct = new Product(Date.now(), name, description, price, stock, imageUrl);
    products.push(newProduct);

    // Guardar productos actualizados
    writeProductsToFile(products);

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
};

// Actualizar un producto
const updateProduct = (req, res) => {
    const products = readProductsFromFile();
    const index = products.findIndex((p) => p.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Actualizar el producto
    const updatedProduct = { ...products[index], ...req.body };
    products[index] = updatedProduct;

    // Guardar productos actualizados
    writeProductsToFile(products);

    res.json({ message: 'Product updated successfully', product: updatedProduct });
};

// Eliminar un producto
const deleteProduct = (req, res) => {
    const products = readProductsFromFile();
    const filteredProducts = products.filter((p) => p.id !== parseInt(req.params.id));

    if (products.length === filteredProducts.length) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Guardar productos actualizados
    writeProductsToFile(filteredProducts);

    res.json({ message: 'Product deleted successfully' });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
