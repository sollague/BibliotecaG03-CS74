# Biblioteca Virtual G03

Sistema de administración para la Biblioteca Virtual G03. Permite gestionar el catálogo bibliográfico y sus ejemplares, las cuentas y perfiles, los tipos de cliente, las políticas de préstamo, el ciclo completo de préstamos y los reportes operativos.

La aplicación implementa los requerimientos del `docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md` y la identidad visual de `diseno_visual_biblioteca_G03.mk`.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18, Vite 6, Material UI 6, React Router, React Hook Form y Zod |
| Backend | Node.js, Express 4, Zod, JWT en cookie httpOnly |
| Base de datos | MySQL 8.0 local con Prisma ORM 6 |
| Pruebas | `node:test` (unitarias e integración contra la API) |
| Ejecución | Local. El despliegue en AWS se documenta como referencia, pero no es requisito para esta entrega. |

## Estructura del repositorio

```text
BiblioteaG03/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          Migraciones de MySQL
│   │   ├── schema.prisma        Modelo de datos
│   │   └── seed.js              Administrador, políticas, categorías y catálogo inicial
│   ├── src/
│   │   ├── config/              Variables de entorno y cliente Prisma
│   │   ├── middlewares/         Autenticación, autorización, validación y errores
│   │   ├── modules/             auth, usuarios, perfil, categorías, libros,
│   │   │                        políticas, préstamos, solicitudes de tipo y reportes
│   │   └── utils/               Fechas, disponibilidad, paginación, constantes
│   ├── uploads/solicitudes/     Documentos adjuntos a solicitudes de cambio de tipo
│   └── tests/                   Pruebas unitarias y de integración
├── database/
│   └── biblioteca_g03.sql       Script de creación de la base de datos
├── docs/
│   ├── Documento_de_requerimientos_G03_Biblioteca_Virtual.md
│   ├── POLITICAS_PRESTAMO_G03.md
│   ├── CONTINUIDAD_PROYECTO.md
│   └── ACTUALIZACIONES_REQUERIMIENTOS_G03.md
├── frontend/
│   └── src/
│       ├── components/          Componentes comunes, layout, diálogos y tablas
│       ├── context/             Sesión y retroalimentación
│       ├── pages/               Pantallas por rol
│       ├── routes/              Rutas protegidas
│       ├── services/            Cliente HTTP y servicios de la API
│       ├── theme/               Tema centralizado de Material UI
│       └── utils/               Etiquetas y utilidades de formularios
├── diseno_visual_biblioteca_G03.mk
└── package.json                 Workspaces de backend y frontend
```

## Requisitos previos

- Node.js 20 o superior y npm 10 o superior.
- MySQL 8.0 instalado y en ejecución en el equipo local.
- Acceso a MySQL como administrador (`root` u otro usuario con permisos para crear bases de datos y usuarios) para ejecutar el script inicial.
- Navegador Chrome, Firefox, Edge o Safari actualizado.

No se requiere Docker. Toda la base de datos se crea con el script `database/biblioteca_g03.sql`.

## Instalación y ejecución

Sigue estos pasos en orden. Es la única ruta de configuración soportada.

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear la base de datos

Ejecuta el script como administrador de MySQL:

```bash
mysql -u root -p < database/biblioteca_g03.sql
```

Si tu usuario `root` no tiene contraseña, usa:

```bash
mysql -u root < database/biblioteca_g03.sql
```

El script realiza todo lo necesario para empezar:

- Crea la base `biblioteca_g03` con `utf8mb4`.
- Crea el usuario de aplicación `biblioteca` para `localhost` y `127.0.0.1` con la clave de desarrollo `biblioteca123`.
- Crea todas las tablas, índices y relaciones del modelo Prisma.
- Registra las migraciones aplicadas en `_prisma_migrations`, de modo que Prisma reconozca la base como actualizada.
- Inserta las 9 categorías y las 4 políticas de préstamo iniciales.

> La clave `biblioteca123` es solo para desarrollo. Si la cambias en el script, actualiza también `DATABASE_URL` en `backend/.env`. El script es idempotente: puedes volver a ejecutarlo sin duplicar categorías, políticas ni migraciones.

### 3. Configurar el backend

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus valores. Como mínimo:

