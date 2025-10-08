const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log('📍 Petición recibida:', req.method, req.url);
  console.log('📦 Body:', req.body);
  next();
});

const { register, login } = require('./src/controllers/authController');

app.post('/auth/register', register);
app.post('/auth/login', login);

const authMiddleware = require('./src/middleware/authMiddleware');
const requireRole = require('./src/middleware/roleMiddleware');
const upload = require('./src/middleware/uploadMiddleware');

const { changeUserRole, getAllUsers, deleteUser, uploadImage } = require('./src/controllers/userController');
const { addRelatedItem, removeRelatedItem } = require('./src/controllers/userController');

app.get('/users', authMiddleware, requireRole(['admin']), getAllUsers);
app.put('/users/role/:id', authMiddleware, requireRole(['admin']), changeUserRole);
app.delete('/users/:id', authMiddleware, deleteUser);
app.patch('/users/:id/image', authMiddleware, upload.single('image'), uploadImage);

app.post('/users/:id/relatedItems', authMiddleware, addRelatedItem);
app.delete('/users/:id/relatedItems/:itemId', authMiddleware, removeRelatedItem);

app.use('/items', require('./src/routes/itemRoutes'));

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

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    console.log('📊 Base de datos:', mongoose.connection.name);
    console.log('🎯 Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.log('❌ Error conectando a MongoDB:', err.message);
    process.exit(1); 
  });

require('./src/models/User');
require('./src/models/Item');

const cloudinary = require('./src/config/cloudinary');
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
  const { User, Item } = require('./src/models');
  res.json({
    userModel: User ? '✅ User model cargado' : '❌ User model no cargado',
    itemModel: Item ? '✅ Item model cargado' : '❌ Item model no cargado'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});