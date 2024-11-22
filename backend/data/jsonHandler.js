const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON de usuarios
const filePath = path.join(__dirname, 'users.json');

// Leer usuarios del archivo JSON
const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data); // Convertir el contenido del archivo JSON en un objeto
    } catch (err) {
        console.error('Error leyendo el archivo JSON:', err);
        return []; // Si hay error, devolver un array vacío
    }
};

// Guardar usuarios en el archivo JSON
const writeUsersToFile = (users) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2)); // Convertir el objeto en JSON y guardar
    } catch (err) {
        console.error('Error escribiendo el archivo JSON:', err);
    }
};

module.exports = { readUsersFromFile, writeUsersToFile };