```dotenv
DATABASE_URL="mysql://biblioteca:biblioteca123@127.0.0.1:3306/biblioteca_g03"
JWT_SECRET="una_clave_aleatoria_de_al_menos_32_caracteres"
ADMIN_EMAIL=admin@biblioteca.ug.edu.ec
ADMIN_PASSWORD=una_clave_de_admin_de_al_menos_8_caracteres
```

- `DATABASE_URL` debe coincidir con el usuario y la clave creados por el script.
- `JWT_SECRET` debe tener al menos 32 caracteres.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` definen la cuenta de Administrador que crea el seed.

### 4. Generar el cliente de Prisma y crear el Administrador

```bash
npm run prisma:generate
npm run prisma:seed
```

El seed es idempotente para el Administrador, las políticas y las categorías: usa `upsert` y no duplica esos registros. Además, si la tabla `Libro` está vacía, carga un catálogo inicial de 15 libros con 31 ejemplares de ejemplo; si ya existen libros, no agrega datos de demostración.

### 5. Iniciar backend y frontend

En dos terminales:

```bash
# Terminal 1: API en http://localhost:4000
npm run dev:backend
```

```bash
# Terminal 2: interfaz en http://localhost:5173
npm run dev:frontend
```

Abre `http://localhost:5173` e inicia sesión con el correo y la contraseña definidos como `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env`.

La interfaz llama a `/api` y Vite redirige al backend en el puerto 4000. Si el frontend se sirve desde otro origen, define `VITE_API_URL` en el entorno de compilación con la URL pública de la API (por ejemplo, `https://api.example.com/api`).

## Credenciales de demostración

Cuentas disponibles en el entorno de entrega:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@biblioteca.ug.edu.ec` | `Admin12345*` |
| Bibliotecario | `bib.e2e@example.com` | `Bib12345*` |

- La contraseña del Administrador se define en `backend/.env` mediante `ADMIN_PASSWORD`; el valor mostrado corresponde a este entorno de desarrollo.
- La cuenta de Bibliotecario se creó manualmente para las pruebas de la entrega y **no** la genera el seed. Si reinstalas la base, créala desde **Usuarios → Crear cuenta** (cuenta de personal) con el rol Bibliotecario.
- Estas credenciales son solo para la demostración académica. Cámbialas antes de usar el sistema en un entorno real o público.

## Variables de entorno

El backend lee `backend/.env`, que está ignorado por Git. La plantilla es `backend/.env.example`.

| Variable | Obligatoria | Descripción |
| --- | :---: | --- |
| `NODE_ENV` | No | `development`, `test` o `production`. Por defecto `development`. |
| `PORT` | No | Puerto del backend. Por defecto `4000`. |
| `DATABASE_URL` | Sí | Cadena de conexión de Prisma a MySQL 8. |
| `JWT_SECRET` | Sí | Secreto de firma de sesiones; mínimo 32 caracteres. |
| `JWT_EXPIRES_IN` | No | Duración de la sesión. Por defecto `8h`. |
| `COOKIE_NAME` | No | Nombre de la cookie de sesión. Por defecto `bg03_token`. |
| `FRONTEND_URL` | No | Origen permitido por CORS. Por defecto `http://localhost:5173`. |
| `ADMIN_EMAIL` | Sí | Correo del Administrador que crea el seed. |
| `ADMIN_PASSWORD` | Sí | Contraseña inicial del Administrador; mínimo 8 caracteres. |

Nunca publiques `backend/.env` ni reutilices las claves de ejemplo en producción.

## Base de datos y migraciones

El script `database/biblioteca_g03.sql` deja la base lista para la aplicación y registra las cuatro migraciones existentes. Por eso, después de usarlo **no necesitas ejecutar `prisma migrate dev`**.

| Comando | Cuándo usarlo |
| --- | --- |
| `npm run prisma:migrate` | Aplica migraciones pendientes con `prisma migrate deploy`. No crea base de datos sombra. Es seguro ejecutarlo en local o producción. |
| `npm run prisma:migrate:dev` | Solo cuando estás creando o modificando migraciones durante el desarrollo. Usa `prisma migrate dev` y requiere permisos para crear la base sombra. |
| `npm run prisma:seed` | Crea el Administrador, asegura las políticas y categorías iniciales y, si el catálogo está vacío, carga libros de ejemplo. |
| `npm run prisma:generate` | Regenera el cliente de Prisma después de cambiar `schema.prisma`. |

### Si aparece el error P3014 / P1010

```
Prisma Migrate could not create the shadow database...
Original error: Error code: P1010
```

