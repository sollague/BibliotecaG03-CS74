# Políticas de préstamo — Biblioteca Virtual G03

**Última actualización:** 23/11/2026

Este documento registra las políticas de préstamo aplicadas por el sistema, los valores iniciales aprobados para el proyecto y las reglas que el backend valida en cada operación. La fuente funcional es el `docs/Documento_de_requerimientos_G03_Biblioteca_Virtual.md` (secciones 7.3.1, 7.3.2, 7.3.4 y reglas RN-03, RN-04, RN-05). Los valores numéricos iniciales no están fijados por el SRS: fueron aprobados para esta implementación y el Administrador puede modificarlos desde la pantalla **Políticas de préstamo**.

## 1. Tipos de cliente y valores iniciales

| Tipo de cliente | Préstamos simultáneos | Plazo de préstamo | Renovaciones permitidas | Días por renovación | Documento de validación |
| --- | ---: | ---: | ---: | ---: | --- |
| Lector general | 3 | 15 días | 1 | 15 días | Cédula o pasaporte |
| Estudiante | 4 | 20 días | 1 | 20 días | Certificado de estudiante o carné institucional |
| Becario | 4 | 20 días | 2 | 20 días | Certificado de beca vigente |
| Institución educativa | 10 | 30 días | 1 | 30 días | Oficio institucional y datos del responsable |

Estos valores se crean con `backend/prisma/seed.js` y se consultan o actualizan mediante `GET /api/politicas` y `PATCH /api/politicas/:tipoCliente` (solo Administrador). El Bibliotecario puede consultarlos, pero no modificarlos.

## 2. Solicitud de préstamo

- El Cliente puede solicitar únicamente para su propia cuenta. El Bibliotecario puede registrar una solicitud indicando el cliente.
- Cada solicitud se crea con estado **Solicitado**. Una solicitud puede incluir un solo libro, salvo el caso de Institución educativa.
- Solo la Institución educativa puede solicitar varios libros en un mismo lote. El límite técnico es de 50 libros por solicitud; la capacidad real la determina la política del tipo de cliente.
- No se permite repetir el mismo libro dentro de una solicitud por lote.
- Antes de registrar la solicitud se valida que los libros existan, estén activos y tengan ejemplares disponibles suficientes.
- También se valida la capacidad: los préstamos vigentes del cliente más los libros solicitados no pueden superar `maxLibrosSimultaneos`.
- Los estados **Solicitado** no ocupan un ejemplar ni cuentan como préstamo vigente. El ejemplar se reserva al aprobar la solicitud.
- Un cliente sin tipo de cliente asignado o con la cuenta desactivada no puede solicitar préstamos.
- La aprobación vuelve a validar la capacidad y la disponibilidad dentro de una transacción serializable, por lo que dos aprobaciones concurrentes no pueden reservar el mismo ejemplar.

### Disponibilidad de ejemplares

Un ejemplar está disponible cuando:

1. su condición no es **Perdido**, y
2. no participa en un préstamo en estado **Aprobado**, **Prestado** o **Renovado**.

Los estados **Solicitado**, **Devuelto**, **Devuelto con retraso**, **Cancelado** y **Perdido** no bloquean un ejemplar. Un ejemplar marcado como **Dañado** sí vuelve a estar disponible.

## 3. Entrega y plazo

- Solo se puede entregar un préstamo en estado **Aprobado** que tenga un ejemplar reservado.
- Al registrar la entrega se calcula `fechaLimite = fecha de entrega + plazoDias` de la política vigente del tipo de cliente.
- El préstamo pasa a **Prestado**.
- Los préstamos ya entregados conservan la fecha límite calculada. Un cambio posterior de la política no recalcula fechas ya asignadas.
- La entrega, la renovación y la devolución las registra únicamente el Bibliotecario.

## 4. Renovación

