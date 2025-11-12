const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config();

const ALLOW_SEED = process.env.ALLOW_SEED === 'true';

const createAdminUser = async () => {
  if (!ALLOW_SEED || process.env.NODE_ENV === 'production') {
    console.log('⚠️  Ejecutar seeds está deshabilitado en este entorno. Establece ALLOW_SEED=true en desarrollo para permitirlo.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para seed');

    const adminData = require(path.join(__dirname, 'data', 'admin.js'));

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario admin:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

  const adminUser = await User.create(adminData);

    console.log('🎉 Usuario admin creado exitosamente:');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminData.password ? 'proporcionada en seed' : '---');
    console.log('👑 Rol:', adminUser.role);
    console.log('🆔 ID:', adminUser._id);

    await mongoose.connection.close();
    console.log('✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error creando usuario admin:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;