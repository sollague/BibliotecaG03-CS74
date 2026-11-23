# Documento de requerimientos de software

**SISTEMA DE ADMINISTRACIÓN PARA LA BIBLIOTECA VIRTUAL G03**

**Fecha:** 23/11/2026

---

## Tabla de contenido

1. Propósito
2. Alcance del producto / Software
3. Referencias
4. Funcionalidades del producto
5. Clases y características de usuarios
6. Entorno operativo
7. Requerimientos funcionales
8. Reglas de negocio
9. Requerimientos de interfaces externas
10. Requerimientos no funcionales
11. Otros requerimientos
12. Glosario

---

## Historial de Versiones

| **Fecha** | **Versión** | **Autor** | **Organización** | **Descripción** |
| :---: | :---: | :---: | :---: | :--- |
| 10/11/2026 | 1.1 | DREAM TEAM | DREAM TEAM | Borrador |
| 16/11/2026 | 1.2 | ANDRES OLLAGUE | DREAM TEAM | Se aplicaron las correcciones dadas por la Ing. Tania Peralta |
| 19/11/2026 | 1.3 | DREAM TEAM | DREAM TEAM | Autoservicio del cliente: edición de datos personales y solicitud de cambio de tipo de cliente. Corrección de RN-02 y RN-10. Mejoras de UX en registro, inicio y catálogo. |
| 23/11/2026 | 1.4 | DREAM TEAM | DREAM TEAM | Registro guiado en 4 pasos, carga de documentos en solicitudes de cambio de tipo, catálogo inicial de ejemplo, corrección de roles y aclaración de estados derivados. Se refuerza que el sistema no incluye componente económico. |
| 23/11/2026 | 1.5 | DREAM TEAM | DREAM TEAM | Se agrega el tipo de cliente Estudiante, su política de préstamo inicial y su flujo de solicitud de cambio. |

## Información del Proyecto

| Empresa / Organización | DREAM TEAM |
| --- | --- |
| Proyecto | SISTEMA DE ADMINISTRACIÓN PARA LA BIBLIOTECA VIRTUAL UG |
| Fecha de preparación | 10/11/2026 |
| Cliente | ING. TANIA PERALTA |
| Patrocinador principal |  |
| Gerente / Líder de Proyecto | JULIAN GARZON |
| Gerente / Líder de Análisis de negocio y requerimientos | ANTHONY HUACON |

## Aprobaciones

| **Nombre y Apellido** | **Cargo** | **Departamento u Organización** | **Fecha** | **Firma** |
| :---: | :---: | :---: | :---: | :---: |
| RECTOR | GERENTE | UNIVERSIDAD DE GUAYAQUIL | 11/11/2026 |  |
| JULIAN GARZON | GERENTE DE PROYECTO | DREAM TEAM | 11/11/2026 |  |
| ING. TANIA PERALTA GUARACA, MSC. | AUDITOR EXTERNO | UG | 11/11/2026 | <br> |

---

## 1. Propósito

La empresa Dream Team, dedicada al desarrollo de soluciones informáticas, desea implementar un sistema web que permita gestionar de manera eficiente los procesos de una biblioteca. Por ello, se propone crear una solución basada en el sistema de gestión de la Biblioteca Virtual, que permitirá mejorar la administración y organización de los libros, el control de los préstamos y devoluciones, la gestión de usuarios y la generación de reportes, facilitando el acceso a la información y reduciendo los procesos manuales.

El sistema se limita a la **solicitud y gestión de préstamos bibliográficos**. No administra recursos económicos, pagos, multas, sanciones ni ningún tipo de transacción monetaria.

Adicionalmente, el sistema deberá contar con diferentes componentes o módulos que permitan organizar sus funcionalidades y facilitar su utilización por parte de los usuarios.

El sistema Biblioteca deberá contener los siguientes componentes:

- **PÁGINA PRINCIPAL:** Interfaz inicial del sistema que permitirá acceder a las diferentes funcionalidades.
- **USUARIOS:** Registro de usuarios, inicio y cierre de sesión, gestión de perfiles de acceso y administración de cuentas, con roles de Administrador, Bibliotecario y Cliente. Los clientes podrán clasificarse como Lector general, Estudiante, Becario o Institución educativa.
- **LIBROS:** Administración del catálogo bibliográfico, permitiendo registrar, consultar, editar y eliminar libros.
- **PRÉSTAMOS:** Gestión de solicitudes, préstamos y devoluciones de libros, incluyendo el seguimiento de su estado.
- **REPORTES:** Visualización y generación de reportes relacionados con la información de los libros y los préstamos.
- **PERFIL:** Consulta y actualización de la información personal de los usuarios, incluida la solicitud de cambio de tipo de cliente.

---

## 2. Alcance del producto / Software

### 2.1. Objetivo general

Desarrollar un sistema web de administración para la Biblioteca Virtual G03 que gestione el catálogo bibliográfico, los usuarios según su perfil (Administrador, Bibliotecario y Cliente) y su tipo de cliente (Lector general, Estudiante, Becario e Institución educativa), las solicitudes y préstamos con su ciclo de estados y los reportes, utilizando React para el desarrollo de interfaces, Node.js con Express.js para el procesamiento del servidor y MySQL como sistema de gestión de base de datos. La entrega actual se ejecuta en entorno local y queda prevista para su despliegue en infraestructura de Amazon Web Services (AWS).

### 2.2. Beneficios del sistema

El sistema Biblioteca G03, desarrollado por el equipo Dream Team, es una aplicación web con tres perfiles de acceso.

- El **Administrador** gestiona las cuentas del personal, los perfiles de acceso, la activación y desactivación de cuentas y las políticas de préstamo. No registra libros ni préstamos y no gestiona los tipos de cliente.
- El **Bibliotecario** registra, consulta, edita y da de baja libros y ejemplares (título, autor, editorial, categoría, año de publicación, ISBN y cantidad de ejemplares), gestiona los tipos de cliente, revisa las solicitudes de cambio de tipo con sus documentos adjuntos, aprueba solicitudes y registra la entrega, renovación y devolución de préstamos, incluida la condición del ejemplar (buen estado, dañado o perdido).
- El **Cliente**, que puede ser Lector general, Estudiante, Becario o Institución educativa, consulta el catálogo por título o autor, verifica la disponibilidad de ejemplares, solicita préstamos, consulta sus propios préstamos, actualiza sus datos personales y puede solicitar el cambio de tipo de cliente adjuntando los documentos de validación.

