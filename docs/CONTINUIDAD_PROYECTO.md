# Continuidad del proyecto — Biblioteca Virtual G03

**Última actualización:** 23/11/2026

Este documento resume el estado del proyecto, las decisiones aplicadas, la forma de ejecutarlo, las verificaciones realizadas y el trabajo pendiente. No contiene contraseñas, secretos ni cadenas de conexión reales. Debe actualizarse cuando el avance llegue aproximadamente al 70–80 % del contexto de una sesión o antes de cerrar una etapa importante.

## 1. Estado general

El sistema está implementado de extremo a extremo para el alcance funcional del SRS:

- Backend Node.js/Express con API REST, autenticación, autorización por roles, validación con Zod y Prisma sobre MySQL 8.
- Base de datos con migraciones y seed (Administrador, políticas iniciales, categorías y catálogo de ejemplo).
- Frontend React con Material UI, rutas protegidas por rol, formularios validados, tablas paginadas, diálogos, panel de detalle de préstamo y reportes imprimibles.
- Diseño visual alineado con `diseno_visual_biblioteca_G03.mk`: naranja `#E87524`, tipografía Roboto, layout con barra lateral y barra superior, chips con texto, tablas con desplazamiento horizontal y navegación móvil.
- Pruebas automatizadas del backend (unitarias y de integración) y verificación de la interfaz con Playwright.

Por decisión del proyecto, la entrega se valida en ejecución local. El despliegue en AWS mencionado en el SRS no es un requisito para esta entrega y no se ejecutará en esta etapa. El sistema se desarrolló y verificó localmente.

## 2. Arquitectura implementada

### Estructura

- Monorepositorio con npm workspaces: `backend` y `frontend`.
- Backend en `backend/src`, organizado por módulos: `auth`, `usuarios`, `perfil`, `categorias`, `libros`, `politicas`, `prestamos` y `reportes`.
- Frontend en `frontend/src`, separado en `components`, `context`, `pages`, `routes`, `services`, `theme` y `utils`.
- Base de datos definida en `backend/prisma/schema.prisma`; migraciones en `backend/prisma/migrations`; datos iniciales en `backend/prisma/seed.js`.

### Autenticación y autorización

- Login con correo y contraseña.
- Contraseñas con bcrypt; la aplicación usa costo 12.
- Sesión con JWT firmado y almacenado en cookie `httpOnly`, `sameSite=lax`; `secure` se activa con `NODE_ENV=production`.
- Middleware `autenticar` valida la cookie, la vigencia del token y que la cuenta siga activa.
- Middleware `autorizar(...roles)` protege cada ruta en el servidor. La interfaz también oculta opciones, pero la seguridad no depende de ella.
- Límites de intentos en login y registro; Helmet, CORS restringido y límite de tamaño del cuerpo JSON.

### Modelo de datos

Modelos principales:

- `Usuario`: datos personales, rol, tipo de cliente, estado activo, documento de validación y datos de institución/responsable.
- `PoliticaPrestamo`: una política por tipo de cliente.
- `Categoria`, `Libro` y `Ejemplar`: catálogo con copias individuales y condición física.
- `SolicitudPrestamo`: agrupa los préstamos de una solicitud por lote.
- `Prestamo`: ciclo de vida, fechas, ejemplar, condición de devolución y responsables de cada acción.
- `HistorialEstadoPrestamo`: auditoría de transiciones con usuario, fecha y observación.
- `SolicitudTipoCliente`: solicitud del Cliente para cambiar a Estudiante, Becario o Institución educativa, con documento, datos de institución/responsable, estado, revisor y observación.
- `DocumentoSolicitudTipo`: archivos PDF/JPG/PNG adjuntos a una solicitud de cambio de tipo, con nombre original, nombre almacenado, tipo y tamaño. Los archivos viven en `backend/uploads/solicitudes/`.

### Roles

| Rol | Alcance |
| --- | --- |
| Administrador | Cuentas y perfiles, activación/desactivación, políticas de préstamo, consulta de reportes. No registra libros ni préstamos. |
| Bibliotecario | Catálogo y ejemplares, tipos de cliente y documento de validación, revisión de solicitudes de cambio de tipo, solicitudes, aprobación, entrega, renovación, devolución, cancelación y reportes. |
| Cliente | Catálogo, solicitudes propias, consulta de sus préstamos, edición de sus datos personales y solicitud de cambio de tipo de cliente. |

### Ciclo de préstamos

