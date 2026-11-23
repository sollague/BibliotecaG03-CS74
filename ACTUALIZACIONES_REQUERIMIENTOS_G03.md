# Actualizaciones y contradicciones del documento de requerimientos G03

**Documento revisado:** `Documento_de_requerimientos_G03_Biblioteca_Virtual.md`  
**Fecha de revisión:** 23/11/2026  
**Objetivo:** listar los cambios que deben aplicarse al documento de requerimientos antes de consolidarlo en el documento principal, y señalar las contradicciones detectadas.

> **Estado:** las correcciones de este documento ya fueron aplicadas al documento de requerimientos el 23/11/2026 (versiones 1.4 y 1.5). Se agregó la sección **2.4. Exclusión del componente económico** y la regla **RN-13** para destacar que el sistema es exclusivamente de solicitud y gestión de préstamos y no incluye ningún componente económico. La versión 1.5 incorpora el tipo de cliente **Estudiante** y su política de préstamo. Este archivo queda como registro de la revisión y de las decisiones tomadas.

---

## 1. Resumen ejecutivo

El documento de requerimientos sigue describiendo en varias partes el sistema anterior o una versión ideal que no coincide con lo implementado. Los cambios más importantes son:

1. El registro público ya no solicita documento de validación ni datos de institución: crea siempre una cuenta **Cliente / Lector general** en un flujo de **4 pasos**.
2. Los documentos de validación ahora se adjuntan como **archivos PDF/JPG/PNG** en la solicitud de cambio de tipo, no solo como texto.
3. El **Bibliotecario** es quien gestiona los tipos de cliente y revisa las solicitudes; el **Administrador** gestiona cuentas, perfiles de acceso y políticas.
4. Los estados **Por vencer** y **Vencido** se calculan al consultar; no se almacenan.
5. La entrega actual es **local** (Node.js + MySQL + Prisma). AWS sigue siendo una referencia de despliegue futuro, no una implementación verificada.
6. El catálogo inicial se carga con `npm run prisma:seed` cuando la tabla `Libro` está vacía (15 libros y 31 ejemplares de ejemplo).
7. El documento tiene problemas de formato por la exportación desde Google Docs: casi todas las líneas empiezan con `# `, la numeración de secciones se repite y algunas referencias internas están rotas.

---

## 2. Cambios obligatorios por sección

### 2.1. Formato, portada y numeración

- [ ] Eliminar el prefijo `# ` del inicio de casi todas las líneas. En Markdown eso convierte cada línea en un encabezado y rompe tablas, listas y párrafos.
- [ ] Corregir la numeración de las secciones: actualmente varias se numeran como `1.` (Propósito, Alcance, Referencias, Funcionalidades, Clases de usuarios, etc.). Debe quedar 1, 2, 3… hasta 12.
- [ ] Revisar la tabla de contenido y actualizar los números de página después de los cambios.
- [ ] Unificar el uso de `RN-09` (en el documento aparece `RN-9`).
- [ ] Revisar la sección `3.4`: el estado **Aprobado** existe en el sistema y en la sección 2.2, pero no aparece en la lista 3.4.
- [ ] Corregir la referencia de RN-04 a la sección `7.3.5`, que no existe. Los estados están en la sección 3.4 y la nueva sección de estados derivados.
- [ ] Corregir el título `7.2.4. ELIMINACIÓN DE EJEMPLARES`: el contenido habla de eliminar libros. Debe decir `ELIMINACIÓN DE LIBROS Y EJEMPLARES`.

### 2.2. Historial de versiones

Agregar una fila nueva:

| Fecha | Versión | Autor | Organización | Descripción |
| :---: | :---: | :---: | :---: | :--- |
| 23/11/2026 | 1.4 | DREAM TEAM | DREAM TEAM | Registro guiado en 4 pasos, carga de documentos en solicitudes de cambio de tipo, catálogo inicial de ejemplo, corrección de roles y aclaración de estados derivados. |

También conviene actualizar la fecha de la portada (`10/11/2026`) a la fecha de la nueva versión.

### 2.3. Sección 2.2. Beneficios del sistema

