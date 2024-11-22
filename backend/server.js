const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); // Agregamos las rutas de facturas
const adminRoutes = require('./routes/adminRoutes'); // Ruta del archivo creado


const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rutas de la API
app.use('/api/auth', authRoutes);         // Rutas de autenticación
app.use('/api/products', productRoutes); // Rutas de productos
app.use('/api/invoices', invoiceRoutes); // Aquí va la ruta de facturas
app.use('/api/admin', adminRoutes);


// Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Ruta principal para redirigir al frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Manejar cualquier otra ruta no definida
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