Cada tipo de cliente tiene sus propias políticas de préstamo (máximo de libros simultáneos, plazo, renovaciones permitidas y documentos de validación requeridos) y las instituciones educativas pueden solicitar varios libros en una misma solicitud por lote. Cada préstamo avanza por los estados Solicitado, Aprobado, Prestado, Renovado, Devuelto, Devuelto con retraso, Cancelado o Perdido, y el sistema actualiza automáticamente la cantidad de ejemplares disponibles. Los estados **Por vencer** y **Vencido** se calculan al consultar el préstamo y no se almacenan en la base de datos.

El sistema no permitirá aprobar un préstamo cuando el libro no tenga ejemplares disponibles o cuando se supere el máximo de libros del tipo de cliente, ni repetir el ISBN de un libro, el correo de un usuario o la identificación de un usuario. Estas funciones reemplazan el registro manual de préstamos y devoluciones por registros digitales centralizados.

> **Alcance económico:** el sistema es meramente de solicitud y gestión de préstamos. Quedan fuera del alcance el cobro de multas y sanciones, los pagos, las tarifas, la facturación, la compra o venta de libros y cualquier funcionalidad económica no descrita en este documento.

El sistema está destinado exclusivamente a la administración del catálogo bibliográfico, el control de ejemplares y la gestión de los procesos de solicitud, préstamo, renovación y devolución de libros. No contempla módulos ni funcionalidades relacionadas con la compra, adquisición, venta, facturación, cobro o comercialización de libros. El registro de libros y ejemplares tiene como finalidad mantener actualizado el inventario bibliográfico disponible para los usuarios y controlar su circulación mediante los préstamos.

### 2.3. Alcance del proyecto

Para este proyecto, el alcance del sistema Biblioteca G03 comprenderá los siguientes módulos y funcionalidades:

- **USUARIOS:** Registro público, inicio y cierre de sesión, administración de perfiles de acceso y asignación de roles de **Administrador, Bibliotecario y Cliente**.
- **LIBROS:** Registro, consulta, edición y baja lógica de libros, incluyendo título, autor, editorial, categoría, año, ISBN y cantidad de ejemplares. La disponibilidad se calcula a partir de los ejemplares no perdidos y sin préstamo activo.
- **PRÉSTAMOS:** Registro y seguimiento de solicitudes y préstamos de libros, control de devoluciones, renovaciones y cancelaciones.
- **REPORTES:** Generación y visualización de reportes de catálogo, disponibilidad y préstamos.
- **PERFIL:** Consulta y actualización de los datos personales de los usuarios.
- **SOLICITUDES DE CAMBIO DE TIPO DE CLIENTE:** Presentación por parte del Cliente, carga de documentos de validación, cancelación mientras esté pendiente, revisión, aprobación o rechazo por el Bibliotecario.
- **MIS PRÉSTAMOS:** Consulta del historial personal de préstamos por parte del Cliente.

El sistema estará orientado a facilitar las actividades administrativas de la biblioteca y mejorar la experiencia de los lectores mediante una plataforma web centralizada.

El módulo de gestión de préstamos estará destinado exclusivamente al control de solicitudes, aprobaciones, entregas, renovaciones, devoluciones, cancelaciones y seguimiento de los estados de los préstamos. No incluirá operaciones de compra, adquisición o venta de libros, ni el cálculo o cobro de multas, sanciones, tarifas o pagos.

### 2.4. Exclusión del componente económico

> **Importante:** El sistema **no gestiona la parte económica** de la biblioteca. No registra, calcula ni cobra multas, sanciones, recargos, tarifas, depósitos, pagos, facturas ni reembolsos. Tampoco administra presupuestos, compras, adquisiciones o ventas de material bibliográfico. Su único propósito es la **solicitud y gestión de préstamos** de libros.

Las consecuencias de un retraso, daño o pérdida se limitan al registro del estado del préstamo y de la condición del ejemplar. Cualquier cobro o sanción económica se realiza fuera del sistema y no forma parte de esta entrega.

---

## 3. Referencias

Documentos que complementan la especificación de requerimientos del sistema Biblioteca G03:

- Procesos de préstamo y devolución de la Biblioteca Virtual UG, Universidad de Guayaquil. Referencia de los procesos que el sistema automatiza.
- `README.md`: instalación, configuración, seed y solución de problemas.
- `CONTINUIDAD_PROYECTO.md`: estado funcional, decisiones y continuidad del proyecto.
- `database/biblioteca_g03.sql`: script de creación de la base de datos y control de migraciones.

---

## 4. Funcionalidades del producto

### 4.1. USUARIOS

- 4.1.1. Registro de usuarios
- 4.1.2. Inicio de sesión
- 4.1.3. Cierre de sesión
- 4.1.4. Gestión del perfil personal
- 4.1.5. Administración de perfiles de acceso
  - 4.1.5.1. Administrador
  - 4.1.5.2. Bibliotecario
  - 4.1.5.3. Cliente
- 4.1.6. Administración de tipos de cliente
  - 4.1.6.1. Lector general
  - 4.1.6.2. Estudiante
  - 4.1.6.3. Becario
  - 4.1.6.4. Institución educativa
- 4.1.7. Solicitudes de cambio de tipo de cliente

### 4.2. GESTIÓN DE LIBROS

- 4.2.1. Registro de libros
- 4.2.2. Consulta y listado de libros
- 4.2.3. Edición de información de libros
- 4.2.4. Eliminación de libros y ejemplares
- 4.2.5. Consulta de disponibilidad

### 4.3. GESTIÓN DE PRÉSTAMOS

- 4.3.1. Solicitud y registro de préstamos
- 4.3.2. Consulta de préstamos
- 4.3.3. Registro de devoluciones
- 4.3.4. Renovación
- 4.3.5. Cancelación
- 4.3.6. Control del estado del préstamo
  - 4.3.6.1. Solicitado
  - 4.3.6.2. Aprobado
  - 4.3.6.3. Prestado
  - 4.3.6.4. Renovado
  - 4.3.6.5. Devuelto
  - 4.3.6.6. Devuelto con retraso
  - 4.3.6.7. Cancelado
  - 4.3.6.8. Perdido
  - 4.3.6.9. Por vencer (derivado)
  - 4.3.6.10. Vencido (derivado)