- Estados persistidos: `SOLICITADO`, `APROBADO`, `PRESTADO`, `RENOVADO`, `DEVUELTO`, `DEVUELTO_CON_RETRASO`, `CANCELADO`, `PERDIDO`.
- Estados derivados al consultar: `POR_VENCER` (fecha límite dentro de 3 días) y `VENCIDO` (fecha límite pasada).
- El ejemplar se reserva al aprobar, no al solicitar.
- Aprobar y crear solicitudes usan transacciones serializables con reintento ante conflictos para evitar doble reserva.
- La capacidad cuenta préstamos en `APROBADO`, `PRESTADO` y `RENOVADO`.
- Renovación solo por Bibliotecario, antes del vencimiento, con extensión y máximo según la política.
- Devolución con condición `BUENO`, `DANADO` o `PERDIDO`; el retraso se calcula con la fecha límite; el ejemplar perdido no vuelve a estar disponible.
- Cancelación: Cliente solo en `SOLICITADO`; Bibliotecario en `SOLICITADO` o `APROBADO`. Al cancelar un aprobado se libera el ejemplar.
- Baja de libros lógica; bloqueada si existen préstamos activos o solicitudes pendientes.

### Reportes

- Tres reportes operativos: catálogo de libros, disponibilidad y préstamos.
- Acceso para Administrador y Bibliotecario; el Cliente solo consulta su historial propio.
- Límite de 1000 filas por reporte.
- Filtros de fecha con día calendario de Ecuador (UTC-5).
- Impresión desde el navegador; solo se imprime el reporte activo.

### Frontend

- Tema centralizado en `frontend/src/theme/index.js`.
- Rutas protegidas en `frontend/src/routes/AppRoutes.jsx`.
- Servicios HTTP en `frontend/src/services`; nunca hay acceso directo a MySQL desde el navegador.
- Componentes reutilizables para tablas, paginación, formularios, diálogos, chips de estado, encabezados y estados vacíos.
- Navegación adaptable con menú lateral en escritorio y menú temporal en móvil.
- Los formularios usan React Hook Form y Zod; los campos de MUI usan `forwardRef` e `inputRef` para registrarse correctamente.
- Los selects controlados por React Hook Form usan `Controller`.

## 3. Decisiones aplicadas

### Requerimientos y alcance

1. El SRS markdown es la fuente de verdad funcional. El archivo `guia_revision_biblioteca_G03.mk` no existe en el repositorio; no se usó.
2. No se agregaron roles, estados, campos ni procesos fuera del SRS y de las decisiones aprobadas.
3. Los valores de política no están fijados por el SRS. Se aprobaron y sembraron valores iniciales, configurables por el Administrador:
   - Lector general: 3 préstamos, 15 días, 1 renovación de 15 días.
   - Estudiante: 4 préstamos, 20 días, 1 renovación de 20 días.
   - Becario: 4 préstamos, 20 días, 2 renovaciones de 20 días.
   - Institución educativa: 10 préstamos, 30 días, 1 renovación de 30 días.
4. El registro público crea siempre `CLIENTE` con tipo `LECTOR_GENERAL`. El Cliente puede editar sus datos personales (incluido el correo) y solicitar el cambio a Estudiante, Becario o Institución educativa desde Mi perfil; el Bibliotecario revisa y aprueba o rechaza la solicitud. Las transiciones permitidas son: Lector general → Estudiante, Becario o Institución educativa; Estudiante → Becario o Institución educativa; Becario → Institución educativa; Institución educativa no presenta solicitudes.
5. El documento de validación se registra como referencia y, además, la solicitud admite hasta tres archivos PDF/JPG/PNG de 5 MB cada uno. Los archivos se almacenan en `backend/uploads/solicitudes/` y se registran en `DocumentoSolicitudTipo`.
6. Cada libro genera N ejemplares individuales con código único y condición física.
7. «Por vencer» se definió como 3 días antes de la fecha límite; el SRS no fija el valor.
8. «Por vencer» y «Vencido» no se persisten; se derivan de la fecha límite para evitar tareas programadas y datos inconsistentes.
9. No hay recuperación de contraseña, multas, sanciones ni notificaciones SMTP; quedaron fuera del alcance acordado o son opcionales en el SRS.
10. Los reportes usan un tope de 1000 filas y fechas de Ecuador (UTC-5).
11. La eliminación de libros es lógica y requiere confirmación en la interfaz. No se elimina un libro con préstamos activos o solicitudes pendientes.
12. El registro público se organiza en cuatro pantallas: cédula, nombres y apellidos, correo y dirección, y contraseña. La interfaz es compacta: solo muestra el paso actual, una barra de progreso con «Paso X de 4», validación por paso, botón Atrás y los campos necesarios. No repite un resumen de los datos ya ingresados. Se aplican las heurísticas de Nielsen: visibilidad del estado, control y libertad, prevención de errores, reconocimiento antes que recuerdo y ayuda clara.
13. Las solicitudes de cambio de tipo permiten adjuntar hasta 3 documentos PDF/JPG/PNG de 5 MB cada uno. La descarga exige sesión y solo está disponible para el Cliente propietario o el personal de biblioteca.
14. El seed carga 15 libros con 31 ejemplares solo cuando la tabla `Libro` está vacía, para que el catálogo no aparezca vacío en una instalación nueva.

