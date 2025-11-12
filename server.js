require('dotenv').config();
const express = require('express');

const { connectDB, mongoose } = require('./src/config/db');

const cloudinary = require('./src/config/cloudinary');

const authRoutes = require('./src/routes/authRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const userRoutes = require('./src/routes/userRoutes');

const authMiddleware = require('./src/middleware/authMiddleware');
const requireRole = require('./src/middleware/roleMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log('📍 Petición recibida:', req.method, req.url);
  console.log('📦 Body:', req.body);
  next();
});

app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/users', userRoutes);

app.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Perfil del usuario',
    user: req.user
  });
});

app.get('/admin/dashboard', authMiddleware, requireRole(['admin']), (req, res) => {
  res.json({
    message: 'Panel de administración',
    user: req.user
  });
});

app.get('/dashboard', authMiddleware, requireRole(['user', 'admin']), (req, res) => {
  res.json({
    message: 'Dashboard general',
    user: req.user
  });
});

connectDB();

require('./src/models/User');
require('./src/models/Item');

app.get('/cloudinary-test', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({
      message: '✅ Cloudinary conectado correctamente',
      cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        status: result.status
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '❌ Error conectando a Cloudinary',
      message: error.message
    });
  }
});

app.get('/db-status', (req, res) => {
  const estado = {
    connected: mongoose.connection.readyState === 1,
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    models: Object.keys(mongoose.connection.models)
  };
  res.json(estado);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando!',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

app.get('/test-models', (req, res) => {
  const User = require('./src/models/User');
  const Item = require('./src/models/Item');
  res.json({
    userModel: User ? '✅ User model cargado' : '❌ User model no cargado',
    itemModel: Item ? '✅ Item model cargado' : '❌ Item model no cargado'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});