### 4.4. GESTIÓN DE REPORTES

- 4.4.1. Visualización de reportes
- 4.4.2. Consulta de información de préstamos y libros

### 4.5. GESTIÓN DE PERFIL

- 4.5.1. Consulta de datos personales
- 4.5.2. Actualización de información personal
- 4.5.3. Solicitud de cambio de tipo desde el perfil

---

## 5. Clases y características de usuarios

En esta sección se identifican los diferentes tipos de usuarios que utilizarán el sistema Biblioteca G03, considerando sus funciones, responsabilidades y permisos dentro de la plataforma. Cada usuario tendrá acceso a determinadas funcionalidades dependiendo de su rol.

| **USUARIO** | **DESCRIPCIÓN DEL USUARIO / ¿QUÉ HACE EN EL SISTEMA?** |
| :---: | :--- |
| **ADMINISTRADOR** | Gestiona el sistema, no la operación diaria de la biblioteca. Crea y administra cuentas del personal, perfiles de acceso, activación de cuentas y políticas de préstamo. No registra libros, préstamos ni devoluciones y no gestiona los tipos de cliente. |
| **BIBLIOTECARIO** | Perfil operativo, independiente del Administrador. Registra, edita y da de baja libros y ejemplares; gestiona los tipos de cliente, registra los documentos de validación y revisa las solicitudes de cambio con sus archivos adjuntos; aprueba solicitudes y registra la entrega, renovación, devolución y cancelación de préstamos, incluida la condición del ejemplar; y consulta préstamos y disponibilidad. |
| **CLIENTE: LECTOR GENERAL** | Consulta el catálogo y la disponibilidad, solicita préstamos, consulta sus propios préstamos, gestiona su perfil y puede solicitar el cambio de tipo adjuntando documentos, con las políticas estándar de préstamo. |
| **CLIENTE: ESTUDIANTE** | Mismas funciones que el Lector general, con políticas de préstamo propias y documento de validación de estudiante. |
| **CLIENTE: BECARIO** | Mismas funciones que el Lector general, con políticas de préstamo propias. |
| **CLIENTE: INSTITUCIÓN EDUCATIVA** | Representada por un responsable registrado. Mismas funciones que el Lector general y, además, puede realizar solicitudes por lote de varios libros, con políticas de préstamo propias. |

El Cliente no puede modificar por sí mismo su identificación, su rol ni su tipo de cliente. El tipo de cliente solo cambia cuando el Bibliotecario aprueba una solicitud de cambio o lo asigna directamente desde la gestión de clientes.

---

## 6. Entorno operativo

El sistema Biblioteca G03 es una aplicación web con arquitectura cliente-servidor. La entrega actual se ejecuta en **entorno local** y queda prevista para su despliegue futuro en la infraestructura de Amazon Web Services (AWS), accesible mediante internet. Sus características son:

- **Plataforma de alojamiento:** entorno local para la entrega actual; Amazon Web Services (AWS) como infraestructura prevista para producción.
- **Sistema operativo del servidor:** Linux en la entrega local y en el despliegue previsto, preferentemente Amazon Linux según la configuración del entorno.
- **Frontend:** React.js para el desarrollo de interfaces de usuario y Material UI (MUI) para la implementación de componentes visuales adaptables.
- **Backend:** Node.js 20+ como entorno de ejecución y Express.js como framework para gestionar la lógica del servidor y los servicios API REST.
- **Base de datos:** MySQL 8.0, utilizando Prisma ORM para la comunicación y gestión de datos.
- **Almacenamiento de documentos:** los archivos adjuntos a las solicitudes de cambio de tipo se almacenan localmente en `backend/uploads/solicitudes/` y su metadata en la tabla `DocumentoSolicitudTipo`.
- **Equipos de los usuarios:** computadores, tablets o teléfonos móviles con navegadores actualizados (Google Chrome, Mozilla Firefox, Microsoft Edge o Safari) y conexión a internet.
- **Entorno de desarrollo y pruebas:** Node.js, npm y MySQL en entorno local para ejecutar y probar la aplicación antes de un despliegue en AWS. No se utiliza Docker.

---

## 7. Requerimientos funcionales

### 7.1. USUARIOS

#### 7.1.1. REGISTRO DE USUARIOS

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado donde las personas pueden crear una cuenta en el sistema. El registro público crea siempre una cuenta **Cliente / Lector general** mediante un flujo guiado de cuatro pasos: cédula, nombres y apellidos, correo/dirección/teléfono y contraseña. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso a la página principal. Seleccionar la opción de registro. Completar los cuatro pasos del formulario. |
| REQUERIMIENTOS | RF1: Registro de nuevos usuarios.<br>RF2: Ingreso de datos personales.<br>RF3: Validación de los datos de cada paso antes de continuar.<br>RF4: Almacenamiento de la información del usuario.<br>RF5: Asignación automática del perfil Cliente y del tipo Lector general.<br>RF6: El registro público no solicita documento de validación ni datos de institución educativa.<br>RF7: El Cliente puede solicitar posteriormente el cambio a Estudiante, Becario o Institución educativa desde Mi perfil, adjuntando los documentos de validación.<br>RF8: Indicador de avance «Paso X de 4», botón Atrás, foco en el primer error y mensajes claros en español.<br>RF9: La cuenta se crea como Lector general; el cambio de tipo requiere solicitud y aprobación del Bibliotecario. |

#### 7.1.2. INICIO DE SESIÓN

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado que permite a los usuarios acceder al sistema mediante sus credenciales registradas. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso a la página principal. Ingresar usuario y contraseña. Seleccionar la opción de iniciar sesión. |
| REQUERIMIENTOS | RF1: Ingreso de credenciales.<br>RF2: Validación de usuario y contraseña.<br>RF3: Acceso según el perfil asignado.<br>RF4: Mostrar mensaje cuando las credenciales sean incorrectas.<br>RF5: Crear sesión del usuario autenticado. |

