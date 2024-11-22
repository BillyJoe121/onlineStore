class Product {
    constructor(id, name, description, price, category, stock, imageUrl) {
        this.id = id;             // ID único del producto
        this.name = name;         // Nombre del producto
        this.description = description; // Descripción
        this.price = price;       // Precio
        this.stock = stock;       // Cantidad en inventario
        this.imageUrl = imageUrl; // URL de la imagen
    }

    // Método estático para validar datos del producto
    static validate(productData) {
        const { name, price, category, stock } = productData;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return { valid: false, message: 'Invalid product name' };
        }
        if (typeof price !== 'number' || price <= 0) {
            return { valid: false, message: 'Invalid product price' };
        }
        if (!category || typeof category !== 'string') {
            return { valid: false, message: 'Invalid product category' };
        }
        if (typeof stock !== 'number' || stock < 0) {
            return { valid: false, message: 'Invalid product stock' };
        }
        return { valid: true };
    }
}

module.exports = Product;
