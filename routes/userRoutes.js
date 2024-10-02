const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/roleMiddleware');

router.post('/register', userController.registerUser); //Ruta para registar un usuario
router.post('/login', userController.login); //Ruta para el login del usuario
router.get('/', auth, authorizeRole(1), userController.getAllUsers); // Ruta para obtener todos los usuarios, protegida por autentificación
router.get('/:id', auth ,userController.getUserById); // Ruta para obtener un usuario especifico por su ID, protegida por autentificación

module.exports = router;
