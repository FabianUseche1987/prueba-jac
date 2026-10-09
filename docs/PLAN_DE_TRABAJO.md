# JAC Connect: plan de trabajo

> El contexto completo del proyecto está en [CONTEXTO.md](CONTEXTO.md).

## Cómo usar este plan

- Las fases van **en orden**. No se empieza una fase hasta cumplir el **"Listo cuando"** de la anterior.
- Al terminar un paso, márcalo con `[x]`.
- Cada fase va en **su propia rama** (por ejemplo `feature/fase1-backend-base`).
- **Nunca se une nada a `main`**: Hostinger publica `main` automáticamente y ahí está la versión presentada a la profesora (ver sección 12 de `CONTEXTO.md`).
- Si en un paso se toma una decisión, se anota en la sección 8 de `CONTEXTO.md`.

---

## Fase 0: Preparación

**Objetivo**: base de datos y repositorio listos para empezar.

- [x] **0.1** Guardar la versión de la profesora con una etiqueta, para poder volver a ella:
  `git tag version-profe 38039ab` y luego `git push origin version-profe`. *(Hecho el 2026-10-09. Para verla: `git switch --detach version-profe`.)*
- [x] **0.2** Habilitar **MySQL remoto** en Hostinger (hPanel → Sitios web → Panel → Bases de datos → MySQL remoto).
  Hoy ya existe una regla con `%` (cualquier host), así que todos pueden conectarse desde cualquier IP. Mientras sea así, la contraseña del usuario de la BD debe ser larga y aleatoria. Esa regla se quita antes de publicar (paso 6.5).
  Conexión probada con MySQL Workbench el 2026-10-09. Los datos de conexión (servidor, usuario y contraseña) **no se escriben en el repositorio**: van en el `.env` y se piden al líder del equipo.
- [ ] **0.3** *(Opcional, se puede dejar para la Fase 6)* Crear en Hostinger un usuario de base de datos **solo para la aplicación** (no usar el principal).
- [x] **0.4** Decidir cómo resolver cada problema del esquema y anotarlo (sección 9 de `CONTEXTO.md`, decidido el 2026-10-09).
- [x] **0.5** Scripts de base de datos en la carpeta `database/`:
  - [x] `schema.sql`: estructura corregida (crea la BD desde cero).
  - [x] `seed.sql`: datos de prueba **inventados**, con un usuario por rol.
  - [x] `migraciones/001_correcciones_fase0.sql`: aplica los cambios a la BD que ya existe, sin borrar datos.
  - [x] **Probar en tu computador** (MySQL local, conexión "fabian" de Workbench):
    1. ✅ Crear un esquema `jac_prueba` y ejecutar `schema.sql` y luego `seed.sql`. Deben correr sin errores. *(Hecho el 2026-10-09: 14 tablas, 20 juntas, 15 usuarios, 0 warnings.)*
    2. ✅ Crear un esquema `jac_migracion`, importar el *dump* original (`dataExport.sql`) y ejecutar la migración 001. Debe correr sin errores. *(Hecho el 2026-10-09: las 8 secciones sin errores.)*
  - [x] **Aplicar la migración 001 en Hostinger**, siguiendo las instrucciones del propio archivo (respaldo primero). *(Hecho el 2026-10-09, con respaldo previo desde Hostinger. Las 14 tablas quedaron en `utf8mb4_spanish_ci`.)*

  El *dump* original con datos reales **no se sube** al repositorio.

**Listo cuando**: todos se conectan a la base de datos desde su computador (con MySQL Workbench, DBeaver o similar), y el esquema corregido está en el repositorio.

---

## Fase 1: Backend base

**Objetivo**: una API que arranca y se conecta a la base de datos.

- [x] **1.1** Crear el proyecto en `backend/`:
  - Dependencias: `express`, `mysql2`, `cors`, `dotenv`.
  - Para desarrollo: `typescript`, `tsx`, `@types/express`, `@types/cors`, `@types/node`.
- [x] **1.2** Crear esta estructura de carpetas:
  ```
  backend/src/
  ├── index.ts          # arranca el servidor
  ├── app.ts            # configura Express (cors, json, rutas)
  ├── db.ts             # pool de conexiones a MariaDB
  ├── routes/           # un archivo de rutas por módulo
  ├── controllers/      # lo que hace cada endpoint
  └── middlewares/      # manejo de errores, autenticación, roles
  ```
- [x] **1.3** Crear dos archivos de configuración:
  - `.env` (no se sube) con los datos reales.
  - `.env.example` (sí se sube) con los mismos nombres pero sin valores.

  Variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `CORS_ORIGIN`.
- [x] **1.4** Endpoint `GET /api/salud` que ejecuta `SELECT 1` en la base de datos.
- [x] **1.5** Middleware de errores: si algo falla, la API responde un JSON `{ "mensaje": "..." }` en lugar de caerse.
- [x] **1.6** Documentar en `CONTEXTO.md` (sección 11) cómo ejecutar el backend.

**Listo cuando**: con `npm run dev`, la dirección `http://localhost:3000/api/salud` responde `{ "ok": true }` con la base de datos conectada.

*✅ Fase 1 terminada el 2026-10-09: `/api/salud` responde `{"ok":true,"mensaje":"API y base de datos funcionando"}` conectado a Hostinger. También se probaron la respuesta 404, el JSON inválido (400) y CORS.*

---

## Fase 2: Juntas de punta a punta (primer CRUD real)

**Objetivo**: la pantalla de juntas trabaja con la base de datos real.
**Por qué primero**: la pantalla ya existe en el frontend, así que aprendemos la conexión completa (Angular → API → BD) sin la complejidad del login.

**Backend**

