const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret'; // Usa el mismo secreto de la app

// Verificar si el usuario es admin
router.get('/is-admin', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const isAdmin = decodedToken.email === 'admin@example.com'; // Verifica si es admin
        res.status(200).json({ isAdmin });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
