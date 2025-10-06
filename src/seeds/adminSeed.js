const mongoose = require('mongoose');
const { User } = require('../models');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para seed');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario admin:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('🎉 Usuario admin creado exitosamente:');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', 'admin123');
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