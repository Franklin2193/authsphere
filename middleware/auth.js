const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Token requerido' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role; 
    next();
  });
};
