const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');


exports.registerUser = async (req, res) => {
  const { username, password, role } = req.body; // acá recibe el rol
  try {
      const newUser = await User.create(username, password, role || 2); // Pasa el rol, por defecto va ser 2 = user, 1 = admin
      res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
  } catch (error) {
      console.error(error);
      if (error.code === '23505') { // Código de error para llave duplicada
          return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
      res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    // Muestra el error en consola y envía una respuesta de error
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar la sesión' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Obtén todos los usuarios
    const users = await User.findAll(limit, offset);
    const usersWithoutPasswords = users.map(({ password, ...user }) => user); 

    // Obtiene el total de usuarios
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');

    // Verifica si hay resultados en totalUsersResult
    const totalUsers = totalUsersResult.rows.length > 0 ? parseInt(totalUsersResult.rows[0].count) : 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // Responde con la información de los usuarios
    res.json({
      users: usersWithoutPasswords,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const userRole = req.userRole;
    const userId = req.userId;
    if (userRole !== 1 && userId !== parseInt(requestedUserId)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
    }

    const user = await User.findById(requestedUserId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario', details: error.message });
  }
};
