# JAC Connect: contexto del proyecto

> Última actualización: 9 de octubre de 2026.
> Actualizar este archivo cada vez que se tome una decisión importante (sección 8).

## 1. Qué es JAC Connect

Aplicación web para gestionar las **Juntas de Acción Comunal (JAC)** de Colombia. Reúne en un solo lugar la información de cada junta: reuniones y asistencia, proyectos y sus avances, avisos, documentos, bienes comunales y junta directiva.

Es un proyecto académico de un equipo de 4 personas.

## 2. Estado actual

Existe una **versión de demostración** (commit `38039ab` "version para la profe", rama `feature/fabian`). Funciona solo con datos de prueba (*mocks*) en el navegador: **no tiene backend ni base de datos conectada**.

| Pantalla | Ruta | Qué hace hoy |
|---|---|---|
| Inicio + login | `/` | Presentación del proyecto y formulario de login (valida contra un usuario mock) |
| Registro | `/registro` | Formulario con validaciones; no guarda nada |
| Recuperar contraseña | `/recuperar-contrasena` | Formulario; no envía correo |
| Juntas | `/juntas` (requiere sesión) | Tabla con paginación, registrar/editar en modal y eliminar con confirmación. Los cambios se pierden al recargar |

A partir de aquí se construye la **versión real** (backend, base de datos, autenticación y roles), siguiendo [PLAN_DE_TRABAJO.md](PLAN_DE_TRABAJO.md).

**Avance de la versión real** (ramas `feature/...`):

| Qué | Estado |
|---|---|
| Base de datos | Corregida con la migración 001 (Fase 0) |
| Backend | Funcionando: `/api/salud` y el CRUD de `/api/juntas` (Fases 1 y 2) |
| Pantalla de juntas | **Conectada a la BD**: listar, registrar, editar y eliminar (Fase 2 terminada) |
| Login | **Real**: con correo y contraseña contra la BD, con token JWT (Fase 3). El usuario mock se eliminó |
| Registro | **Real**: crea la cuenta en la BD con la junta elegida y el rol "Ciudadano común" (Fase 3) |
| Seguridad de la API | Todo, salvo `/api/salud` y `/api/auth`, exige un token válido (Fase 3) |
| Roles | La gestión de juntas es solo para el administrador, en la API (403) y en la pantalla. Directivos y ciudadanos ven su cargo y su junta en el inicio (Fase 4) |
| Reuniones | Directivos y ciudadanos ven las reuniones **de su junta** en `/reuniones`. Convocar, editar y tomar asistencia están en curso (Fase 5.1) |

## 3. Tecnologías

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | Angular 20 (componentes *standalone*, *signals*, `@if`/`@for`), Reactive Forms, Bootstrap 5.3, Bootstrap Icons | En construcción |
| Backend | Node.js 24 + Express 5 + TypeScript 7, `mysql2` para la BD | En construcción (Fase 1: base creada) |
| Base de datos | MariaDB 11.8 en Hostinger | Existe, con datos de prueba |

## 4. Estructura del repositorio