- [ ] Cambiar la responsabilidad del Administrador: gestiona **cuentas, perfiles de acceso y políticas de préstamo**. No gestiona tipos de cliente.
- [ ] Indicar que el **Bibliotecario** gestiona los tipos de cliente, registra el documento de validación y revisa las solicitudes de cambio.
- [ ] Indicar que el **Cliente** puede solicitar el cambio de tipo desde su perfil y adjuntar documentos.
- [ ] Agregar que el correo también es único, además del ISBN y la identificación.
- [ ] Aclarar que **Por vencer** y **Vencido** son estados calculados al consultar, no columnas persistidas.
- [ ] Mencionar la cancelación de préstamos y de solicitudes de cambio de tipo.

**Texto sugerido para el párrafo de roles:**

> El Administrador gestiona las cuentas del personal, los perfiles de acceso y las políticas de préstamo. El Bibliotecario administra el catálogo, los ejemplares, los tipos de cliente y las solicitudes de cambio de tipo, y controla el ciclo de préstamos. El Cliente consulta el catálogo, solicita préstamos, consulta sus propios préstamos, actualiza sus datos personales y puede solicitar el cambio a Becario o Institución educativa adjuntando los documentos de validación.

### 2.4. Sección 2.3. Alcance del proyecto

- [ ] Cambiar `asignación de roles de Administrador y Cliente` por `Administrador, Bibliotecario y Cliente`.
- [ ] Agregar el módulo o funcionalidad de **solicitudes de cambio de tipo de cliente** y **documentos adjuntos**.
- [ ] Cambiar `cantidad disponible` por `cantidad de ejemplares`; la disponibilidad se calcula según los préstamos activos y la condición del ejemplar.
- [ ] Agregar la consulta de **Mis préstamos** para el Cliente.
- [ ] Agregar la baja lógica de libros y la eliminación controlada de ejemplares.

### 2.5. Sección 4. Funcionalidades del producto

- [ ] Agregar `1.7. SOLICITUDES DE CAMBIO DE TIPO DE CLIENTE` con: creación, carga de documentos, cancelación por el Cliente, revisión, aprobación y rechazo por el Bibliotecario.
- [ ] Agregar `3.5. CANCELACIÓN DE PRÉSTAMOS`.
- [ ] Agregar `3.6. ESTADOS DERIVADOS: POR VENCER Y VENCIDO`.
- [ ] Agregar `5.3. SOLICITUD DE CAMBIO DE TIPO DESDE EL PERFIL`.
- [ ] Incluir **Aprobado** dentro de la lista de estados de la sección 3.4.

### 2.6. Sección 5. Clases y características de usuarios

- [ ] **ADMINISTRADOR:** quitar `tipos de cliente`. Debe decir que gestiona cuentas del personal, perfiles de acceso y políticas de préstamo, y que no registra libros ni préstamos.
- [ ] **BIBLIOTECARIO:** agregar que gestiona los tipos de cliente, registra el documento de validación y revisa las solicitudes de cambio con sus documentos adjuntos.
- [ ] **CLIENTE (los tres tipos):** agregar que puede solicitar el cambio de tipo desde su perfil y adjuntar documentos.
- [ ] Aclarar que el Cliente no puede modificar su identificación, rol ni tipo de cliente por sí mismo.

### 2.7. Sección 6. Entorno operativo

- [ ] Decidir y reflejar la realidad de la entrega: actualmente el sistema se ejecuta en **local** con Node.js, MySQL 8 y Prisma. AWS no está desplegado ni verificado.
- [ ] Si el documento principal debe describir lo entregado, cambiar `alojado en AWS` por `previsto para AWS; la entrega actual se ejecuta en entorno local`.
- [ ] Agregar Node.js 20+, npm 10+, MySQL 8.0 y Prisma 6.
- [ ] Agregar que los documentos de las solicitudes se almacenan localmente en `backend/uploads/solicitudes/` para esta entrega.
- [ ] Eliminar cualquier mención a Docker si se llegara a incluir; el proyecto ya no usa Docker.

### 2.8. Sección 7.1. Usuarios

#### 7.1.1. Registro de usuarios

- [ ] Actualizar la descripción: el registro público crea una cuenta **Cliente / Lector general** en cuatro pasos: cédula, nombres y apellidos, correo/dirección/teléfono y contraseña.
- [ ] Mantener RF1–RF5.
- [ ] Reemplazar RF6 y RF7: el registro público **no** solicita documento de validación ni datos de institución. Esos datos se capturan después, en la solicitud de cambio de tipo (7.1.6).
- [ ] Agregar RF8: indicador de avance `Paso X de 4`, validación por paso, botón Atrás y mensajes de error claros.
- [ ] Agregar RF9: la cuenta se crea como Lector general y el cambio a Becario o Institución educativa requiere solicitud y aprobación.