#### 7.1.3. CIERRE DE SESIÓN

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Permite al usuario finalizar su sesión de manera segura y salir de la plataforma. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Usuario autenticado. Seleccionar la opción de cerrar sesión. |
| REQUERIMIENTOS | RF1: Cerrar la sesión activa.<br>RF2: Finalizar el acceso a las funcionalidades privadas.<br>RF3: Redirigir al usuario al inicio de sesión. |

#### 7.1.4. GESTIÓN DEL PERFIL PERSONAL

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado donde los usuarios pueden consultar y actualizar su información personal dentro del sistema. No debe confundirse con los perfiles de acceso (roles). |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Ingreso del usuario al sistema. Seleccionar la opción de perfil. Modificar los datos personales. |
| REQUERIMIENTOS | RF1: Visualizar información personal.<br>RF2: Consultar los datos registrados.<br>RF3: Editar nombres, apellidos, correo electrónico, teléfono y dirección.<br>RF4: Guardar los cambios realizados.<br>RF5: Mantener el correo electrónico como dato único.<br>RF6: Mantener la identificación, el rol y el tipo de cliente como datos no editables por el propio usuario. |

#### 7.1.5. ADMINISTRACIÓN DE PERFILES DE ACCESO

| **CAMPO** | **DESCRIPCIÓN** |
| :--- | :--- |
| DESCRIPCIÓN | Permite al Administrador crear cuentas del personal y asignar los perfiles de acceso. Las cuentas de Cliente se crean mediante el registro público. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Inicio de sesión del Administrador. Ingreso al módulo de usuarios. Seleccionar una cuenta. |
| REQUERIMIENTOS | RF1: Listar las cuentas de usuario registradas.<br>RF2: Crear cuentas del personal (Administrador y Bibliotecario).<br>RF3: Asignar o cambiar el perfil de acceso entre Administrador, Bibliotecario y Cliente.<br>RF4: Activar o desactivar cuentas.<br>RF5: Restringir cada perfil únicamente a sus funciones.<br>RF6: Las cuentas de Cliente se crean por registro público y no por el Administrador. |

#### 7.1.6. ADMINISTRACIÓN DE TIPOS DE CLIENTE

| **CAMPO** | **DESCRIPCIÓN** |
| :--- | :--- |
| DESCRIPCIÓN | Permite al Bibliotecario gestionar los tipos de cliente (Lector general, Estudiante, Becario e Institución educativa), asignarlos a las cuentas de Cliente y revisar las solicitudes de cambio presentadas por los propios clientes. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Inicio de sesión del Bibliotecario. Ingreso al módulo de clientes o de solicitudes. Seleccionar la cuenta de un Cliente o una solicitud pendiente. |
| REQUERIMIENTOS | RF1: Consultar los tipos de cliente existentes.<br>RF2: Asignar o cambiar el tipo de cliente de una cuenta.<br>RF3: Registrar los documentos de validación del cliente.<br>RF4: Registrar y consultar al responsable de una Institución educativa.<br>RF5: Permitir que el Cliente solicite, desde Mi perfil, el cambio a Estudiante, Becario o Institución educativa adjuntando hasta tres documentos de validación en formato PDF, JPG o PNG, con un máximo de 5 MB por archivo.<br>RF6: Revisar la solicitud, aprobarla actualizando el tipo y los datos, o rechazarla registrando una observación para el Cliente.<br>RF7: Permitir que el Cliente cancele su solicitud mientras esté pendiente.<br>RF8: Exigir una observación cuando el Bibliotecario rechaza una solicitud.<br>RF9: Permitir la descarga de los documentos adjuntos únicamente al Cliente propietario o al personal de biblioteca autenticado.<br>RF10: Al aprobar la solicitud, actualizar el tipo de cliente y conservar los documentos de validación. |

### 7.2. GESTIÓN DE LIBROS

#### 7.2.1. REGISTRO DE LIBROS

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado donde el Bibliotecario puede registrar nuevos libros en el catálogo de la biblioteca, ingresando sus datos bibliográficos y cantidad de ejemplares. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso del Bibliotecario. Acceder al módulo de libros. Seleccionar la opción de registrar libro. |
| REQUERIMIENTOS | RF1: Ingresar el título del libro.<br>RF2: Registrar el autor.<br>RF3: Registrar la editorial.<br>RF4: Seleccionar la categoría.<br>RF5: Registrar el año de publicación.<br>RF6: Registrar el ISBN.<br>RF7: Ingresar la cantidad de ejemplares.<br>RF8: Guardar la información del libro. |

#### 7.2.2. CONSULTA Y LISTADO DE LIBROS

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado que permite visualizar los libros registrados en el sistema y consultar su información bibliográfica. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso al módulo de libros. Seleccionar la opción de consultar libros. |
| REQUERIMIENTOS | RF1: Mostrar el listado de libros registrados.<br>RF2: Visualizar los datos bibliográficos.<br>RF3: Consultar libros por título.<br>RF4: Consultar libros por autor.<br>RF5: Mostrar la cantidad de ejemplares disponibles.<br>RF6: Permitir filtrar por categoría y paginar los resultados. |

#### 7.2.3. EDICIÓN DE LIBROS

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Permite al Bibliotecario modificar la información de los libros registrados en el sistema cuando sea necesario actualizar sus datos. |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Ingreso del Bibliotecario al módulo de libros. Seleccionar un libro registrado. Elegir la opción de editar. |
| REQUERIMIENTOS | RF1: Seleccionar un libro existente.<br>RF2: Modificar los datos bibliográficos.<br>RF3: Agregar o eliminar ejemplares del libro.<br>RF4: Guardar los cambios realizados. |

#### 7.2.4. ELIMINACIÓN DE LIBROS Y EJEMPLARES

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Permite al Bibliotecario dar de baja libros del catálogo y eliminar ejemplares cuando sea necesario. La baja de un libro es **lógica**: se marca como inactivo y deja de mostrarse en el catálogo, sin borrar físicamente sus datos. |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Ingreso al módulo de libros. Seleccionar el libro o ejemplar que se desea eliminar. Confirmar la eliminación en la interfaz. |
| REQUERIMIENTOS | RF1: Seleccionar un libro o ejemplar registrado.<br>RF2: Solicitar confirmación explícita antes de eliminar.<br>RF3: Dar de baja lógica al libro (activo = false) y conservar su historial.<br>RF4: Permitir la eliminación física de un ejemplar solo cuando no tenga historial de préstamos.<br>RF5: Actualizar el listado de libros y ejemplares.<br>RF6: Bloquear la baja de un libro con préstamos activos o con solicitudes pendientes. |

