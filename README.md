fase 0 estructura base y servidor

servidor Express configurado
conexión MongoDB Atlas
modelos creados
APIs de prueba y verificación de estado

fase 1 aut y gestión de usuarios

registro de usuarios tul "user"
login con jsonwebtoken
contras encriptadas con bcrypt
prueba insomnia
middleware de verificación + rutas protegidas funcionando
endpoint para que admins cambien roles
endpoint de eliminiación de cuentas

esquema imsomnia

📁 RTC Proyecto Backend
├── 🔐 Auth
│ ├── POST Register
│ └── POST Login
├── 👤 User
│ ├── GET Profile
│ └── DELETE My Account
├── 👑 Admin
│ ├── GET All Users
│ ├── PUT Change Role
│ └── GET Admin Dashboard
└── 🧪 Testing
├── GET DB Status
└── GET Test Models
└── PATCH Upload

comienzo con los modelos y autenticación para validar arquitectura antes de implementar Cloudinary

fase 2 cloudinary

registro en cloudinary (cloud name + api)
conexion con cloudinary correcta (config de credenciales) act del modelo User con imagenes
creación del middleware de subida con multer y cloudinary
actualización del modelo User con campo image {url, public_id}
Endpoint para subir imagen de usuario
prueba del flujo completo en insomnia (patch)
