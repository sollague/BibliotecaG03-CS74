# Biblioteca Virtual G03

Sistema web integral de administración y consulta para la **Biblioteca Virtual G03**. Permite gestionar el catálogo bibliográfico y sus ejemplares físicos, cuentas y perfiles de usuarios, políticas de préstamo dinámicas por tipo de cliente, el ciclo de vida completo de préstamos y reportes operativos imprimibles.

La aplicación implementa los requerimientos funcionales del [`docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md`](docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md) y las pautas visuales de [`diseno_visual_biblioteca_G03.md`](diseno_visual_biblioteca_G03.md).

---

## Características principales

- **Catálogo y ejemplares:** Búsqueda en tiempo real por título, autor, ISBN o categoría, control de stock y ejemplares individuales con condición física (`BUENO`, `DANADO`, `PERDIDO`).
- **Autenticación y roles:** Control de acceso basado en roles (`ADMINISTRADOR`, `BIBLIOTECARIO`, `CLIENTE`) con sesiones seguras en cookies `httpOnly`.
- **Tipos de cliente y políticas:** Parámetros configurables por rol (plazo de préstamo, cantidad máxima simultánea y renovaciones permitidas) para *Lector general*, *Estudiante*, *Becario* e *Institución educativa*.
- **Solicitudes de cambio de tipo:** Flujo de autoservicio para clientes con adjunto de comprobantes en PDF/JPG/PNG y panel de aprobación/rechazo para el bibliotecario.
- **Ciclo completo de préstamos:** Solicitud por lote, reserva al aprobar, entrega, renovación controlada, devolución con registro de condición/retraso y cancelación.
- **Reportes operativos:** Reportes en vivo de catálogo, disponibilidad de ejemplares e historial de préstamos, con filtros por fecha y vista para impresión.

---

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| **Frontend** | React 18, Vite 6, Material UI 6, React Router 6, React Hook Form y Zod |
| **Backend** | Node.js 20, Express 4, Prisma ORM 6, Zod, JWT en cookie `httpOnly`, Helmet |
| **Base de datos** | MySQL 8.0 (con juego de caracteres `utf8mb4_unicode_ci`) |
| **Contenedores** | Docker, Docker Compose, Nginx Alpine (servidor de producción SPA y proxy inverso) |
| **Pruebas** | `node:test` (unitarias e integración de API) y Playwright para flujos E2E |

---

## Estructura del repositorio

```text
BibliotecaG03/
├── backend/
│   ├── Dockerfile               # Contenedor Node.js 20 Alpine para el backend
│   ├── docker-entrypoint.sh     # Inicialización, espera de BD, migraciones y seed
│   ├── prisma/
│   │   ├── migrations/          # Migraciones versionadas de MySQL
│   │   ├── schema.prisma        # Modelo de datos y relaciones de Prisma
│   │   └── seed.js              # Administrador, políticas, categorías y catálogo inicial
│   ├── src/
│   │   ├── config/              # Variables de entorno y cliente Prisma
│   │   ├── middlewares/         # Autenticación, autorización por rol, validación Zod y errores
│   │   ├── modules/             # auth, usuarios, perfil, categorías, libros, políticas, préstamos, solicitudes y reportes
│   │   └── utils/               # Fechas locales, disponibilidad, serializadores
│   ├── uploads/solicitudes/     # Almacenamiento local de documentos adjuntos
│   └── tests/                   # Pruebas unitarias y de integración
├── frontend/
│   ├── Dockerfile               # Construcción multietapa (dev con Vite / prod con Nginx)
│   ├── nginx.conf               # Configuración de Nginx (SPA try_files, gzip y proxy /api/)
│   └── src/
│       ├── components/          # Componentes reutilizables, layout, diálogos y tablas
│       ├── context/             # Contexto de autenticación y feedback
│       ├── pages/               # Vistas por rol (Catálogo, Préstamos, Clientes, etc.)
│       ├── routes/              # Enrutamiento protegido por rol
│       ├── services/            # Cliente HTTP (fetch) y servicios REST
│       └── theme/               # Tema Material UI con paleta institucional
├── database/
│   └── biblioteca_g03.sql       # Script SQL reproducible con esquema y datos iniciales
├── docs/                        # Requerimientos, políticas y continuidad del proyecto
├── docker-compose.yml           # Orquestación para entorno de DESARROLLO (default)
├── docker-compose.prod.yml      # Orquestación para entorno de PRODUCCIÓN empaquetado
├── package.json                 # Workspaces raíz de npm (backend + frontend)
└── README.md
```