```
jacConnect/
├── CLAUDE.md                     # instrucciones para Claude Code (carga este contexto y el plan)
├── backend/                      # API REST
│   ├── .env                      # datos de conexión reales (NO se sube a git)
│   ├── .env.example              # plantilla del .env (sí se sube)
│   └── src/
│       ├── index.ts              # arranca el servidor
│       ├── env.ts                # carga el .env
│       ├── app.ts                # configura Express: cors, JSON, rutas, errores
│       ├── db.ts                 # pool de conexiones a MariaDB
│       ├── seguridad.ts          # bcrypt (contraseñas) y JWT (tokens de sesión)
│       ├── scripts/              # tareas sueltas: cifrar-contrasenas.ts
│       ├── models/               # forma de los datos y conversión BD → JSON (junta.model.ts, usuario.model.ts…)
│       ├── routes/               # qué URL atiende cada módulo (salud.routes.ts, juntas.routes.ts…)
│       ├── controllers/          # qué hace cada endpoint (salud.controller.ts, juntas.controller.ts…)
│       └── middlewares/          # errores.ts (404 y errores en JSON), autenticacion.ts (verificarToken, requiereRol)
├── database/
│   ├── schema.sql                # estructura completa (crea la BD desde cero, ¡borra todo!)
│   ├── seed.sql                  # datos de prueba inventados (un usuario por rol)
│   └── migraciones/              # cambios para la BD que ya existe en Hostinger (sin borrar datos)
│       └── 001_correcciones_fase0.sql
├── docs/
│   ├── CONTEXTO.md               # este archivo
│   └── PLAN_DE_TRABAJO.md
├── frontend/                     # Angular
│   ├── public/                   # logo.png, favicon.ico
│   └── src/
│       ├── environments/         # apiUrl de la API (desarrollo y producción)
│       ├── styles.css            # estilos globales (Bootstrap + .btn-jac)
│       └── app/
│           ├── app.routes.ts     # rutas
│           ├── features/
│           │   ├── inicio/                    # página de inicio (con el login)
│           │   ├── auth/
│           │   │   ├── auth.service.ts        # login contra la API; guarda token y usuario
│           │   │   ├── auth.interceptor.ts    # agrega el token a cada petición; si hay 401, cierra la sesión
│           │   │   ├── rol.guard.ts           # rolGuard('administrador', ...): rutas solo para ciertos perfiles
│           │   │   ├── auth.guard.ts          # protege rutas que requieren sesión
│           │   │   ├── login-form/            # formulario de login reutilizable
│           │   │   ├── registro/
│           │   │   ├── recuperar-contrasena/
│           │   │   └── models/usuario.model.ts
│           │   ├── reuniones/
│           │   │   ├── reuniones.service.ts   # llama a la API /api/reuniones
│           │   │   ├── lista-reuniones/       # página /reuniones: pestañas y tarjetas
│           │   │   └── models/reunion.model.ts
│           │   └── juntas/
│           │       ├── juntas.service.ts      # llama a la API /api/juntas
│           │       ├── consulta-juntas/       # tabla + paginación
│           │       ├── junta-form/            # modal para registrar / editar
│           │       └── models/junta.model.ts
│           └── shared/components/
│               ├── header/
│               ├── footer/
│               └── modal-confirmar/           # modal de confirmación reutilizable
└── .gitignore
```

## 5. Convenciones del frontend

- **Idioma**: nombres en español (`ConsultaJuntas`, `guardarJunta()`, `juntaAEditar`).
- **Carpetas**: cada módulo vive en `features/<modulo>/`, con `models/` (interfaces) y `data/` (mocks mientras no haya API).
- **Modelos**: copian las columnas de la tabla en *camelCase*, con el nombre original en un comentario. Las columnas que admiten `NULL` se tipan como `tipo | null`.
- **Componentes**: *standalone*; dependencias con `inject()`; entradas y salidas con `input()` / `output()`.
- **Formularios**: Reactive Forms con `FormBuilder.nonNullable`. Errores con `is-invalid` + `invalid-feedback`. Los campos obligatorios llevan un asterisco rojo: `<span class="text-danger">*</span>`.
- **Estilos**: primero clases de Bootstrap; el CSS propio va en el `.css` de cada componente.
- **Colores de la marca**:

  | Uso | Color |
  |---|---|
  | Azul principal (enlaces, encabezado de tablas) | `#1f5fd8` |
  | Azul oscuro (títulos, footer) | `#1e3a6e` |
  | Verde (botón principal) | `#3cc152`, clase global `.btn-jac` |
  | Fondo de las páginas | degradado de `#a9cdfa` a `#f5f5f5` |

- **Piezas reutilizables**: `.btn-jac`, `<app-modal-confirmar>` y `<app-login-form>`.
- **Pendiente de limpieza**: `styles.css` tiene una regla global `p { color: blue; }` que pinta de azul cualquier párrafo sin color propio. Hay que borrarla.

## 6. Base de datos

MariaDB en Hostinger. Los datos de conexión van en `backend/.env`, que **no se sube a git**; se piden al líder del equipo.

La estructura oficial está en `database/schema.sql`. Todo cambio a la base de datos se hace con un archivo nuevo en `database/migraciones/` (`002_...sql`, `003_...sql`), y también se refleja en `schema.sql`. Nunca se cambia la base "a mano" sin dejar el script.

**Migraciones aplicadas en Hostinger:**

| Migración | Fecha | Notas |
|---|---|---|
| `001_correcciones_fase0.sql` | 2026-10-09 | Aplicada con respaldo previo. Para entonces, Hostinger ya no era igual al *dump* del 26 de septiembre: tenía 3 juntas, ya no tenía el proyecto "Escuela de fútbol infantil" (con sus avances y calificaciones) y los estados ya estaban en texto |
| Script `npm run cifrar-contrasenas` | 2026-10-09 | Cifró con bcrypt las 15 contraseñas que estaban en texto plano. Se puede repetir sin problema: salta las que ya están cifradas |

