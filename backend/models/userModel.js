class User {
  constructor(id, username, email, password) {
      this.id = id;           // ID único del usuario
      this.username = username; // Nombre de usuario
      this.email = email;       // Correo electrónico
      this.password = password; // Contraseña (encriptada)
  }

  // Método estático para validar datos antes de crear un usuario
  static validate(userData) {
      const { username, email, password } = userData;

      if (!username || typeof username !== 'string' || username.trim() === '') {
          return { valid: false, message: 'Invalid username' };
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
          return { valid: false, message: 'Invalid email' };
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
          return { valid: false, message: 'Password must be at least 6 characters' };
      }
      return { valid: true };
  }
}

module.exports = User;
