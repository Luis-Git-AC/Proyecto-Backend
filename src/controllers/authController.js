const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res, next) => {
    try {
         const { name, email, password } = req.body;

         const extingUser = await User.findOne({ email });
         if (extingUser) {
             return res.status(400).json({ message: 'El email ya está en uso' });
         }

         const user = await User.create ({ name, email, password });
            const token = generateToken(user._id);

            res.status(201).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });

    } catch (error) {
        res.status(400).json({ message: 'Error en el registro', error: error.message });
    }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { register, login };