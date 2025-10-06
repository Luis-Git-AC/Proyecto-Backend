const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
  const id = decoded.userId || decoded.id;
  const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido. Usuario no encontrado.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Cuenta desactivada.' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log('❌ Error en authMiddleware:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    
    res.status(500).json({ error: 'Error en la autenticación.' });
  }
};

module.exports = authMiddleware;