**Reemplazo sugerido para RF6 y RF7:**

> RF6: El registro público no solicita documento de validación ni datos de institución; la cuenta se crea como Lector general.  
> RF7: El Cliente puede solicitar posteriormente el cambio a Becario o Institución educativa desde Mi perfil, adjuntando los documentos de validación.

#### 7.1.4. Gestión de perfiles

- [ ] Renombrar a **Gestión del perfil personal** para no confundirlo con los perfiles de acceso.
- [ ] Actualizar RF6: el usuario no puede modificar su identificación, rol ni tipo de cliente. Sí puede modificar nombres, apellidos, correo, teléfono y dirección.
- [ ] Aclarar que el correo es editable, pero debe seguir siendo único.

#### 7.1.5. Administración de perfiles de acceso

- [ ] Aclarar que el Administrador crea cuentas de **Administrador y Bibliotecario**; las cuentas de Cliente se crean por registro público.
- [ ] Indicar que el Administrador puede cambiar el rol a Administrador, Bibliotecario o Cliente, y activar o desactivar cuentas.
- [ ] Mantener la restricción de que cada perfil accede solo a sus funciones.

#### 7.1.6. Administración de tipos de cliente

- [ ] Aclarar que el Bibliotecario puede asignar el tipo directamente desde la gestión de clientes y también revisar las solicitudes enviadas por los clientes.
- [ ] Actualizar RF5: la solicitud se envía desde Mi perfil y permite adjuntar **hasta 3 archivos PDF, JPG o PNG de 5 MB cada uno**.
- [ ] Agregar RF7: el Cliente puede cancelar una solicitud mientras esté pendiente.
- [ ] Agregar RF8: el Bibliotecario puede aprobar o rechazar; el rechazo exige una observación para el Cliente.
- [ ] Agregar RF9: los documentos adjuntos solo pueden descargarlos el Cliente propietario o el personal de biblioteca autenticado.
- [ ] Agregar RF10: al aprobar, se actualiza el tipo de cliente y se conserva el documento de validación.

**Texto sugerido para RF5:**

> RF5: Permitir que el Cliente solicite, desde Mi perfil, el cambio a Becario o Institución educativa adjuntando hasta tres documentos de validación en formato PDF, JPG o PNG, con un máximo de 5 MB por archivo.

### 2.9. Sección 7.2. Gestión de libros

#### 7.2.3. Edición de libros

- [ ] Cambiar RF3 `Actualizar la cantidad de ejemplares` por `Agregar o eliminar ejemplares del libro`, que es lo que permite la interfaz.

#### 7.2.4. Eliminación de libros y ejemplares

- [ ] Cambiar el título a **ELIMINACIÓN DE LIBROS Y EJEMPLARES**.
- [ ] Aclarar que la eliminación de un libro es **lógica** (`activo = false`) y que el libro deja de mostrarse en el catálogo.
- [ ] Aclarar que un ejemplar solo se puede eliminar físicamente si no tiene historial de préstamos.
- [ ] Actualizar la restricción: no se elimina un libro con préstamos activos **ni con solicitudes pendientes**.

#### 7.2.5. Consulta de disponibilidad

- [ ] Aclarar que la disponibilidad se calcula: ejemplares no perdidos y sin préstamo activo.
- [ ] Indicar que se actualiza después de aprobar, entregar, renovar, devolver o cancelar un préstamo.

### 2.10. Sección 7.3. Gestión de préstamos

#### 7.3.1. Solicitud y registro de préstamos

- [ ] Actualizar la descripción: el Cliente solicita desde el catálogo y el Bibliotecario también puede registrar una solicitud a nombre de un Cliente.
- [ ] Aclarar que la aprobación, entrega, renovación y devolución las realiza el Bibliotecario.
- [ ] Corregir RF7: en la solicitud se validan disponibilidad y máximo de libros simultáneos. El derecho a renovación se valida al renovar, no al crear la solicitud.
- [ ] Agregar RF9: el Cliente puede cancelar su propia solicitud; el Bibliotecario también puede cancelarla indicando el motivo.
- [ ] Agregar RF10: la cancelación libera los ejemplares reservados.

#### 7.3.2. Control de devoluciones