#### 7.2.5. CONSULTA DE DISPONIBILIDAD

| **CAMPO** | **DESCRIPCIÓN** |
| :--- | :--- |
| DESCRIPCIÓN | Permite a cualquier usuario autenticado conocer si un libro tiene ejemplares disponibles para préstamo. La disponibilidad se calcula como los ejemplares no perdidos y sin préstamo activo. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso al módulo de libros o al catálogo. Seleccionar un libro del listado. |
| REQUERIMIENTOS | RF1: Mostrar la cantidad de ejemplares disponibles de cada libro.<br>RF2: Indicar «No disponible» cuando no existan ejemplares disponibles.<br>RF3: Actualizar la disponibilidad después de aprobar, entregar, renovar, devolver o cancelar un préstamo. |

### 7.3. GESTIÓN DE PRÉSTAMOS

#### 7.3.1. SOLICITUD Y REGISTRO DE PRÉSTAMOS

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado donde el Cliente solicita préstamos desde el catálogo y donde el Bibliotecario puede registrar una solicitud a nombre de un Cliente. La solicitud relaciona al usuario con el libro o lote solicitado y no genera ningún cargo económico. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Inicio de sesión del Cliente (solicitud) o del Bibliotecario (registro). Ingreso al catálogo o al módulo de préstamos. Seleccionar el cliente y el libro solicitado. |
| REQUERIMIENTOS | RF1: Seleccionar el cliente que solicita el préstamo.<br>RF2: Seleccionar el libro solicitado.<br>RF3: Verificar la disponibilidad del libro.<br>RF4: Verificar que no se supere el máximo de libros simultáneos del tipo de cliente.<br>RF5: Registrar la solicitud con el estado «Solicitado».<br>RF6: Permitir que una Institución educativa solicite varios libros en una misma solicitud por lote.<br>RF7: Validar las políticas del tipo de cliente aplicables a la solicitud: plazo máximo y número límite de libros simultáneos. El derecho a renovación se valida al renovar, no al crear la solicitud.<br>RF8: Bloquear la generación del préstamo y mostrar un mensaje de advertencia si el usuario excede los límites de su tipo de cliente.<br>RF9: Permitir que el Cliente cancele su propia solicitud y que el Bibliotecario cancele cualquier solicitud pendiente indicando el motivo.<br>RF10: Liberar los ejemplares reservados al cancelar una solicitud. |

#### 7.3.2. CONTROL DE DEVOLUCIONES

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Permite al Bibliotecario registrar la devolución de los libros prestados y actualizar su disponibilidad dentro del catálogo. No se calculan ni cobran multas. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso al módulo de préstamos. Consultar los préstamos registrados. Seleccionar el préstamo que será devuelto. Confirmar la devolución. |
| REQUERIMIENTOS | RF1: Consultar los préstamos activos.<br>RF2: Identificar el libro que será devuelto.<br>RF3: Registrar la devolución.<br>RF4: Actualizar el estado del préstamo a «Devuelto» o «Devuelto con retraso» según la fecha límite.<br>RF5: Aumentar la cantidad disponible solo si el ejemplar no está perdido.<br>RF6: Registrar la condición del ejemplar: buen estado, dañado o perdido.<br>RF7: Registrar el estado «Perdido» cuando el ejemplar no sea recuperado.<br>RF8: No calcular, registrar ni cobrar multas, sanciones o pagos por retraso, daño o pérdida. |

#### 7.3.3. CONSULTA DE PRÉSTAMOS

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Permite visualizar los préstamos registrados en el sistema y consultar su información y estado actual. |
| PRIORIDAD | Alta |
| ACCIONES INICIADORAS | Ingreso al módulo de préstamos. Seleccionar la opción de consultar préstamos. |
| REQUERIMIENTOS | RF1: Mostrar el listado de préstamos.<br>RF2: Visualizar el usuario asociado al préstamo.<br>RF3: Visualizar el libro prestado.<br>RF4: Consultar el estado del préstamo.<br>RF5: Diferenciar los préstamos activos y los devueltos.<br>RF6: Permitir al Cliente consultar únicamente sus propios préstamos.<br>RF7: Permitir al Bibliotecario y al Administrador consultar el listado general según sus permisos. |

#### 7.3.4. RENOVACIÓN

| **CAMPO** | **DESCRIPCIÓN** |
| :--- | :--- |
| DESCRIPCIÓN | Permite al Bibliotecario extender el plazo de un préstamo activo dentro de lo que permite la política del tipo de cliente. |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Inicio de sesión del Bibliotecario. Ingreso al módulo de préstamos. Seleccionar un préstamo activo. |
| REQUERIMIENTOS | RF1: Seleccionar un préstamo activo.<br>RF2: Verificar las renovaciones permitidas del tipo de cliente.<br>RF3: Extender la fecha límite y actualizar el estado a «Renovado».<br>RF4: Rechazar la renovación cuando se haya agotado el número permitido. |

#### 7.3.5. CANCELACIÓN

| **CAMPO** | **DESCRIPCIÓN** |
| :--- | :--- |
| DESCRIPCIÓN | Permite cancelar una solicitud o préstamo que aún no haya sido entregado. El Cliente puede cancelar sus propias solicitudes; el Bibliotecario puede cancelar cualquier solicitud pendiente indicando el motivo. |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Inicio de sesión del Cliente o del Bibliotecario. Ingreso a Mis préstamos o al módulo de préstamos. Seleccionar la solicitud. Confirmar la cancelación. |
| REQUERIMIENTOS | RF1: Permitir al Cliente cancelar sus propias solicitudes.<br>RF2: Permitir al Bibliotecario cancelar cualquier solicitud pendiente.<br>RF3: Solicitar confirmación antes de cancelar.<br>RF4: Registrar el estado «Cancelado».<br>RF5: Liberar los ejemplares reservados.<br>RF6: Impedir la cancelación de un préstamo ya entregado o devuelto. |

