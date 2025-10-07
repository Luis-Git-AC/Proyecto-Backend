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
│ └── PATCH Upload Image
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
conexion con cloudinary correcta (config de credenciales)
act del modelo User con imagenes
actualización del modelo User con campo image {url, public_id}
creación del middleware de subida con multer y cloudinary
Endpoint para subir imagen de usuario
prueba del flujo completo en insomnia (patch)
eliminación automatica de la imagen al borrar usuario

comprobacion de requisitos

2 modelos como mínimo
User (usuario con todos los campos)
Item (datos relacionados)

1 dato relacionado como mínimo
User.relatedItems → Array de ObjectIds que referencian a Item

diferentes roles + middleware Auth
roles-> user y admin
middleware-> authMiddleware + requireRole
reglas-> usuarios no pueden auto promocionarse

subida Cloudinary + eliminación automática
subida: Middleware Multer + Cloudinary
eliminación automática: Al borrar usuario se borra imagen de Cloudinary
Endpoint: PATCH /users/:id/image

Semilla para una colección
Script: npm run seed crea admin + datos prueba
Items: colección Item poblada con datos

Evitar duplicados en arrays
validación-> userSchema.path("relatedItems").validate()

CRUD completo
Users: Register, Login, Get, Update Role, Delete
Items: Create, Read (via seed)

Roles funcionan correctamente
Admin-> puede cambiar roles y eliminar cualquier usuario
User-> solo puede eliminar su propia cuenta no cambiar roles

README.md con la documentación del proyecto utilizando https://dillinger.io/