- [ ] Incluir explícitamente la condición **Perdido** en RF7, no solo en RF8.
- [ ] Aclarar que la disponibilidad aumenta solo si el ejemplar no está perdido.

#### 7.3.3. Consulta de préstamos

- [ ] Mantener que el Cliente solo ve sus propios préstamos.
- [ ] Aclarar que el Bibliotecario y el Administrador pueden consultar el listado general según sus permisos.

#### 7.3.4. Renovación

- [ ] Mantener que la renovación la realiza el Bibliotecario.
- [ ] Aclarar que el estado cambia a **Renovado** y que la fecha límite se extiende según la política del tipo de cliente.

#### Nueva sección 7.3.5. Cancelación

Agregar:

> Permite cancelar una solicitud o préstamo que aún no haya sido entregado. El Cliente puede cancelar sus propias solicitudes; el Bibliotecario puede cancelar cualquier solicitud pendiente indicando el motivo. Al cancelar, los ejemplares reservados vuelven a estar disponibles y el estado queda como Cancelado.

#### Nueva sección 7.3.6. Estados derivados

Agregar:

> Los estados **Por vencer** y **Vencido** no se almacenan en la base de datos. Se calculan al consultar el préstamo a partir de la fecha límite y del estado actual. Los estados persistidos son: Solicitado, Aprobado, Prestado, Renovado, Devuelto, Devuelto con retraso, Cancelado y Perdido.

### 2.11. Sección 7.4. Gestión de reportes

- [ ] Corregir la descripción: los reportes están disponibles para **Administrador y Bibliotecario**, no solo para el Bibliotecario.
- [ ] Corregir las acciones iniciadoras: `Inicio de sesión del Administrador o del Bibliotecario`.
- [ ] Aclarar que el Cliente no accede a reportes; consulta su historial en **Mis préstamos**.
- [ ] Detallar los tres reportes implementados: catálogo de libros, disponibilidad y préstamos.
- [ ] Indicar que los reportes permiten filtrar por fechas y que el Bibliotecario/Administrador ven información global.

### 2.12. Sección 8. Reglas de negocio

- [ ] **RN-02:** dejar explícito que el Administrador gestiona cuentas, perfiles y políticas; el Bibliotecario gestiona libros, ejemplares, tipos de cliente, solicitudes y préstamos.
- [ ] **RN-05:** incluir `perdido` en la lista de condiciones y aclarar que la disponibilidad solo aumenta si el ejemplar no está perdido.
- [ ] **RN-06:** agregar `ni con solicitudes pendientes`.
- [ ] **RN-07:** agregar el correo como dato único, además del ISBN y la identificación. Si se desea, agregar también el código de ejemplar y el nombre de categoría.
- [ ] **RN-08:** reemplazar `confirmación previa del Administrador` por `confirmación explícita en la interfaz del usuario que ejecuta la eliminación`. Si el requisito académico exige aprobación del Administrador, entonces debe implementarse; hoy no existe ese flujo.
- [ ] **RN-09:** reescribir la regla, que actualmente está cortada y se contradice. Propuesta:
  > El Administrador y el Bibliotecario pueden consultar los reportes operativos de libros, disponibilidad y préstamos. El Cliente solo puede consultar su propio historial de préstamos; no accede a los reportes globales.
- [ ] **RN-10:** mantener y aclarar que el Cliente puede editar nombres, apellidos, correo, teléfono y dirección; no puede editar identificación, rol ni tipo de cliente.
- [ ] **RN-11:** aclarar que AWS es el entorno previsto, pero la entrega actual se valida en local.
- [ ] **RN-12:** cambiar `documento de validación` por `documentos de validación` y agregar que el Cliente puede cancelar la solicitud mientras esté pendiente.

### 2.13. Sección 9. Interfaces externas

#### 9.1. Interfaces de usuario

- [ ] Agregar a las pantallas principales: **Usuarios**, **Clientes**, **Solicitudes de cambio de tipo**, **Políticas de préstamo**, **Mis préstamos**, **detalle de libro** y **perfil**.
- [ ] Corregir `menú de navegación superior`: la interfaz usa **barra superior + menú lateral (sidebar)**, adaptable a móvil.
- [ ] Agregar el registro en 4 pasos con indicador de progreso.
- [ ] Mantener los estándares de mensajes claros en español y confirmaciones antes de acciones destructivas.
- [ ] Aclarar que los listados tienen búsqueda, filtros y paginación.

#### 9.3. Interfaces de software