Ocurre al ejecutar `prisma migrate dev` con el usuario `biblioteca`, porque ese usuario solo tiene permisos sobre `biblioteca_g03` y no puede crear la base sombra. Para el uso normal del proyecto no necesitas ese comando: usa el script SQL y `npm run prisma:migrate`.

Si necesitas crear una migración nueva, ejecuta `npm run prisma:migrate:dev` con un usuario que pueda crear bases de datos (por ejemplo, `root`) o concede los privilegios necesarios:

```sql
GRANT CREATE, DROP ON *.* TO 'biblioteca'@'localhost';
GRANT CREATE, DROP ON *.* TO 'biblioteca'@'127.0.0.1';
FLUSH PRIVILEGES;
```

También puedes definir `shadowDatabaseUrl` en `backend/.env` con una base dedicada. En producción usa siempre `npm run prisma:migrate` (`migrate deploy`).

### Reiniciar la base de datos desde cero

> Esto elimina todos los datos. Úsalo solo en desarrollo.

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS biblioteca_g03;"
mysql -u root -p < database/biblioteca_g03.sql
npm run prisma:seed
```

## Pruebas

```bash
# Pruebas unitarias e integración del backend
npm test
```

Las pruebas de integración:

- Levantan la aplicación en un puerto efímero.
- Usan la base de datos configurada en `backend/.env`.
- Crean sus propios usuarios, libros y préstamos, y los eliminan al finalizar.
- Ajustan temporalmente políticas de préstamo y las restauran al terminar.
- **No deben ejecutarse contra una base de datos de producción.**

Cobertura actual:

- Registro público, hash de contraseña y unicidad.
- Permisos por rol en el servidor (RN-02).
- Duplicados, lote de Institución educativa, disponibilidad y capacidad.
- Entrega, cálculo de plazo, renovación y límite de renovaciones.
- Devolución con retraso, daño y pérdida.
- Cancelación por Cliente y Bibliotecario.
- Baja lógica de libros y bloqueo con préstamos pendientes.
- Reportes, filtros de fecha y alcance del historial del Cliente.
- Cálculo de estados derivados «Por vencer» y «Vencido».
- Autoservicio del Cliente: edición de datos personales (incluido el correo) y protección de identificación, rol y tipo de cliente.
- Solicitudes de cambio de tipo: creación, duplicados, datos de institución, aprobación, rechazo, cancelación y permisos por rol.
- Cambio a Estudiante y aplicación de su política de préstamo (20 días) tras la aprobación.

Verificación manual complementaria: la interfaz se recorrió con Playwright en escritorio y móvil (registro público en cuatro pasos con indicador de avance, login por rol, catálogo, solicitud, ciclo completo del préstamo, edición de políticas, cuentas, reportes y menú móvil). El detalle se registra en `docs/CONTINUIDAD_PROYECTO.md`.

## Compilar el frontend

```bash
npm run build
```

El resultado queda en `frontend/dist`. Para revisarlo localmente:

```bash
npm run preview --workspace frontend
```

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev:backend` | Backend con recarga automática. |
| `npm run dev:frontend` | Servidor de desarrollo de Vite. |
| `npm run build` | Compila el frontend para producción. |
| `npm run prisma:generate` | Genera el cliente de Prisma. |
| `npm run prisma:migrate` | Aplica migraciones pendientes con `migrate deploy`. |
| `npm run prisma:migrate:dev` | Crea/aplica migraciones en desarrollo con `migrate dev`. |
| `npm run prisma:seed` | Ejecuta el seed inicial. |
| `npm test` | Ejecuta las pruebas del backend. |

Para producción, el backend tiene `npm start --workspace backend` (sin recarga) y las migraciones se aplican con `npm run prisma:migrate`.