- Solo el Bibliotecario puede renovar.
- Solo se pueden renovar préstamos en estado **Prestado** o **Renovado**.
- No se puede renovar un préstamo vencido ni uno que no haya sido entregado.
- La cantidad de renovaciones no puede alcanzar `renovacionesPermitidas`. Al llegar al máximo, el sistema responde con un conflicto y el mensaje correspondiente.
- Cada renovación suma `diasRenovacion` a la fecha límite vigente y cambia el estado a **Renovado**.
- La renovación usa la política vigente al momento de la operación. Si el Administrador cambia los días de renovación o el máximo permitido, el cambio aplica a las renovaciones que se registren después.
- Si `renovacionesPermitidas` es 0, el tipo de cliente no tiene derecho a renovación.

## 5. Devolución y condición del ejemplar

Al registrar la devolución se debe indicar la condición:

| Condición | Estado del préstamo | Efecto sobre el ejemplar |
| --- | --- | --- |
| Buen estado | Devuelto, o Devuelto con retraso si la fecha límite ya pasó | El ejemplar queda disponible. |
| Dañado | Devuelto, o Devuelto con retraso si la fecha límite ya pasó | Se registra la condición Dañado; el ejemplar queda disponible. |
| Perdido | Perdido | El ejemplar queda marcado como Perdido y no vuelve a estar disponible. |

- **Devuelto con retraso** se determina comparando la fecha de devolución con la fecha límite. No es un estado que se pueda elegir manualmente.
- **Perdido** tiene prioridad sobre el cálculo de retraso.
- La devolución actualiza la condición física del ejemplar y registra el evento en el historial del préstamo.
- El cobro de multas o sanciones por retraso, daño o pérdida está fuera del alcance del proyecto (RN-05).

## 6. Cancelación

| Usuario | Estados en los que puede cancelar | Alcance |
| --- | --- | --- |
| Cliente | Solicitado | Solo sus propias solicitudes. |
| Bibliotecario | Solicitado o Aprobado | Cualquier solicitud en esos estados. |

- Al cancelar un préstamo **Aprobado**, el ejemplar reservado vuelve a estar disponible.
- No se puede cancelar un préstamo **Prestado**, **Renovado** ni un estado terminal.
- La cancelación conserva el registro y el historial; no elimina el préstamo.

## 7. Estados del préstamo

Estados persistidos en la base de datos:

- Solicitado
- Aprobado
- Prestado
- Renovado
- Devuelto
- Devuelto con retraso
- Cancelado
- Perdido

Estados derivados, calculados al consultar y nunca almacenados:

- **Por vencer:** préstamo Prestado o Renovado cuya fecha límite cae dentro de los próximos **3 días**. El SRS no define este umbral; los 3 días son una decisión aprobada del proyecto y se configuran en `backend/src/utils/constants.js` (`DIAS_POR_VENCER`).
- **Vencido:** préstamo Prestado o Renovado cuya fecha límite ya pasó.

Estados terminales: Devuelto, Devuelto con retraso, Cancelado y Perdido. Un préstamo terminal no vuelve a estados activos.

### Transiciones aplicadas

```text
Solicitado ──aprobar──> Aprobado ──entregar──> Prestado ──renovar──> Renovado
     │                    │                        │                    │
     └──cancelar──────────┴──cancelar──> Cancelado │                    │
                                                   ├──devolver──> Devuelto / Devuelto con retraso
                                                   └──devolver con condición Perdido──> Perdido
```

## 8. Documentos de validación y cambio de tipo de cliente