- [ ] Aclarar que la entrega actual usa MySQL local y Prisma; AWS queda como infraestructura prevista.
- [ ] Agregar el almacenamiento local de documentos en `backend/uploads/solicitudes/`.

#### 9.4. Interfaces de comunicación

- [ ] Cambiar `utilización de JSON` por `JSON para las operaciones normales y multipart/form-data para la carga de documentos`.
- [ ] Aclarar que el envío de correos por SMTP es opcional y **no está implementado** en esta entrega.
- [ ] Mantener HTTPS/TLS como requisito de producción.

### 2.14. Sección 10. Requerimientos no funcionales

- [ ] **RNF-01 y RNF-02:** indicar que no fueron medidos en esta entrega o agregar la evidencia de la prueba. No afirmar que se cumplen si no se midieron.
- [ ] **RNF-04:** aclarar qué navegadores se probaron realmente (Chrome/Chromium y Firefox en las pruebas de interfaz); Edge y Safari quedan pendientes.
- [ ] **RNF-06:** aclarar que el respaldo es manual con `mysqldump` y que no hay respaldo automático semanal implementado.
- [ ] Agregar **RNF-08 Carga de archivos:** máximo 3 documentos, 5 MB por archivo, formatos PDF/JPG/PNG, validación en frontend y backend, descarga autenticada.
- [ ] Agregar **RNF-09 Usabilidad:** mensajes claros, validación por paso, indicador de progreso, foco en el primer error y navegación hacia atrás en el registro.

### 2.15. Sección 11. Otros requerimientos

- [ ] Actualizar la lista de tablas: `Usuario`, `PoliticaPrestamo`, `Categoria`, `Libro`, `Ejemplar`, `SolicitudPrestamo`, `Prestamo`, `HistorialEstadoPrestamo`, `SolicitudTipoCliente` y `DocumentoSolicitudTipo`.
- [ ] Aclarar que los perfiles y los tipos de cliente son enums/columnas, no tablas independientes.
- [ ] Agregar que los documentos adjuntos se guardan en disco y su metadata en `DocumentoSolicitudTipo`.
- [ ] Aclarar que la documentación disponible es `README.md`, `CONTINUIDAD_PROYECTO.md`, el script SQL y este documento; los manuales formales de usuario y técnico quedan pendientes.
- [ ] Mantener la referencia a la Ley Orgánica de Protección de Datos Personales del Ecuador.

### 2.16. Sección 12. Glosario

- [ ] Actualizar **Administrador:** quitar `tipos de cliente`.
- [ ] Actualizar **Bibliotecario:** agregar gestión de tipos de cliente, documentos y solicitudes.
- [ ] Actualizar **Estado del préstamo:** aclarar que Por vencer y Vencido son derivados.
- [ ] Agregar **Documento de solicitud:** archivo PDF/JPG/PNG adjunto a una solicitud de cambio de tipo.
- [ ] Agregar **Solicitud de cambio de tipo:** solicitud del Cliente para pasar a Becario o Institución educativa.
- [ ] Agregar **Baja lógica:** desactivación de un libro sin borrar físicamente sus datos.
- [ ] Agregar **Perfil de acceso** y **Perfil personal** para diferenciar el rol del usuario de sus datos personales.

---

## 3. Contradicciones detectadas

