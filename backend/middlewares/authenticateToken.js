const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // Usa una clave segura y guarda en variables de entorno

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtener el token del encabezado Authorization

    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });

        req.user = user; // Agregar el usuario decodificado a la request
        next();
    });
}

module.exports = authenticateToken;