## Solución de problemas

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL no está en ejecución. | Inicia el servicio de MySQL (`sudo systemctl start mysql` en Linux, o el panel de servicios de tu sistema). |
| `Access denied for user 'biblioteca'` | La clave de `DATABASE_URL` no coincide con la del script. | Vuelve a ejecutar `database/biblioteca_g03.sql` o corrige `backend/.env`. |
| `P3014` / `P1010` | `prisma migrate dev` no puede crear la base sombra. | Usa `npm run prisma:migrate` o el script SQL; para crear migraciones, usa un usuario con permisos o `shadowDatabaseUrl`. |
| El frontend muestra error de red en `/api` | El backend no está iniciado o el puerto 4000 está ocupado. | Inicia `npm run dev:backend` y revisa `http://localhost:4000/api/salud`. |
| El puerto 5173 está ocupado | Otro servidor de Vite sigue activo. | Cierra el proceso anterior o inicia con `npm run dev:frontend -- --port 5174`. |
| El inicio no muestra libros | La base no tiene libros registrados. | Ejecuta `npm run prisma:seed` (carga 15 libros si el catálogo está vacío) o registra libros como Bibliotecario. |
| No se puede adjuntar un documento a una solicitud | El archivo supera 5 MB, no es PDF/JPG/PNG o se intentaron adjuntar más de 3. | Ajusta el archivo y vuelve a intentarlo. Los documentos se guardan en `backend/uploads/solicitudes/`. |

## Seguridad implementada

- Contraseñas con hash bcrypt (costo 12 en la aplicación).
- Sesión con JWT en cookie `httpOnly`, `sameSite=lax` y `secure` cuando `NODE_ENV=production`.
- Autorización por rol en el servidor para cada ruta; la interfaz no sustituye esa validación.
- Validación de entrada con Zod en el backend y validación de formularios en el frontend.
- Consultas parametrizadas mediante Prisma y SQL etiquetado para los reportes.
- Helmet, CORS restringido a `FRONTEND_URL`, límite de tamaño de JSON y límites de intentos en login y registro.
- Carga de documentos con límite de 3 archivos de 5 MB, tipos PDF/JPG/PNG y descarga autenticada solo para el cliente propietario o el personal de biblioteca.
- Variables sensibles fuera del código y de los archivos versionados.
- El frontend nunca se conecta directamente a MySQL.

## Consideraciones para AWS (no requerido para esta entrega)

Por decisión del proyecto, esta entrega se valida en ejecución local. El SRS menciona AWS como entorno de despliegue (RN-11), pero la arquitectura concreta no está definida y no es un paso necesario para usar el sistema. Esta sección queda como referencia para una etapa futura. Como lista de verificación técnica:

1. Provisionar MySQL 8 administrado y ejecutar `prisma migrate deploy` y el seed una sola vez.
2. Ejecutar el backend con `NODE_ENV=production`, HTTPS y un gestor de procesos o contenedor.
3. Definir `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` y las credenciales del Administrador mediante variables o un servicio de secretos.
4. Compilar el frontend con la URL pública de la API y servirlo por HTTPS.
5. Verificar CORS con el origen exacto del frontend y el funcionamiento de cookies `secure`.
6. Configurar respaldos periódicos de la base de datos (RNF-06) y monitoreo básico.
7. Confirmar que los reportes y las consultas cumplen el objetivo de respuesta de RNF-01.

No se debe afirmar que el sistema está desplegado en AWS hasta completar y verificar esos pasos.

## Alcance y limitaciones conocidas

- No hay recuperación de contraseña; está fuera del alcance acordado.
- El registro público crea siempre Lector general; desde **Mi perfil** el Cliente puede solicitar el cambio a Estudiante, Becario o Institución educativa con sus documentos de validación, y el Bibliotecario lo aprueba o rechaza.
- Los documentos de validación se adjuntan como archivos PDF/JPG/PNG (hasta 3 de 5 MB) y se almacenan en `backend/uploads/solicitudes/`; la descarga exige sesión y está limitada al propietario o al personal de biblioteca.
- No se gestionan multas ni sanciones por retraso, daño o pérdida.
- El envío de notificaciones por SMTP es opcional en el SRS y no está implementado.
- Los estados «Por vencer» y «Vencido» son derivados, no persistidos.
- La entrega se ejecuta en local; el despliegue en AWS no es requisito para esta entrega.

## Documentación relacionada

- `docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md`: requerimientos funcionales y reglas de negocio.
- `diseno_visual_biblioteca_G03.mk`: identidad visual, componentes y reglas responsive.
- `docs/POLITICAS_PRESTAMO_G03.md`: valores de política, documentos, renovaciones, devoluciones y estados.
- `docs/CONTINUIDAD_PROYECTO.md`: estado actual, decisiones, verificación y trabajo pendiente.
- `docs/ACTUALIZACIONES_REQUERIMIENTOS_G03.md`: registro de la revisión y correcciones aplicadas al documento de requerimientos.
- `database/biblioteca_g03.sql`: script completo para crear la base de datos, el usuario de aplicación, el esquema, las migraciones registradas y los datos iniciales.