### Operación y verificación

1. El entorno local usa MySQL 8 instalado en el sistema. La base se crea con `database/biblioteca_g03.sql`, que incluye esquema, usuario, migraciones registradas y datos iniciales. No se usa Docker.
2. La entrega se valida en local; el despliegue en AWS no forma parte de los pendientes de esta etapa.
3. Las pruebas de integración usan la base de datos configurada, crean datos únicos y los eliminan al finalizar. También modifican políticas temporalmente y las restauran.
4. La verificación de interfaz se realizó con Chromium headless mediante Playwright en escritorio (1440×1000) y móvil (390×844).

## 4. Brechas y decisiones pendientes

1. **Indicador `requiereDocumento`:** la política incluye un campo editable `requiereDocumento`, pero la validación del backend exige documento para Estudiante, Becario e Institución educativa y lo deja opcional para Lector general. Si el Administrador desactiva el indicador, la exigencia no cambia. Falta decidir si se hace configurable de verdad o si se retira/etiqueta el indicador como informativo.
2. **RN-08:** el SRS indica «toda eliminación de registros requiere confirmación previa del Administrador». Se interpretó como confirmación en la interfaz, ya que RN-02 asigna la eliminación de libros al Bibliotecario. Si se requiere una aprobación explícita del Administrador, es un flujo nuevo que debe aprobarse y diseñarse.
3. **AWS:** fuera de alcance para esta entrega por decisión del proyecto. El SRS menciona AWS, pero no se definió arquitectura ni se desplegó. La ejecución local es el objetivo de entrega.
4. **Datos de demostración:** la base local acumuló usuarios, libros y préstamos de las pruebas manuales de interfaz. Antes de una entrega o demostración conviene reiniciar la base y volver a ejecutar el seed.
5. **Manuales formales:** el SRS pide un manual de usuario y un manual técnico de instalación. `README.md` y `docs/POLITICAS_PRESTAMO_G03.md` cubren gran parte del contenido técnico, pero falta la entrega formal de ambos manuales.
6. **Repositorio Git:** el proyecto se versionó en un repositorio Git local en la rama `main`. Falta definir el remoto (por ejemplo, GitHub) y la estrategia de ramas para el trabajo colaborativo.
7. **Pruebas de interfaz automatizadas:** la prueba Playwright se ejecutó fuera del repositorio y no quedó versionada. Las pruebas del backend sí están en `backend/tests`.
8. **Tamaño del bundle:** el build del frontend emite una advertencia de chunk mayor a 500 kB. No impide la compilación; una mejora opcional es dividir rutas con importaciones dinámicas.

## 5. Cómo ejecutar y verificar

Los pasos completos están en `README.md`. Resumen:

```bash
# Dependencias
npm install

# Base de datos local (MySQL 8 instalado)
mysql -u root -p < database/biblioteca_g03.sql

# Configuración
cp backend/.env.example backend/.env
# Editar backend/.env con DATABASE_URL, JWT_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD.

# Cliente de Prisma y seed
npm run prisma:generate
npm run prisma:seed

# Desarrollo
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Salud de la API: `GET http://localhost:4000/api/salud`

### Comandos de verificación

```bash
# Pruebas unitarias y de integración
npm test

# Build del frontend
npm run build

# Migraciones pendientes (migrate deploy, sin base sombra)
npm run prisma:migrate
```

## 6. Verificaciones realizadas

**Fecha de la última verificación:** 23/11/2026.

| Verificación | Resultado |
| --- | --- |
| `npm test` (backend) | 20 pruebas aprobadas, 0 fallidas. Incluye 6 unitarias de estados derivados y 14 de integración. |
| `npm run build` (frontend) | Compilación correcta. Solo advertencia de tamaño de chunk (>500 kB). |
| Política de Estudiante | Migración `20261123120000_tipo_cliente_estudiante` aplicada; política creada con 4 préstamos, 20 días y 1 renovación de 20 días. |
| Flujo API completo | Registro, edición de perfil, solicitud de cambio de tipo, aprobación/rechazo, asignación de tipo/documento, creación de libro y ejemplares, solicitud, bloqueo por rol, aprobación, entrega, renovación, rechazo de segunda renovación, devolución, disponibilidad restaurada y tres reportes. |
| Recorrido de interfaz con Playwright | 12 escenarios aprobados en escritorio y móvil; 0 errores de página, 0 errores de consola y 0 peticiones fallidas. |
| Revisión visual | Capturas de inicio, usuarios, políticas, reportes, catálogo, mis préstamos, ciclo del préstamo, clientes y vista móvil revisadas contra la guía visual. |

