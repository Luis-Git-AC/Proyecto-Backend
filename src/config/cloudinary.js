const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️  Cloudinary configurado:');
console.log('   📛 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');
console.log('   🔑 API Key:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌');
console.log('   🗝️  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌');

cloudinary.api.ping()
  .then(result => {
    console.log('   🟢 Conexión a Cloudinary: EXITOSA');
    console.log('   📊 Status:', result.status);
  })
  .catch(error => {
    console.log('   🔴 Conexión a Cloudinary: FALLIDA');
    console.log('   ❌ Error:', error.message);
  });

  module.exports = cloudinary;