#### 7.3.6. ESTADOS DERIVADOS: POR VENCER Y VENCIDO

| **CAMPO** | **DESCRIPCIÓN** |
| :--- | :--- |
| DESCRIPCIÓN | Los estados **Por vencer** y **Vencido** no se almacenan en la base de datos. Se calculan al consultar el préstamo a partir de la fecha límite y del estado actual. |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Consulta de préstamos o de Mis préstamos. |
| REQUERIMIENTOS | RF1: Calcular «Por vencer» cuando falten tres días o menos para la fecha límite y el préstamo siga activo.<br>RF2: Calcular «Vencido» cuando la fecha límite haya pasado y el préstamo siga activo.<br>RF3: No persistir estos estados como columnas de la base de datos.<br>RF4: Mantener como estados persistidos: Solicitado, Aprobado, Prestado, Renovado, Devuelto, Devuelto con retraso, Cancelado y Perdido. |

### 7.4. GESTIÓN DE REPORTES

#### 7.4.1. VISUALIZACIÓN DE REPORTES

| **CAMPO** | **DESCRIPCIÓN** |
| :---: | :--- |
| DESCRIPCIÓN | Es el apartado que permite al Administrador y al Bibliotecario consultar reportes relacionados con la información de los libros y los préstamos registrados en la biblioteca. |
| PRIORIDAD | Media |
| ACCIONES INICIADORAS | Inicio de sesión del Administrador o del Bibliotecario. Ingreso al módulo de reportes. Seleccionar el reporte que desea consultar. |
| REQUERIMIENTOS | RF1: Mostrar el reporte de catálogo de libros registrados.<br>RF2: Mostrar el reporte de disponibilidad de ejemplares.<br>RF3: Mostrar el reporte de préstamos realizados.<br>RF4: Permitir filtrar los reportes por fechas.<br>RF5: Presentar la información de manera organizada.<br>RF6: Restringir el acceso a reportes globales al Administrador y al Bibliotecario; el Cliente consulta su historial en Mis préstamos. |

---

## 8. Reglas de negocio

Reglas y principios que aplican a todo el conjunto de requerimientos del sistema:

- **RN-01 Autenticación:** existen los perfiles Administrador, Bibliotecario y Cliente; el Cliente se clasifica en Lector general, Estudiante, Becario o Institución educativa. Cada usuario tiene un único perfil y solo accede a las funciones de su perfil.
- **RN-02 Gestión por roles:** el Administrador gestiona las cuentas del personal, los perfiles de acceso, la activación de cuentas y las políticas de préstamo. El Bibliotecario registra, edita y da de baja libros y ejemplares, gestiona los tipos de cliente, revisa las solicitudes de cambio y controla las solicitudes y préstamos. Cada rol accede únicamente a las funciones de su perfil.
- **RN-03 Disponibilidad:** no se puede registrar un préstamo si el libro no tiene ejemplares disponibles. La disponibilidad se calcula con los ejemplares no perdidos y sin préstamo activo.
- **RN-04 Préstamos:** todo préstamo relaciona un cliente con un libro, se crea con el estado «Solicitado» y avanza según los estados de la sección 7.3.6 y la sección 4.3.6.
- **RN-05 Devoluciones:** al registrar la devolución el estado pasa a «Devuelto» o «Devuelto con retraso», se registra la condición del ejemplar (buen estado, dañado o perdido) y la cantidad disponible aumenta en uno solo si el ejemplar no está perdido. El cobro de multas y sanciones por retraso, daño o pérdida queda fuera del alcance del proyecto.
- **RN-06 Integridad:** no se puede dar de baja un libro que tenga préstamos activos ni solicitudes pendientes.
- **RN-07 Unicidad:** el ISBN de cada libro, el correo electrónico y la identificación de cada usuario deben ser únicos. El código de cada ejemplar y el nombre de cada categoría también son únicos.
- **RN-08 Confirmación:** toda eliminación o cancelación requiere confirmación explícita en la interfaz del usuario que ejecuta la acción. No se exige una aprobación previa del Administrador.
- **RN-09 Reportes:** el Administrador y el Bibliotecario pueden consultar los reportes operativos de libros, disponibilidad y préstamos. El Cliente solo puede consultar su propio historial de préstamos y no accede a los reportes globales.
- **RN-10 Perfil:** cada usuario puede consultar y modificar únicamente sus propios datos personales. El Cliente puede actualizar nombres, apellidos, correo electrónico, teléfono y dirección; la identificación, el rol y el tipo de cliente solo los modifica el personal autorizado o se actualizan al aprobarse una solicitud de cambio.
- **RN-11 Entorno de despliegue:** la entrega actual se ejecuta y valida en entorno local. AWS es la infraestructura prevista para producción, siempre que se garantice el cumplimiento de las reglas de autenticación (RN-01), control de acceso por roles (RN-02), integridad referencial (RN-06 y RN-07), confidencialidad de credenciales y protección de datos personales conforme a la normativa vigente.
- **RN-12 Cambio de tipo de cliente:** el Cliente puede presentar una solicitud para cambiar a Estudiante, Becario o Institución educativa adjuntando hasta tres documentos de validación (PDF, JPG o PNG, máximo 5 MB cada uno). Solo puede existir una solicitud pendiente por cliente y el Cliente puede cancelarla mientras esté pendiente. El cambio se aplica cuando el Bibliotecario la aprueba; si la rechaza, el cliente conserva su tipo y recibe la observación registrada.
- **RN-13 Exclusión económica:** el sistema no registra, calcula ni cobra multas, sanciones, recargos, tarifas, depósitos, pagos, facturas ni reembolsos. Tampoco administra presupuestos, compras, adquisiciones o ventas. Cualquier aspecto económico se gestiona fuera del sistema y no forma parte de sus requerimientos.

---

## 9. Requerimientos de interfaces externas

### 9.1. Interfaces de usuario

La interfaz de usuario será desarrollada utilizando React.js, con Material UI (MUI) como biblioteca de componentes visuales para mantener una presentación uniforme, adaptable y consistente en las diferentes pantallas del sistema. Se utilizarán componentes para formularios, tablas, botones, cuadros de diálogo, menús de navegación y elementos de retroalimentación al usuario.