| # | Ubicación | Lo que dice el documento | Problema / realidad | Corrección sugerida |
| :---: | :--- | :--- | :--- | :--- |
| 1 | 2.2 y sección 5 | El Administrador gestiona tipos de cliente. | El Administrador no tiene rutas para cambiar tipos de cliente; eso lo hace el Bibliotecario (7.1.6 y RN-02). | Quitar `tipos de cliente` del Administrador y asignarlo al Bibliotecario. |
| 2 | 2.3 | Asignación de roles de Administrador y Cliente. | Omite al Bibliotecario y contradice a RN-01, 7.1.5 y la sección 5. | Incluir los tres roles. |
| 3 | 7.1.1 RF6 y RF7 | El registro solicita documento de validación y datos de institución. | El registro público de 4 pasos solo pide cédula, nombres, correo/dirección/teléfono y contraseña; crea Lector general. | Mover esos datos a la solicitud de cambio de tipo (7.1.6). |
| 4 | 7.1.1 RF5 vs 7.1.5 | Asignación automática de perfil vs creación de cuentas del personal. | No es contradictorio si se aclara que el registro público crea Cliente y el Administrador crea personal. | Aclarar ambos casos. |
| 5 | 7.1.6 RF5 y RN-12 | `documento de validación` en singular. | La implementación permite hasta 3 archivos PDF/JPG/PNG de 5 MB. | Hablar de `documentos de validación` y indicar límites. |
| 6 | 7.2.4 | Título: eliminación de ejemplares. Contenido: eliminación de libros. | Título y contenido no coinciden; además la baja de libros es lógica. | Renombrar y aclarar baja lógica vs eliminación de ejemplar. |
| 7 | 7.2.3 RF3 | Actualizar la cantidad de ejemplares. | La interfaz agrega o elimina ejemplares; no edita un número directamente. | Cambiar la redacción. |
| 8 | 7.3.1 RF7 | Validar el derecho a renovación antes de procesar la solicitud. | La renovación se valida al renovar, no al crear la solicitud. | Separar validaciones de solicitud y de renovación. |
| 9 | 3.4 | La lista de estados no incluye Aprobado. | El estado Aprobado existe y se usa en el flujo. | Agregar 3.4.x Aprobado. |
| 10 | 2.2 vs 3.4 | Se listan Por vencer y Vencido como estados. | Se calculan al consultar; no se almacenan. | Aclarar que son estados derivados. |
| 11 | RN-04 | Remite a la sección 7.3.5. | Esa sección no existe. | Referenciar 3.4 y la nueva sección de estados derivados. |
| 12 | RN-05 | Condiciones: buen estado, dañado. | Omite perdido, aunque 7.3.2 RF7/RF8 lo incluyen. | Agregar perdido explícitamente. |
| 13 | RN-06 | No eliminar un libro con préstamos activos. | La implementación también bloquea solicitudes pendientes. | Agregar `ni con solicitudes pendientes`. |
| 14 | RN-08 | Toda eliminación requiere confirmación previa del Administrador. | La implementación pide confirmación en la interfaz al Bibliotecario; no hay aprobación del Administrador. | Cambiar a confirmación en la interfaz o implementar el flujo del Administrador. |
| 15 | RN-09 | Regla cortada y con roles mezclados. | No queda claro quién accede a reportes. | Reescribir: Administrador y Bibliotecario ven reportes; Cliente solo su historial. |
| 16 | 7.4.1 | Descripción: Bibliotecario. Acciones: Administrador. | Contradicción interna. | Decir Administrador y Bibliotecario. |
| 17 | 7.1.4 vs 7.1.5 | `Gestión de perfiles` vs `Administración de perfiles de acceso`. | El término perfil se usa para dos cosas distintas. | Renombrar 7.1.4 a `Gestión del perfil personal`. |
| 18 | 9.1 | Menú de navegación superior. | La interfaz usa sidebar + barra superior. | Actualizar la guía de estilo. |
| 19 | 9.4 | Formato de mensajería JSON. | Las solicitudes con documentos usan multipart/form-data. | Agregar multipart/form-data. |
| 20 | 6, 9.3 y RN-11 | El sistema está alojado en AWS. | La entrega actual es local; AWS no está desplegado. | Aclarar `previsto para AWS; entrega local actual`. |
| 21 | Sección 11 | Tablas de perfiles y tipos de cliente. | Son enums/columnas; no hay tablas independientes. Además falta DocumentoSolicitudTipo. | Actualizar la lista de tablas. |
| 22 | 7.1.5 RF2 vs 2.3 | Crear cuentas de Administrador y Bibliotecario vs roles Administrador y Cliente. | Contradicción interna sobre los roles. | Unificar los tres roles. |

---

## 4. Requisitos que faltan y deben agregarse

- [ ] Registro público en 4 pasos con indicador de avance y validación por paso.
- [ ] Carga de hasta 3 documentos PDF/JPG/PNG de 5 MB en la solicitud de cambio de tipo.
- [ ] Descarga autenticada de documentos: solo el Cliente propietario o el personal de biblioteca.
- [ ] Cancelación de solicitudes de cambio de tipo por el Cliente mientras estén pendientes.
- [ ] Cancelación de préstamos por el Cliente o el Bibliotecario, con motivo y liberación de ejemplares.
- [ ] Estados derivados Por vencer y Vencido.
- [ ] Baja lógica de libros y eliminación controlada de ejemplares.
- [ ] Catálogo inicial de ejemplo cargado por el seed cuando la tabla Libro está vacía.
- [ ] Reportes de catálogo, disponibilidad y préstamos, con filtros por fecha.
- [ ] Mensajes de confirmación antes de eliminaciones y cancelaciones.
- [ ] Validación de archivos en frontend y backend.
- [ ] Manejo de errores de tamaño, formato y cantidad de archivos.

