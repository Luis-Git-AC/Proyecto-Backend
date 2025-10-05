const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});