- **Pantallas principales:**
  - página principal;
  - inicio de sesión y registro;
  - catálogo de libros y detalle de libro;
  - préstamos;
  - clientes;
  - solicitudes de cambio de tipo;
  - libros y ejemplares;
  - usuarios;
  - políticas de préstamo;
  - reportes;
  - mis préstamos;
  - perfil.
- **Registro guiado:** formulario de cuatro pasos (cédula; nombres y apellidos; correo, dirección y teléfono; contraseña) con barra de progreso, indicador «Paso X de 4», validación por paso, botón Atrás y mensajes claros. No muestra un resumen intermedio de los datos ya ingresados.
- **Navegación:** barra superior y menú lateral (sidebar) adaptable a dispositivos móviles, con opciones según el rol.
- **Estándares de interfaz gráfica (GUI):** diseño visual uniforme en todas las interfaces, con estilos, colores y tamaños consistentes para los botones de acción. Mensajes en español, claros y directos, que informen cuando una operación se complete correctamente, ocurra un error o se requiera confirmar una acción importante antes de ejecutarla.
- **Listados:** búsqueda, filtros y paginación en las pantallas que manejan grandes volúmenes de datos.

### 9.2. Interfaces de hardware

El sistema es accesible desde cualquier dispositivo con navegador web:

- **Dispositivos soportados:** computadores de escritorio, portátiles, tablets y teléfonos móviles.
- **Impresoras:** los reportes pueden imprimirse mediante cualquier impresora configurada en el equipo del usuario.
- **Interacción hardware-software:** el sistema no requiere hardware especializado; toda la interacción con el servidor se realiza mediante el protocolo HTTP/HTTPS.

### 9.3. Interfaces de software

El sistema utilizará tecnologías de desarrollo web. La entrega actual funciona con MySQL local y queda prevista para su despliegue en Amazon Web Services (AWS). Los componentes de software son los siguientes:

- **Frontend:** React.js para la construcción de las interfaces de usuario.
- **Biblioteca de componentes gráficos:** Material UI (MUI) para el diseño de los elementos visuales y la adaptación de las interfaces.
- **Backend:** Node.js como entorno de ejecución y Express.js como framework para el desarrollo de los servicios del servidor.
- **Arquitectura de comunicación:** API REST para el intercambio de información entre el frontend y el backend.
- **Base de datos:** MySQL 8.0 para el almacenamiento estructurado de la información.
- **Gestión de datos:** Prisma ORM para facilitar las operaciones de consulta, registro, actualización y eliminación de información.
- **Almacenamiento de documentos:** sistema de archivos local en `backend/uploads/solicitudes/` para los documentos adjuntos a las solicitudes de cambio de tipo; la metadata se guarda en la tabla `DocumentoSolicitudTipo`.
- **Infraestructura prevista:** Amazon Web Services (AWS) para el despliegue futuro de la aplicación y de la base de datos.
- **Sistemas operativos y navegadores:** Linux en el servidor; navegadores Chrome, Firefox, Edge y Safari en los dispositivos cliente.

### 9.4. Interfaces de comunicación

Requerimientos de comunicación del producto:

- **Protocolos:** comunicación mediante HTTP durante el desarrollo y HTTPS con cifrado TLS en el entorno de producción.
- **Intercambio de datos:** comunicación entre el frontend desarrollado en React y el backend desarrollado en Node.js mediante servicios API REST.
- **Formato de mensajería:** JSON para las operaciones normales y `multipart/form-data` para la carga de documentos adjuntos.
- **Seguridad:** autenticación de usuarios, control de acceso basado en roles, almacenamiento de contraseñas mediante funciones de hash seguras y protección de las sesiones o mecanismos de autenticación.
- **Validación:** validación de datos tanto en el frontend como en el backend antes de procesar y almacenar la información.
- **Correo electrónico:** el envío de notificaciones mediante SMTP es opcional y no está implementado en esta entrega.

---

## 10. Requerimientos no funcionales

Criterios de calidad que debe cumplir el sistema:

- **RNF-01 Rendimiento (objetivo):** las consultas y listados deben responder en menos de 3 segundos con hasta 100 usuarios concurrentes. Este criterio no fue medido formalmente en la entrega actual; se establece como meta para producción.
- **RNF-02 Disponibilidad (objetivo):** el sistema debe estar disponible al menos el 97 % del tiempo en horario de atención de la biblioteca. Este criterio no fue medido formalmente en la entrega actual; se establece como meta para producción.
- **RNF-03 Seguridad:** contraseñas cifradas, control de acceso por roles, protección contra inyección SQL y validación de todos los datos de entrada.
- **RNF-04 Compatibilidad:** funcionamiento correcto en las dos últimas versiones de Chrome y Firefox, y en pantallas de móvil y escritorio. Chrome/Chromium y Firefox fueron los navegadores utilizados en las pruebas de interfaz; la verificación en Edge y Safari queda pendiente.
- **RNF-05 Escalabilidad:** la arquitectura debe permitir agregar nuevos módulos y aumentar el número de usuarios y libros sin rediseñar el sistema.
- **RNF-06 Respaldo:** copias de seguridad manuales de la base de datos mediante `mysqldump` y capacidad de restauración. No se implementa un respaldo automático semanal en esta entrega.
- **RNF-07 Portabilidad:** uso de herramientas de código abierto que facilitan la ejecución del sistema en distintos entornos.
- **RNF-08 Carga de archivos:** máximo tres documentos por solicitud, 5 MB por archivo, formatos PDF, JPG y PNG, validación en frontend y backend, y descarga autenticada solo para el Cliente propietario o el personal de biblioteca.
- **RNF-09 Usabilidad:** mensajes claros en español, validación por paso, indicador de progreso, foco en el primer error y navegación hacia atrás en el registro.

---

## 11. Otros requerimientos

Requerimientos no cubiertos en otras secciones:

- **Base de datos:** base de datos relacional con las tablas `Usuario`, `PoliticaPrestamo`, `Categoria`, `Libro`, `Ejemplar`, `SolicitudPrestamo`, `Prestamo`, `HistorialEstadoPrestamo`, `SolicitudTipoCliente` y `DocumentoSolicitudTipo`, con integridad referencial y campos de auditoría (fecha de creación y modificación).
- **Perfiles y tipos de cliente:** los perfiles de acceso (Administrador, Bibliotecario y Cliente) y los tipos de cliente (Lector general, Estudiante, Becario e Institución educativa) se representan mediante enums y columnas, no como tablas independientes.
- **Documentos adjuntos:** los archivos PDF/JPG/PNG de las solicitudes se almacenan en disco y su metadata (nombre original, nombre almacenado, tipo y tamaño) en la tabla `DocumentoSolicitudTipo`.
- **Internacionalización:** el sistema estará en español (Ecuador), con fechas en formato dd/mm/aaaa; se diseñará para permitir otros idiomas a futuro.
- **Legales:** cumplimiento de la Ley Orgánica de Protección de Datos Personales del Ecuador en el tratamiento de los datos de los usuarios, y respeto a los derechos de autor del material bibliográfico.
- **Reúso de componentes:** los módulos de autenticación, roles y reportes se diseñarán como componentes reutilizables para otros sistemas de la institución.
- **Documentación:** la documentación disponible en esta entrega es `README.md`, `CONTINUIDAD_PROYECTO.md`, el script `database/biblioteca_g03.sql` y este documento de requerimientos. Los manuales formales de usuario y técnico quedan pendientes.
- **Catálogo inicial:** el seed carga 15 libros con 31 ejemplares de ejemplo únicamente cuando la tabla `Libro` está vacía, para que el catálogo no aparezca vacío en una instalación nueva.

---

## 12. Glosario

**Administrador:** Perfil de usuario encargado de la configuración y gestión global del sistema (cuentas del personal, perfiles de acceso, activación de cuentas y políticas de préstamo), sin intervenir en la operación diaria de libros o préstamos ni en la gestión de tipos de cliente.

**AWS (Amazon Web Services):** Plataforma de servicios de computación en la nube prevista para alojar, ejecutar y respaldar la aplicación web y su base de datos en producción.

**Baja lógica:** Desactivación de un libro (activo = false) sin borrar físicamente sus datos, de modo que deja de mostrarse en el catálogo pero conserva su historial.

**Becario:** Tipo de cliente registrado en la plataforma que cuenta con condiciones y políticas de préstamo específicas asignadas por la institución.

**Estudiante:** Tipo de cliente que acredita su condición de estudiante con un certificado o carné institucional y accede a políticas de préstamo propias.

**Bibliotecario:** Perfil de usuario operativo responsable de administrar el catálogo de libros y ejemplares, gestionar los tipos de cliente y sus documentos de validación, revisar las solicitudes de cambio y controlar todo el ciclo de solicitudes, préstamos, renovaciones, devoluciones y cancelaciones.

**Cliente:** Perfil de usuario externo o institucional (clasificado como *Lector general*, *Estudiante*, *Becario* o *Institución educativa*) que consulta el catálogo, solicita préstamos, consulta su historial y gestiona su perfil personal.

**Documento de solicitud:** Archivo PDF, JPG o PNG adjunto a una solicitud de cambio de tipo, con un máximo de tres archivos de 5 MB cada uno.

**Ejemplar:** Cada copia física o individual disponible de un mismo título o libro registrado dentro del inventario de la biblioteca.

**Estado del préstamo:** Etapa en la que se encuentra una solicitud o préstamo dentro de su ciclo de vida. Los estados persistidos son *Solicitado, Aprobado, Prestado, Renovado, Devuelto, Devuelto con retraso, Cancelado* y *Perdido*. Los estados *Por vencer* y *Vencido* se calculan al consultar y no se almacenan.

**GUI (Interfaz Gráfica de Usuario):** Conjunto de elementos visuales e interactivos (pantallas, menús, botones y formularios) mediante los cuales los usuarios operan el sistema web.

**Hash:** Función criptográfica aplicada a las contraseñas antes de almacenarlas en la base de datos para garantizar su confidencialidad e irreversibilidad.

**HTTP / HTTPS:** Protocolos de comunicación web utilizados para la transferencia de información entre el navegador del cliente y el servidor; HTTPS incorpora cifrado seguro mediante TLS.

**Institución educativa:** Tipo de cliente representado por un responsable registrado, habilitado para realizar solicitudes de préstamo por lote de varios libros bajo políticas específicas.

**ISBN (*International Standard Book Number*):** Código numérico único de identificación internacional asignado a cada edición de un libro publicado.

**JSON (*JavaScript Object Notation*):** Formato ligero de intercambio de datos utilizado para las peticiones y respuestas asíncronas entre el navegador y el servidor.

**Lector general:** Tipo de cliente estándar que accede al catálogo para consultar disponibilidad y solicitar préstamos bajo las políticas generales de la biblioteca.

**Multa o sanción económica:** Cargo monetario por retraso, daño o pérdida de un ejemplar. **Está fuera del alcance del sistema**; no se registra, calcula ni cobra.

**Perfil de acceso:** Rol asignado a una cuenta (Administrador, Bibliotecario o Cliente) que determina las funciones a las que puede acceder.

**Perfil personal:** Conjunto de datos personales del usuario (nombres, apellidos, correo, teléfono y dirección) que este puede consultar y actualizar.

**Préstamo por lote:** Funcionalidad exclusiva para el tipo de cliente *Institución educativa* que permite solicitar múltiples libros dentro de una misma petición.

**RF (Requerimiento Funcional):** Especificación que define una función, acción o comportamiento concreto que el sistema debe ejecutar para los usuarios.

**RN (Regla de Negocio):** Norma, restricción o política operativa que regula el funcionamiento del sistema y las decisiones del negocio.

**RNF (Requerimiento No Funcional):** Criterio de calidad que establece cómo debe operar el sistema en términos de rendimiento, seguridad, disponibilidad, compatibilidad, respaldo y usabilidad.

**SMTP (*Simple Mail Transfer Protocol*):** Protocolo estándar de red utilizado para el envío opcional de correos electrónicos de notificación desde el sistema. No está implementado en esta entrega.

**Solicitud de cambio de tipo:** Petición que presenta el Cliente para pasar a Estudiante, Becario o Institución educativa, acompañada de documentos de validación y sujeta a la aprobación del Bibliotecario.

**SRS (*Software Requirements Specification*):** Documento de Especificación de Requerimientos de Software que describe de forma completa el alcance, funciones y restricciones del sistema a desarrollar.