La prueba de interfaz cubrió: login por rol, menú del Administrador, edición de política y reactivación de cuenta, solicitud desde catálogo, ciclo completo del préstamo por el Bibliotecario, creación de libro desde la interfaz, cambio de tipo de cliente, carga y descarga de documentos adjuntos, reportes y menú móvil. La versión 1.3 agrega el catálogo destacado con filtros en el inicio y la gestión de solicitudes de cambio de tipo. El registro se organiza en cuatro pantallas guiadas: cédula, nombres y apellidos, correo y dirección, y contraseña, con indicador de avance compacto y sin resumen intermedio de datos.

## 7. Trabajo pendiente sugerido

Orden recomendado:

1. Resolver la brecha del indicador `requiereDocumento`.
2. Aclarar con los interesados el alcance real de RN-08.
3. Reiniciar la base de demostración y ejecutar el seed antes de la entrega.
4. Elaborar los manuales de usuario y técnico solicitados por el SRS.
5. ~~Inicializar Git y versionar el proyecto.~~ Completado: el repositorio se inicializó en la rama `main` con el commit inicial.
6. Opcional: versionar la prueba Playwright, agregar integración continua y dividir el bundle del frontend.

El despliegue en AWS no está en la lista de pendientes de esta entrega.

## 8. Archivos clave

| Archivo | Propósito |
| --- | --- |
| `docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md` | Fuente funcional y reglas de negocio. |
| `diseno_visual_biblioteca_G03.mk` | Identidad visual y reglas responsive. |
| `README.md` | Instalación, configuración, ejecución, pruebas y notas de despliegue. |
| `docs/POLITICAS_PRESTAMO_G03.md` | Políticas aplicadas y comportamiento del ciclo de préstamos. |
| `database/biblioteca_g03.sql` | Crea la base, el usuario, el esquema, las migraciones registradas y los datos iniciales. |
| `backend/prisma/schema.prisma` | Modelo de datos. |
| `backend/prisma/seed.js` | Administrador, políticas, categorías y catálogo inicial de ejemplo. |
| `backend/src/app.js` | Middleware global, límites y montaje de rutas. |
| `backend/src/modules/prestamos/prestamos.service.js` | Reglas del ciclo de préstamos. |
| `backend/src/modules/libros/libros.service.js` | Catálogo, ejemplares, disponibilidad y baja lógica. |
| `backend/src/modules/solicitudes-tipo/solicitudes-tipo.service.js` | Solicitudes de cambio de tipo y aprobación/rechazo del Bibliotecario. |
| `backend/src/modules/reportes/reportes.service.js` | Reportes y filtros. |
| `backend/src/utils/dates.js` | Estados derivados y suma de días. |
| `backend/src/utils/constants.js` | Estados, etiquetas y umbral de «Por vencer». |
| `backend/tests/integracion.test.js` | Pruebas de integración de reglas y permisos. |
| `backend/tests/dates.test.js` | Pruebas unitarias de estados derivados. |
| `frontend/src/routes/AppRoutes.jsx` | Rutas y protección por rol. |
| `frontend/src/theme/index.js` | Tema y paleta visual. |
| `frontend/src/components/prestamos/PrestamoDetalleDrawer.jsx` | Detalle y acciones del préstamo. |
| `frontend/src/components/common/FormTextField.jsx` | Campo de texto compatible con React Hook Form. |
| `frontend/src/components/common/FormSelect.jsx` | Select compatible con React Hook Form. |

## 9. Notas de entorno local de la sesión

Estas notas son operativas y pueden cambiar; no forman parte de la configuración entregable:

- MySQL 8 instalado en el sistema, escuchando en `127.0.0.1:3306`, base `biblioteca_g03`.
- La base se crea y restaura con `mysql -u root -p < database/biblioteca_g03.sql`.
- Si cambias la clave del usuario `biblioteca`, actualiza `DATABASE_URL` en `backend/.env`.
- Backend en el puerto 4000 y Vite en el 5173.
- El archivo `backend/.env` es local y está ignorado por Git; contiene las credenciales de desarrollo y no debe copiarse a la documentación.
- Los scripts de verificación de interfaz viven en el directorio temporal `/tmp/opencode` y no forman parte del repositorio.

## 10. Protocolo de continuidad

Al retomar el proyecto:

1. Leer este documento y `docs/POLITICAS_PRESTAMO_G03.md`.
2. Revisar el estado de los servicios y ejecutar `npm test` para confirmar la línea base.
3. No modificar los documentos de requerimientos ni de diseño visual.
4. Registrar toda decisión nueva en la sección 3 o 4 y actualizar `docs/POLITICAS_PRESTAMO_G03.md` si afecta reglas de préstamo.
5. No incluir secretos, contraseñas ni cadenas de conexión reales en este archivo.
6. Antes de cerrar una sesión con avance significativo, actualizar estado, verificaciones y pendientes.
