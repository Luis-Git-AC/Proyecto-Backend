API REST construida con Node.js y Express que integra conceptos de backend: autenticación con JWT, control de roles (user/admin), persistencia en MongoDB Atlas mediante Mongoose, gestión de archivos con Cloudinary (subida y eliminación), y relaciones entre colecciones (Users-Items). El proyecto incluye seeds para poblar datos de prueba, middlewares para autenticación y autorización, y un conjunto de endpoints que permiten realizar un CRUD completo sobre los recursos principales.

Características principales

Autenticación segura:
Registro y login con hashing de contraseñas (bcrypt)
Tokens JWT firmados con secret configurable vía .env

Control de permisos:
Roles “user” y “admin”.
Middlewares para proteger rutas y comprobar permisos (p. ej. solo admins pueden listar todos los usuarios o cambiar roles)

Reglas implementadas: un usuario no puede auto-promocionarse; solo admin pueden eliminar/editar

Gestión de recursos:
Modelo User y modelo Item
CRUD completo para Items (crear, leer, actualizar, eliminar)
Usuarios con array relatedItems referenciando Items
Operaciones para añadir/quitar relatedItems evitando duplicados ($addToSet / $pull)

Subida y gestión de archivos:
Integración con Cloudinary usando multer-storage-cloudinary
Endpoint para subir imagen de perfil: PATCH /users/:id/image (multipart/form-data, campo image)
Al eliminar un usuario, la imagen asociada se elimina de Cloudinary automáticamente

Buenas prácticas:
Organización modular (controllers, routes, middleware, models)
Validaciones en esquema Mongoose y en controladores
Manejo de errores y respuestas JSON

Seguridad y operaciones sensibles

JWT_SECRET en .env firma los tokens; cambia la clave con cuidado (invalidará tokens existentes)
Las contraseñas se almacenan hasheadas (bcrypt) y nunca se exponen en respuestas
Operaciones admin (cambio de rol, listado de usuarios) requieren role=admin
DELETE /users/:id elimina físicamente al usuario y su imagen en Cloudinary

Arquitectura y organización del repositorio

server.js — Orquestador: monta routers y middlewares, conecta con MongoDB
src/models — Mongoose schemas (User, Item, …)
src/controllers — Lógica por recurso (authController, userController, itemController)
src/routes — Ruteo modular (authRoutes, userRoutes, itemRoutes)
src/middleware — authMiddleware, roleMiddleware, uploadMiddleware (multer + Cloudinary)
src/config — configuración de Cloudinary, utilidades
src/seeds — scripts para poblar datos de prueba

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

Instalación y ejecución

git clone <https://github.com/Luis-Git-AC/Proyecto-Backend.git>
cd Proyecto-Backend
Instalar las dependencias --> npm install
.env (mensaje)
En desarrollo (nodemon) --> npm run dev
En producción --> npm start
http://localhost:3000

Scripts útiles

npm run dev # nodemon server.js (desarrollo)
npm start # node server.js
npm run seed:admin
npm run seed:test
npm run seed # ejecuta admin + test

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

relatedItems valida duplicados en schema y el controlador usa $addToSet para evitar duplicados
