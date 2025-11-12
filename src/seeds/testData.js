const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const path = require('path');
require('dotenv').config();

const ALLOW_SEED = process.env.ALLOW_SEED === 'true';

const createTestData = async () => {
  if (!ALLOW_SEED || process.env.NODE_ENV === 'production') {
    console.log('⚠️  Ejecutar seeds está deshabilitado en este entorno. Establece ALLOW_SEED=true en desarrollo para permitirlo.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para datos de prueba');

    const seed = require(path.join(__dirname, 'data', 'testData.js'));

    const testUsers = await User.create(seed.users);

    const itemsToCreate = seed.items.map((it, idx) => ({
      ...it,
      createdBy: testUsers[idx % testUsers.length]._id
    }));

    const testItems = await Item.create(itemsToCreate);

    console.log('🎉 Datos de prueba creados:');
    console.log('👥 Usuarios:', testUsers.length);
    console.log('📦 Items:', testItems.length);

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  createTestData();
}

module.exports = createTestData;