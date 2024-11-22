const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readUsersFromFile, writeUsersToFile } = require('../data/jsonHandler');
const User = require('../models/userModel');

const JWT_SECRET = 'your_jwt_secret'; // Cambia esto a algo más seguro

// Registrar usuario
const registerUser = (req, res) => {
    const { username, email, password } = req.body;

    // Validar datos
    const validation = User.validate({ username, email, password });
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    // Leer usuarios actuales
    const users = readUsersFromFile();

    // Verificar si el usuario ya existe
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error encrypting password' });
        }

        // Crear nuevo usuario
        const newUser = new User(Date.now(), username, email, hashedPassword);
        users.push(newUser);

        // Guardar usuarios actualizados
        writeUsersToFile(users);

        // Generar token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    });
};

// Login de usuario
const loginUser = (req, res) => {
    const { email, password } = req.body;

    // Leer usuarios actuales
    const users = readUsersFromFile();

    // Buscar usuario por email
    const user = users.find((user) => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verificar la contraseña
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generar token con el ID y el correo del usuario
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ message: 'Login successful', token });
    });
};


module.exports = { registerUser, loginUser };