**Usuarios de prueba en Hostinger** (para iniciar sesión en la app):

| Correo | Contraseña | Perfil |
|---|---|---|
| `admin@example.com` | `Jac2026*` | Administrador (sin junta) |
| `carlos.ramirez@example.com` | `123456` | Directivo: Secretario de la junta 1 |
| `luis.castro@example.com` | `123456` | Ciudadano de la junta 1 |

Las cuentas del equipo que ya existían en Hostinger también tienen la contraseña `123456`. Cuando exista "Mi perfil" (paso 5.7), cada quien debe cambiarla. En una base creada con `seed.sql`, la contraseña de todos los usuarios es `Jac2026*`.

Recuerda: **todos trabajan sobre la misma base**. Lo que uno borre, se pierde para todos. Antes de un `DELETE` o `UPDATE`, piénsalo dos veces y, si es algo grande, haz un respaldo.

| Tabla | Qué guarda | Se relaciona con |
|---|---|---|
| `junta` | Juntas: nombre, barrio, municipio, departamento, NIT, representante legal, fundación, estado | — |
| `usuario` | Personas registradas: nombre, apellido, tipo y número de documento, email (único, con él se inicia sesión), teléfono, contraseña cifrada, estado | — |
| `rol` | Cargos: Presidente, Vicepresidente, Tesorero, Secretario, Fiscal y Vocal (`es_directivo = 1`), Ciudadano común y Administrador | — |
| `usuario_rol` | Qué rol tiene cada usuario **en qué junta**. Una sola fila por usuario; `id_junta` es NULL solo para el Administrador | `usuario`, `rol`, `junta` |
| `reunion` | Asambleas y reuniones: tipo, orden del día, fecha, lugar, modalidad, estado, resumen del acta, quórum | `junta`, `usuario` (creador) |
| `asistencia` | Quién asistió a cada reunión, hora de llegada y justificación | `reunion`, `usuario` |
| `proyecto` | Proyectos: código, categoría, estado, presupuesto total y ejecutado, fechas planeadas y reales, prioridad | `junta`, `usuario` (responsable) |
| `avance_proyecto` | Reportes de avance: descripción, % completado, monto ejecutado | `proyecto`, `usuario` |
| `notificacion` | Avisos de la junta: tipo, prioridad, audiencia (`todos` / `directivos`), expiración | `junta`, `usuario` (remitente) |
| `notificacion_usuario` | Si cada usuario leyó cada aviso | `notificacion`, `usuario` |
| `documento` | Archivos: actas, cotizaciones, fotos, informes, escrituras | `proyecto`, `reunion` o `predio`; `usuario` |
| `predio` | Bienes comunales: salón, cancha, parque (área, dirección, estado jurídico y físico) | `junta` |
| `comentario` | Comentarios en proyectos o reuniones, con respuestas | `usuario`, `proyecto` / `reunion`, `comentario` (padre) |
| `calificacion` | Puntaje a proyectos o reuniones | `usuario`, `proyecto` / `reunion` |

## 7. Roles y permisos (propuesta)

Se calculan con `usuario_rol` y `rol.es_directivo`:

| Perfil | Cómo se reconoce | Qué puede hacer |
|---|---|---|
| **Administrador** | Rol "Administrador" (con `id_junta` NULL) | Gestiona juntas y asigna roles. No pertenece a ninguna junta |
| **Directivo** | Rol con `es_directivo = 1` en una junta | Todo lo de su junta, y además crea y edita: reuniones, asistencia, proyectos, avances, avisos y documentos |
| **Ciudadano** | Rol "Ciudadano común" en una junta | Consulta lo de su junta, comenta, califica y marca avisos como leídos |

Reglas:

- Directivos y ciudadanos **solo ven los datos de su junta**.
- Los avisos con audiencia `directivos` solo los ven los directivos.
- Esconder botones o menús en Angular es solo para que la app sea clara. **La seguridad real la hace el backend**: debe responder `401` sin sesión y `403` sin permiso.

## 8. Decisiones tomadas