- [ ] **2.1** Endpoints:
  - [x] `GET /api/juntas` (lista ordenada por nombre)
  - [ ] `POST /api/juntas`
  - [ ] `PUT /api/juntas/:id`
  - [ ] `DELETE /api/juntas/:id`
- [x] **2.2** Convertir los nombres entre la BD y el JSON: `representante_legal` ↔ `representanteLegal` (función `filaAJunta` en `backend/src/models/junta.model.ts`).
- [ ] **2.3** Validar los campos obligatorios y su largo máximo. Si algo falla, responder `400` con el motivo.
- [ ] **2.4** Escribir todas las consultas con parámetros (`?`), nunca concatenando texto.

**Frontend**

- [x] **2.5** Agregar `provideHttpClient()` en `app.config.ts`. Crear los *environments* con `ng generate environments` y poner ahí la `apiUrl`.
- [ ] **2.6** Crear `JuntasService` con `HttpClient`. `consulta-juntas` lo usa en lugar de `JUNTAS_MOCK`.
  - [x] Listar (la tabla ya muestra las juntas de la BD)
  - [ ] Registrar, editar y eliminar (hoy solo cambian la lista en pantalla)
- [x] **2.7** Mostrar "Cargando…" mientras llegan los datos, y un mensaje claro con botón "Reintentar" si la API falla.
- [x] **2.8** Borrar `juntas.mock.ts`.

**Listo cuando**: crear, editar y eliminar una junta se mantiene después de recargar la página.

*Estado (2026-10-09): primera parte terminada. La tabla lee las juntas reales de Hostinger. Falta guardar en la BD (POST, PUT y DELETE).*

---

## Fase 3: Autenticación real

**Objetivo**: registro e inicio de sesión contra la base de datos.

**Backend**

- [ ] **3.1** Cifrar las contraseñas con **bcrypt**: un script que actualice las que están en texto plano en Hostinger, y `seed.sql` actualizado con las contraseñas ya cifradas.
- [ ] **3.2** `POST /api/auth/login`: valida email y contraseña, y devuelve los datos del usuario y un **token JWT**. El token lleva `idUsuario`, `rol` e `idJunta`.
- [ ] **3.3** `POST /api/auth/registro`: crea el usuario con el rol "Ciudadano común" en la junta que eligió (según lo decidido en la Fase 0).
- [ ] **3.4** Middleware `verificarToken`: las rutas protegidas responden `401` si no llega un token válido. Proteger `/api/juntas`.

**Frontend**

- [ ] **3.5** `AuthService` llama a la API y guarda el token en `sessionStorage`.
- [ ] **3.6** Crear un **interceptor HTTP** que agrega `Authorization: Bearer <token>` a cada petición. Si la API responde `401`, cierra la sesión y vuelve al inicio.
- [ ] **3.7** Conectar el registro a la API, incluido el campo para elegir la junta (si así se decidió).
- [ ] **3.8** Borrar `usuarios.mock.ts` y el recuadro rojo del "usuario de prueba" del login.

**Listo cuando**: se puede registrar un usuario nuevo e iniciar sesión con él, y la API rechaza las peticiones sin token.

---

## Fase 4: Roles y permisos

**Objetivo**: cada perfil (administrador, directivo, ciudadano) ve y hace solo lo que le corresponde (ver sección 7 de `CONTEXTO.md`).

- [ ] **4.1** Backend: middleware `requiereRol(...)` que responde `403` si el rol no tiene permiso.
- [ ] **4.2** Backend: crear, editar y eliminar juntas queda solo para el **administrador**.
- [ ] **4.3** Frontend:
  - `AuthService` con `esAdmin()` y `esDirectivo()`.
  - Un `rolGuard` para las rutas.
  - Header y botones según el rol.
- [ ] **4.4** En `seed.sql`, tres usuarios de prueba: un administrador, un directivo y un ciudadano.

**Listo cuando**: un ciudadano no ve "Juntas" en el menú, no puede abrir `/juntas`, y si llama a la API directamente recibe `403`.

---

## Fase 5: Módulos de la junta (uno a la vez)

Todos siguen el mismo patrón:

1. Endpoints que **filtran por la junta del usuario**, tomada del token.
2. Modelo y servicio en Angular.
3. Pantalla.
4. Permisos por rol: el directivo crea y edita; el ciudadano consulta.

- [ ] **5.1** **Reuniones** y asistencia (`reunion`, `asistencia`)
- [ ] **5.2** **Proyectos** y avances, con comentarios y calificaciones (`proyecto`, `avance_proyecto`, `comentario`, `calificacion`)
- [ ] **5.3** **Avisos** y la campana de no leídos (`notificacion`, `notificacion_usuario`)
- [ ] **5.4** **Junta directiva**: afiliados y cargos (`usuario_rol`, `rol`)
- [ ] **5.5** **Bienes comunales** (`predio`)
- [ ] **5.6** **Documentos**, con subida de archivos (`documento`)
- [ ] **5.7** **Mi perfil**: datos propios y cambio de contraseña

**Listo cuando** (en cada módulo): un directivo y un ciudadano de la misma junta ven los mismos datos, solo el directivo puede modificarlos, y nadie ve los datos de otra junta.

---

## Fase 6: Cierre

- [ ] **6.1** Recuperar contraseña por correo: código temporal con vencimiento y envío del correo.
- [ ] **6.2** Paginación y búsqueda desde el servidor, para tablas con muchos registros.
- [ ] **6.3** Pruebas de los endpoints principales.
- [ ] **6.4** Despliegue: decidir dónde corre el backend (Hostinger, si el plan permite Node.js, o Render / Railway) y publicar el frontend.
- [ ] **6.5** En Hostinger → MySQL remoto, borrar la regla `%` y dejar solo la IP del servidor donde corre el backend.
