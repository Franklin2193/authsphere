const User = require('../models/User');
const jwt = require('../jsonwwbtoken')

exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
      const newUser = await User.create(username, password);
      res.status(201).json({ id: newUser.id, username: newUser.username});
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar el usuario'});
    }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h'});
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar la sessión'});
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(10, req.query.page ? (req.query.page - 1) * 10 : 0);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios'});
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user= await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({error: 'Error al obtener el usuario'  });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario'});
  }

};