| Fecha | Decisión |
|---|---|
| 2026-10-09 | El login está integrado en el inicio; `/login` redirige a `/` |
| 2026-10-09 | Registrar y editar juntas se hace en un modal; se eliminó la página de detalle de junta |
| 2026-10-09 | Eliminar siempre pide confirmación con el modal compartido `<app-modal-confirmar>` |
| 2026-10-09 | Backend con **Node.js + Express + TypeScript** |
| 2026-10-09 | En desarrollo todos trabajan contra la **base de datos de Hostinger** (con MySQL remoto habilitado) |
| 2026-10-09 | Se construye por fases, una a la vez (ver [PLAN_DE_TRABAJO.md](PLAN_DE_TRABAJO.md)) |
| 2026-10-09 | Se resolvieron los 10 problemas del esquema como indica la sección 9 |
| 2026-10-09 | Backend en formato CommonJS (los `import` no llevan extensión `.js`); la BD se usa con un *pool* de `mysql2` y las fechas llegan como texto `'AAAA-MM-DD'`, igual que en el frontend |
| 2026-10-09 | Se agregó `CLAUDE.md` en la raíz para que cualquier conversación con Claude Code arranque con este contexto y el plan |
| 2026-10-09 | **`main` no se toca**: Hostinger la publica automáticamente y contiene la versión de la profesora. El desarrollo real va en ramas `feature/...` sin unirse a `main` (sección 12) |
| 2026-10-09 | **Una junta con datos relacionados no se elimina** (la API responde 409): borrarla eliminaría en cascada sus usuarios, reuniones, proyectos, bienes y avisos. En ese caso se marca como inactiva |
| 2026-10-09 | Después de guardar o eliminar, el frontend vuelve a pedir la lista a la API, para mostrar siempre lo que hay en la BD |
| 2026-10-09 | **Login real**: con correo y contraseña. La API responde un token JWT que dura 8 horas (lleva `idUsuario`, `perfil` e `idJunta`) y el frontend lo guarda en `sessionStorage`. Si el correo no existe o la contraseña está mal, el mensaje es el mismo, para no revelar qué correos están registrados |
| 2026-10-09 | Contraseñas con bcrypt (10 rondas). El código de seguridad está en `backend/src/seguridad.ts` |
| 2026-10-09 | **API protegida**: `/api/salud` y `/api/auth` son públicas; todo lo demás pasa por `verificarToken`, que responde 401 sin un token válido. Los datos del token quedan en `res.locals.usuario`, para que los controladores sepan quién hace la petición |
| 2026-10-09 | El frontend envía el token con un interceptor, y solo a nuestra API. Si recibe 401, cierra la sesión y avisa "Tu sesión venció" |
| 2026-10-09 | **Registro**: la persona elige su junta en una lista pública (`GET /api/auth/juntas`, solo juntas activas, con id, nombre y municipio) y queda como "Ciudadano común". El usuario y su rol se guardan en una transacción. Si el correo o el documento ya existen, la API responde 409. Después de registrarse hay que iniciar sesión |
| 2026-10-09 | **Permisos por perfil**: en el backend se usa `verificarToken` y luego `requiereRol(...)` (403 si el perfil no tiene permiso); en el frontend, `rolGuard(...)` y `auth.esAdmin()` para rutas, menú y botones. El administrador NO ve reuniones, proyectos ni avisos (no pertenece a ninguna junta) |
| 2026-10-09 | El perfil se guarda en el token al iniciar sesión: **si le cambian el rol a alguien, debe cerrar sesión y volver a entrar** para que se aplique |
| 2026-10-09 | **Módulos de la junta** (reuniones, proyectos, avisos…): la API filtra siempre por el `idJunta` **del token**, nunca por uno que mande el navegador. Así nadie puede ver los datos de otra junta |
| 2026-10-09 | La app usa el idioma **es-CO** (`LOCALE_ID`): las fechas se muestran como "sábado 10 de octubre · 6:00 p. m." y la moneda en pesos colombianos |

## 9. Problemas del esquema y cómo se resolvieron

Decididos el 2026-10-09. Los cambios a la base de datos están en `database/migraciones/001_correcciones_fase0.sql` y en `database/schema.sql`.