---

## Inicio rápido

Puedes ejecutar el proyecto de dos formas: mediante **Docker Compose** (recomendado, sin necesidad de configurar MySQL local) o mediante **instalación local nativa**.

### Opción A: Con Docker Compose (Recomendada)

Requiere tener instalado [Docker](https://docs.docker.com/get-docker/) y Docker Compose.

#### 1. Modo Desarrollo (Recarga en vivo)

Levanta MySQL 8, el backend con observador de cambios (`node --watch`) y el frontend con Vite (HMR) en un solo comando:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Backend:** [http://localhost:4000](http://localhost:4000) (Salud: [http://localhost:4000/api/salud](http://localhost:4000/api/salud))
- **Base de datos MySQL:** `localhost:3306`

> [!TIP]
> Cualquier cambio que guardes en `frontend/src` o `backend/src` se reflejará al instante en el contenedor sin necesidad de reconstruir las imágenes.

#### 2. Modo Producción (Empaquetado con Nginx)

Construye la versión optimizada de producción donde el frontend es servido por Nginx y hace proxy inverso transparente a `/api/`:

```bash
docker compose -f docker-compose.prod.yml up --build
```

- **Aplicación completa (Frontend + API):** [http://localhost:8080](http://localhost:8080)

Para detener los contenedores:
```bash
docker compose down
```

---

### Opción B: Instalación local nativa

Requiere Node.js 20+, npm 10+ y MySQL 8.0 en ejecución en el equipo local.

#### 1. Instalar dependencias

```bash
npm install
```

#### 2. Crear y poblar la base de datos

Ejecuta el script inicial como administrador de MySQL (`root`):

```bash
mysql -u root -p < database/biblioteca_g03.sql
```

El script crea la base `biblioteca_g03`, el usuario de desarrollo `biblioteca` (clave `biblioteca123`), todas las tablas, índices y registra las migraciones en `_prisma_migrations`.

#### 3. Configurar variables de entorno

Copia la plantilla en el backend:

```bash
cp backend/.env.example backend/.env
```

Configura al menos:

```dotenv
DATABASE_URL="mysql://biblioteca:biblioteca123@127.0.0.1:3306/biblioteca_g03"
JWT_SECRET="clave_aleatoria_super_secreta_de_al_menos_32_caracteres"
ADMIN_EMAIL=admin@biblioteca.ug.edu.ec
ADMIN_PASSWORD=Admin12345*
```

#### 4. Generar cliente Prisma y ejecutar Seed

```bash
npm run prisma:generate
npm run prisma:seed
```

> [!NOTE]
> El seed crea la cuenta del Administrador, las 4 políticas de préstamo, las 9 categorías temáticas y, si la tabla de libros está vacía, carga un catálogo de prueba de 15 libros con 31 ejemplares. Es idempotente.

#### 5. Iniciar la aplicación

En dos terminales separadas:

```bash
# Terminal 1: Backend en http://localhost:4000
npm run dev:backend
```

```bash
# Terminal 2: Frontend en http://localhost:5173
npm run dev:frontend
```

---

## Credenciales de demostración

| Rol | Correo | Contraseña | Origen |
| --- | --- | --- | --- |
| **Administrador** | `admin@biblioteca.ug.edu.ec` | `Admin12345*` | Creado automáticamente por el seed (`ADMIN_PASSWORD`). |
| **Bibliotecario** | `bib.e2e@example.com` | `Bib12345*` | Creado manualmente para pruebas de entrega. |

> [!IMPORTANT]
> La cuenta con rol **Bibliotecario** no se genera en el seed inicial. Tras iniciar sesión como Administrador, puedes crear usuarios con rol Bibliotecario desde la sección **Usuarios → Crear cuenta**.

---

## Variables de entorno

El backend lee la configuración desde `backend/.env` (en local) o desde las directivas de `docker-compose.yml` (en contenedores).

| Variable | Obligatoria | Valor por defecto | Descripción |
| --- | :---: | --- | --- |
| `NODE_ENV` | No | `development` | Entorno de ejecución (`development`, `test`, `production`). |
| `PORT` | No | `4000` | Puerto HTTP del servidor Express. |
| `DATABASE_URL` | Sí | — | Cadena de conexión JDBC/MySQL para Prisma. |
| `JWT_SECRET` | Sí | — | Clave secreta para firmar tokens JWT (mínimo 32 caracteres). |
| `JWT_EXPIRES_IN` | No | `8h` | Tiempo de expiración de las sesiones. |
| `COOKIE_NAME` | No | `bg03_token` | Nombre de la cookie `httpOnly` donde se almacena el token. |
| `FRONTEND_URL` | No | `http://localhost:5173` | Origen autorizado para CORS y recepción de cookies. |
| `ADMIN_EMAIL` | Sí | — | Correo electrónico asignado al Administrador en el seed. |
| `ADMIN_PASSWORD` | Sí | — | Contraseña inicial del Administrador (mínimo 8 caracteres). |

---

## Scripts npm disponibles

Desde la raíz del proyecto:

| Comando | Descripción |
| --- | --- |
| `npm run dev:backend` | Inicia el backend en modo observador (`node --watch`). |
| `npm run dev:frontend` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Compila el frontend para producción en `frontend/dist`. |
| `npm test` | Ejecuta la suite de pruebas unitarias y de integración del backend. |
| `npm run prisma:generate` | Genera o actualiza el cliente de Prisma ORM. |
| `npm run prisma:migrate` | Aplica migraciones pendientes con `prisma migrate deploy`. |
| `npm run prisma:migrate:dev` | Ejecuta `prisma migrate dev` para generar nuevas migraciones. |
| `npm run prisma:seed` | Ejecuta el script de poblamiento inicial (`backend/prisma/seed.js`). |

---

## Pruebas automatizadas

El proyecto incluye pruebas unitarias y de integración con el ejecutor nativo de Node.js (`node:test`):

```bash
npm test
```

### Cobertura de pruebas
- Autenticación, hashing seguro con bcrypt y control de sesiones JWT.
- Reglas de negocio y matriz de permisos por rol en cada endpoint.
- Flujo completo de solicitud de préstamo, validación de stock y capacidad del cliente.
- Aprobación, entrega, cálculo de fechas límite y renovaciones permitidas.
- Registro de devoluciones en condición buena, dañada o con pérdida.
- Solicitudes de cambio de tipo de cliente y validación de documentos adjuntos.
- Reportes operativos y filtros por rango de fechas (zona horaria Ecuador UTC-5).

---

## Seguridad

- **Cookies seguras:** Tokens JWT almacenados exclusivamente en cookies con flags `httpOnly` y `sameSite=lax` (`secure` habilitado en producción).
- **Protección de encabezados:** Implementación de [Helmet](https://helmetjs.github.io/) con Content Security Policy (CSP).
- **Control de tasa de peticiones:** `express-rate-limit` activo en rutas críticas (`/api/auth/login` y `/api/auth/registro`) para mitigar ataques de fuerza bruta.
- **Validación de esquemas:** Validación estricta en el servidor con **Zod** antes de procesar cualquier entrada de datos.
- **Archivos adjuntos seguros:** Límite estricto de 3 archivos por solicitud (máximo 5 MB cada uno, formatos PDF/JPG/PNG) y descarga restringida únicamente al propietario o al personal de la biblioteca.

---

## Documentación del proyecto

Para profundizar en el diseño y los requerimientos del sistema:

- [`docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md`](docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md): Especificación de requerimientos funcionales y no funcionales (SRS).
- [`diseno_visual_biblioteca_G03.md`](diseno_visual_biblioteca_G03.md): Especificaciones de interfaz visual, colores corporativos y tipografía.
- [`docs/POLITICAS_PRESTAMO_G03.md`](docs/POLITICAS_PRESTAMO_G03.md): Detalle normativo de plazos, renovaciones y requisitos por tipo de lector.
- [`docs/CONTINUIDAD_PROYECTO.md`](docs/CONTINUIDAD_PROYECTO.md): Bitácora de decisiones arquitectónicas y estado del proyecto.