- El registro público crea siempre una cuenta **Cliente / Lector general**.
- Desde **Mi perfil**, el Cliente puede actualizar sus nombres, apellidos, correo electrónico, teléfono y dirección. La identificación, el rol y el tipo de cliente no son editables directamente por el Cliente.
- El Cliente puede **solicitar** el cambio a Estudiante, Becario o Institución educativa adjuntando hasta tres documentos de validación en PDF, JPG o PNG (máximo 5 MB por archivo). Para Institución educativa también registra el nombre de la institución y los datos del responsable.
- Transiciones permitidas para la solicitud: Lector general → Estudiante, Becario o Institución educativa; Estudiante → Becario o Institución educativa; Becario → Institución educativa; Institución educativa no presenta solicitudes de cambio.
- Solo puede existir **una solicitud pendiente** por cliente. La solicitud no cambia el tipo de cliente hasta que el Bibliotecario la apruebe.
- El Bibliotecario revisa la solicitud: al aprobarla se actualizan el tipo de cliente, el documento de validación y, cuando corresponde, los datos de la institución y del responsable; al rechazarla, el cliente conserva su tipo actual y recibe la observación registrada.
- El Cliente puede cancelar su solicitud mientras esté pendiente y presentar una nueva después.
- Para Estudiante, Becario e Institución educativa el documento es obligatorio. Para Lector general es opcional.
- Para Institución educativa también se registran el nombre de la institución y los datos del responsable (nombre obligatorio; RUC, cargo, correo y teléfono opcionales).
- Los documentos se cargan y almacenan en `backend/uploads/solicitudes/` y se registran en la tabla `DocumentoSolicitudTipo`. La descarga exige sesión y solo está disponible para el Cliente propietario o el personal de biblioteca.
- La política incluye el campo `requiereDocumento` y su descripción, editables por el Administrador. En la versión actual la validación del backend mantiene la exigencia de documento para Estudiante, Becario e Institución educativa; alinear ese indicador con una validación opcional requiere una decisión posterior (ver `docs/CONTINUIDAD_PROYECTO.md`).

## 9. Eliminación de libros

- La eliminación es lógica: el libro deja de mostrarse en el catálogo, pero se conserva para el historial.
- No se puede eliminar un libro con préstamos activos o solicitudes pendientes (cualquier préstamo que no esté en estado terminal).
- Solo el Bibliotecario puede eliminar libros.
- La interfaz solicita confirmación antes de eliminar.

## 10. Reportes y fechas

- El Administrador y el Bibliotecario pueden consultar los tres reportes operativos: catálogo de libros, disponibilidad y préstamos.
- El Cliente solo puede consultar su propio historial de préstamos.
- Los reportes muestran hasta **1000 filas** por consulta.
- Los filtros de fecha de los reportes usan el día calendario de Ecuador (UTC-5); el límite superior incluye todo el día indicado.
- Los reportes pueden imprimirse desde el navegador.

## 11. Resumen de reglas de negocio relacionadas

| Regla | Aplicación en el sistema |
| --- | --- |
| RN-02 | El Administrador gestiona cuentas, perfiles y políticas; el Bibliotecario opera libros y préstamos y revisa los tipos de cliente. |
| RN-03 | Se rechaza la solicitud o aprobación sin ejemplares disponibles. |
| RN-04 | Todo préstamo nace en Solicitado y avanza por el flujo definido. |
| RN-05 | La devolución registra condición; el ejemplar perdido no vuelve a estar disponible; no se gestionan multas. |
| RN-06 | No se elimina un libro con préstamos activos. |
| RN-09 | Reportes operativos para Administrador y Bibliotecario; historial propio para el Cliente. |

## 12. Referencias de implementación

- `backend/prisma/seed.js`: valores iniciales de políticas y categorías.
- `backend/src/modules/prestamos/prestamos.service.js`: solicitud, aprobación, entrega, renovación, devolución y cancelación.
- `backend/src/modules/usuarios/usuarios.service.js`: tipo de cliente y documento de validación.
- `backend/src/modules/solicitudes-tipo/solicitudes-tipo.service.js`: solicitudes de cambio de tipo presentadas por el Cliente y revisión del Bibliotecario.
- `backend/src/modules/libros/libros.service.js`: disponibilidad y baja lógica.
- `backend/src/modules/reportes/reportes.service.js`: reportes y límite de filas.
- `backend/src/utils/constants.js`: estados activos, estados terminales y días para «Por vencer».
- `backend/src/utils/dates.js`: cálculo de estados derivados y suma de días.
- `backend/tests/`: pruebas automatizadas de estas reglas.