| # | Problema | Decisión |
|---|---|---|
| 1 | **Estados mezclados**: `junta.estado` tenía por defecto `'activa'`, pero los datos guardados tenían `'1'` (igual en `usuario` y `usuario_rol`) | Estados en texto: `activa`/`inactiva` en juntas y `activo`/`inactivo` en usuarios y roles. Se corrigen los `'1'` y la BD solo acepta esos valores (`CHECK`) |
| 2 | **Contraseñas en texto plano** en `usuario.contrasena_hash` | Se cifran con bcrypt en la Fase 3 (paso 3.1) |
| 3 | **Documento de identidad**: el registro lo pide y `usuario` no lo tenía | Se agregan `tipo_documento` (CC, TI o CE) y `numero_documento` (único). El backend los exige al registrarse; quedan NULL solo para usuarios antiguos |
| 4 | **Nombre de usuario**: no existe esa columna | Se inicia sesión **con el correo**. El usuario `adrianaguzman` existe solo en la versión de la profesora |
| 5 | **Administrador global** sin junta, pero `usuario_rol.id_junta` era obligatorio | `id_junta` acepta NULL, solo para el rol Administrador (lo valida el backend) |
| 6 | **Registro y junta**: el registro no preguntaba la junta | En el registro, la persona **elige su junta** y queda como "Ciudadano común" |
| 7 | **Varias juntas por usuario** | No: **una sola junta y un solo rol** por usuario (índice único en `usuario_rol.id_usuario`) |
| 8 | **Collation distinta** en `calificacion` | Pasa a `utf8mb4_spanish_ci`, como las demás |
| 9 | **Reglas que la BD no validaba** | En la BD (`CHECK`): puntaje de 1 a 5, porcentaje de 0 a 100 y monto ≥ 0. La regla "un comentario o calificación va en un proyecto **o** en una reunión" la valida el backend, porque MySQL no permite `CHECK` en columnas con `ON DELETE CASCADE` |
| 10 | **Recuperar contraseña** necesita una tabla para los códigos temporales | Se crea en la Fase 6, cuando se haga esa función |

## 10. Seguridad

- **Nunca** subir a git: `.env`, contraseñas ni *dumps* de la base de datos con datos personales reales.
- Las contraseñas siempre se guardan cifradas con bcrypt, nunca en texto plano.
- Las consultas SQL siempre van con parámetros (`?`). Nunca se arma el SQL concatenando texto que escribió el usuario.
- En Hostinger, el MySQL remoto se habilita solo para las IPs del equipo, y la app usa un usuario de base de datos propio (no el principal).

## 11. Cómo ejecutar

**Frontend**

```bash
cd frontend
npm install
npm start          # abre en http://localhost:4200
```

**Backend**

```bash
cd backend
npm install
# Copiar .env.example como .env y completar los datos de la BD (la primera vez)
npm run dev        # API en http://localhost:3000 (se reinicia sola al guardar cambios)
```

Para comprobar que funciona, abre `http://localhost:3000/api/salud` en el navegador. Debe responder `{"ok":true,...}`.

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo: arranca la API y la reinicia al guardar un archivo |
| `npm run revisar` | Revisa errores de TypeScript sin ejecutar |
| `npm run build` | Compila a JavaScript en `dist/` |
| `npm start` | Ejecuta la versión compilada (la que se usará al publicar) |
| `npm run cifrar-contrasenas` | Cifra con bcrypt las contraseñas que estén en texto plano en la BD |

**Cómo viaja una petición en el backend:**

`index.ts` arranca → `app.ts` recibe la petición → `routes/` decide qué función la atiende → `controllers/` hace el trabajo (consulta la BD con `db.ts`) → responde un JSON. Si algo falla, `middlewares/errores.ts` responde el error en JSON.

Ejemplo: `GET /api/salud` → `salud.routes.ts` → `obtenerSalud()` en `salud.controller.ts` → `SELECT 1` en la BD → `{ "ok": true }`.

## 12. Cómo trabajamos con git

| Rama / etiqueta | Qué contiene | Regla |
|---|---|---|
| `main` | La versión presentada a la profesora. **Hostinger la publica automáticamente** | **No se hace merge, push ni pull request hacia `main`.** Si algún día se quiere publicar una versión nueva, lo decide todo el equipo |
| `version-profe` (etiqueta) | El commit `38039ab`, la demo con datos de prueba | Solo para consultarla: `git switch --detach version-profe` |
| `feature/fase0-base-datos` | Documentación y scripts de base de datos | Ya en GitHub |
| `feature/fase1-backend-base` | Backend base (sale de la rama de la Fase 0) | Cada fase nueva sale de la rama de la fase anterior |
| `feature/fase2-juntas` | Juntas conectadas a la BD: CRUD completo (sale de la rama de la Fase 1) | Terminada |
| `feature/fase3-auth` | Login, protección de la API y registro reales (sale de la rama de la Fase 2) | Terminada |
| `feature/fase4-roles` | Permisos por perfil (sale de la rama de la Fase 3) | Terminada |
| `feature/fase5-reuniones` | Módulo de reuniones (sale de la rama de la Fase 4) | En curso |

Reglas:

- Cada fase en su propia rama `feature/faseN-...`, creada desde la rama de la fase anterior.
- Commits pequeños y con un mensaje que diga qué se hizo.
- Antes de cada commit, revisar que **no** se incluya `backend/.env`.
