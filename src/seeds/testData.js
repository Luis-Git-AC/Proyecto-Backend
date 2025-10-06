const mongoose = require('mongoose');
const { User, Item } = require('../models');
require('dotenv').config();

const createTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para datos de prueba');

    const testUsers = await User.create([
      {
        name: 'Usuario Uno',
        email: 'user1@test.com',
        password: '123456',
        role: 'user'
      },
      {
        name: 'Usuario Dos', 
        email: 'user2@test.com',
        password: '123456',
        role: 'user'
      }
    ]);

    const testItems = await Item.create([
      {
        name: 'Item de Prueba 1',
        description: 'Descripción del primer item',
        price: 29.99,
        createdBy: testUsers[0]._id
      },
      {
        name: 'Item de Prueba 2',
        description: 'Descripción del segundo item', 
        price: 49.99,
        createdBy: testUsers[1]._id
      }
    ]);

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