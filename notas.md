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

Proyecto Backend — RTC
API REST con Node.js + Express + MongoDB (Atlas). Implementa autenticación JWT, roles (user/admin), subida de imágenes a Cloudinary, y relación entre colecciones (Users.relatedItems → Item). Incluye seeds para datos de prueba.

Contenido

stack tecnológico
variables de entorno
instalación y ejecución
seeds
endpoints principales (ejemplos)
subida de imágenes (multipart/form-data)
notas sobre seguridad y pruebas
checklist de requisitos (cumplimiento)

Tecnologías

Node.js, Express
MongoDB Atlas (mongoose)
JWT (jsonwebtoken)
bcryptjs (hash de contraseñas)
Cloudinary + multer-storage-cloudinary
Nodemon (dev)
Requisitos previos
Node >= 16
Cuenta de MongoDB Atlas y cadena URI
Cuenta de Cloudinary (cloud name, api key, api secret)
Variables de entorno

Instalación

git clone <repo-url>
cd Proyecto-Backend
npm install

Scripts útiles

npm run dev # nodemon server.js (desarrollo)
npm start # node server.js
npm run seed:admin
npm run seed:test
npm run seed # ejecuta admin + test

Cómo ejecutar (local)
Rellenar .env
Ejecutar npm run dev
Abrir http://localhost:3000 para ver estado
Seeds y credenciales de prueba
Ejecutar npm run seed para poblar datos de prueba (admin, items, usuarios).

Endpoints principales

Autenticación:

POST /auth/register
Body JSON: { "name": "Nombre", "email": "a@b.com", "password": "123456" }
Respuesta: user + token
POST /auth/login
Body JSON: { "email": "ana@test.com", "password": "123456" }
Respuesta: { message, user, token }

Usuarios:

GET /users — (admin) lista usuarios
PUT /users/role/:id — (admin) cambiar rol
DELETE /users/:id — (admin o propio usuario) eliminar usuario (borrado físico)
PATCH /users/:id/image — (auth, upload) subir imagen de perfil
Middleware: upload.single('image')
POST /users/:id/relatedItems — (auth propio o admin) añadir relatedItem ($addToSet)
Body JSON: { "itemId": "<item_id>" }
DELETE /users/:id/relatedItems/:itemId — (auth) quitar relatedItem

Items:

GET /items — listar (público)
GET /items/:id — ver
POST /items — (auth) crear
Body JSON: { "name", "description", "price" }
PUT /items/:id — (owner o admin) actualizar
DELETE /items/:id — (owner o admin) eliminar

Ejemplos (pwsh)

Login:

$body = @{ email='ana@test.com'; password='123456' } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/auth/login' -Body $body -ContentType 'application/json'
$token = $resp.token

Crear item:

$create = @{ name='Mi Item'; description='desc'; price=12.5 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/items' -Headers @{ Authorization = "Bearer $token" } -Body $create -ContentType 'application/json'

Subir imagen (PowerShell):

$userId = '<USER_ID>'
$filePath = 'C:\ruta\a\imagen.jpg'
$Form = @{ image = Get-Item $filePath }
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/users/$userId/image" -Headers @{ Authorization = "Bearer $token" } -Form $Form

Subir imagen (curl):

curl -X PATCH "http://localhost:3000/users/<USER_ID>/image" \
 -H "Authorization: Bearer <TOKEN>" \
 -F "image=@/ruta/a/imagen.jpg"

Añadir relatedItem:

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/users/<USER_ID>/relatedItems" -Headers @{ Authorization = "Bearer $token" } -Body (@{ itemId = '<ITEM_ID>' } | ConvertTo-Json) -ContentType 'application/json'

Quitar relatedItem:

Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/users/<USER_ID>/relatedItems/<ITEM_ID>" -Headers @{ Authorization = "Bearer $token" }

Datos y modelos
User:

name, email, password (hash), role (user/admin), image: { url, public_id }, relatedItems: [ObjectId ref Item], isActive

Item:

name, description, price, createdBy (ref User)

relatedItems valida duplicados en schema y el controlador usa $addToSet para evitar duplicados.