---

## 5. Decisiones que debes tomar antes de consolidar

1. **AWS vs local:** definir si el documento principal describe la entrega local o un despliegue AWS. Si es local, cambiar las afirmaciones de AWS por `previsto para AWS`.
2. **RN-08:** decidir si la eliminación requiere aprobación del Administrador o solo confirmación en la interfaz. Hoy es lo segundo.
3. **Tipos de cliente:** confirmar que el Bibliotecario es el único que los gestiona y que el Administrador no interviene.
4. **Documento obligatorio:** la interfaz exige al menos un archivo, pero la API acepta solo la descripción por compatibilidad. Definir si el archivo es obligatorio también en la API.
5. **SMTP:** confirmar que el envío de correos queda fuera de esta entrega o implementarlo.
6. **RNF medidos:** decidir si se agregan evidencias de rendimiento, disponibilidad, navegadores y respaldos, o si se declaran como pendientes.
7. **Manuales:** confirmar si se entregarán manual de usuario y manual técnico formales o si `README.md` y `CONTINUIDAD_PROYECTO.md` son suficientes para esta entrega.
8. **Catálogo de ejemplo:** confirmar si los 15 libros del seed deben mantenerse en la entrega o eliminarse antes de la demostración.

---

## 6. Checklist final para el documento principal

- [ ] Portada y fecha actualizadas.
- [ ] Historial de versiones con la versión 1.4.
- [ ] Numeración y tabla de contenido corregidas.
- [ ] Sección 2.2 con roles corregidos.
- [ ] Sección 2.3 con los tres roles y el módulo de solicitudes.
- [ ] Sección 4 con solicitudes, cancelación y estados derivados.
- [ ] Sección 5 con responsabilidades correctas.
- [ ] Sección 6 con entorno local/AWS aclarado.
- [ ] Sección 7.1 con registro en 4 pasos y carga de documentos.
- [ ] Sección 7.2 con baja lógica y ejemplares.
- [ ] Sección 7.3 con cancelación, renovación y estados derivados.
- [ ] Sección 7.4 con reportes para Administrador y Bibliotecario.
- [ ] Sección 8 con RN-02, RN-05, RN-06, RN-08, RN-09 y RN-12 corregidas.
- [ ] Sección 9 con pantallas, sidebar y multipart/form-data.
- [ ] Sección 10 con RNF medidos o marcados como pendientes.
- [ ] Sección 11 con la lista real de tablas.
- [ ] Sección 12 con el glosario actualizado.
- [ ] Revisión final de contradicciones internas.

---

## 7. Evidencia usada para esta revisión

- `Documento_de_requerimientos_G03_Biblioteca_Virtual.md`
- `README.md`
- `CONTINUIDAD_PROYECTO.md`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `backend/src/modules/usuarios/usuarios.routes.js`
- `backend/src/modules/libros/libros.routes.js`
- `backend/src/modules/prestamos/prestamos.routes.js`
- `backend/src/modules/solicitudes-tipo/solicitudes-tipo.routes.js`
- `backend/src/modules/reportes/reportes.routes.js`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/components/layout/AppLayout.jsx`
- `frontend/src/pages/RegistroPage.jsx`
- `frontend/src/components/perfil/SolicitudTipoDialog.jsx`
- `frontend/src/components/clientes/SolicitudRevisionDialog.jsx`
- Pruebas de integración: 19/19 aprobadas.
- Compilación del frontend: correcta.

---

## 8. Observación importante sobre el archivo actual

El archivo `Documento_de_requerimientos_G03_Biblioteca_Virtual.md` parece una exportación de Google Docs: casi todas las líneas comienzan con `# `. Si se sube así al documento principal, el formato se verá como una sucesión de encabezados y las tablas perderán estructura. Antes de consolidarlo conviene:

1. Eliminar los `# ` innecesarios.
2. Dejar solo los encabezados reales (`#`, `##`, `###`).
3. Revisar que las tablas conserven sus filas.
4. Regenerar la tabla de contenido.
5. Verificar que no queden referencias a secciones inexistentes.
