# Guía de diseño visual y experiencia de usuario
## Sistema de Administración para la Biblioteca Virtual G03

**Documento complementario:** `guia_revision_biblioteca_G03.mk`  
**Propósito:** definir la dirección visual, los colores, los componentes y los criterios de experiencia de usuario que debe seguir el agente al construir las interfaces.  
**Estado:** propuesta de diseño visual. No modifica ni amplía los requerimientos funcionales del SRS.

---

# 1. Dirección visual

Diseñar una aplicación web administrativa para una biblioteca universitaria. La interfaz debe transmitir:

- Orden y claridad.
- Profesionalismo y confianza.
- Facilidad de uso para tareas frecuentes.
- Una identidad visual cálida, con tonos naranjas como color principal.
- Sobriedad: evitar una apariencia infantil, excesivamente decorativa o saturada.

La aplicación debe priorizar la lectura de información, la consulta rápida del catálogo y la gestión de préstamos. No debe parecer una tienda en línea ni utilizar patrones visuales propios de comercio electrónico.

## 1.1 Concepto

**Estilo:** dashboard administrativo moderno, limpio y minimalista.

**Identidad:** naranja cálido como acento principal, combinado con fondos claros, superficies blancas y texto gris oscuro.

**Principio:** el naranja debe identificar acciones principales y elementos activos, no cubrir grandes áreas de la interfaz. Mantener suficiente espacio en blanco y jerarquía visual.

# 2. Sistema de colores

Usar la siguiente paleta como punto de partida. Centralizar los colores en el tema de Material UI para evitar valores dispersos en los componentes.

| Token | Color | Uso |
|---|---|---|
| Primary main | `#E87524` | Botones principales, enlaces destacados, elementos activos e iconos importantes. |
| Primary dark | `#BD5417` | Hover y estados activos del naranja. |
| Primary light | `#FFF0E5` | Fondos suaves, chips seleccionados y resaltados discretos. |
| Secondary main | `#374151` | Elementos secundarios, navegación y acciones de menor prioridad. |
| Background default | `#F7F7F8` | Fondo general de la aplicación. |
| Background paper | `#FFFFFF` | Tarjetas, formularios, tablas, diálogos y paneles. |
| Text primary | `#252525` | Títulos y contenido principal. |
| Text secondary | `#6B7280` | Descripciones, etiquetas y metadatos. |
| Divider | `#E5E7EB` | Separadores y bordes discretos. |
| Success | `#23834A` | Operaciones exitosas y estados positivos. |
| Warning | `#B7791F` | Advertencias y situaciones próximas a vencer. |
| Error | `#C0392B` | Errores, acciones destructivas y estados críticos. |
| Info | `#2563A6` | Información neutral y avisos informativos. |

### Reglas de uso del color

1. El naranja es el color primario de la identidad visual.
2. Usar el naranja intenso principalmente en botones de acción principal, enlaces destacados, indicadores de selección y elementos activos.
3. No utilizar texto blanco sobre tonos naranjas claros. Comprobar el contraste antes de definir texto sobre el color primario.
4. No colorear todas las tarjetas, tablas o secciones de naranja.
5. Los estados de préstamo deben tener etiquetas de texto además del color. No comunicar un estado únicamente mediante color.
6. Los colores de éxito, advertencia y error deben conservar significados consistentes en toda la aplicación.
7. No usar el naranja como sustituto de los colores semánticos de éxito, advertencia o error.

# 3. Tipografía

Usar una tipografía sans-serif legible. Preferencia: **Roboto**, compatible con Material UI. Si no está disponible, utilizar una fuente sans-serif del sistema.

Jerarquía recomendada:

| Elemento | Estilo |
|---|---|
| Título de página | 24–28 px, peso 600 |
| Título de sección | 18–20 px, peso 600 |
| Título de tarjeta | 16 px, peso 600 |
| Texto general | 14–16 px, peso 400 |
| Etiquetas y metadatos | 12–13 px, peso 400–500 |
| Botones | 14 px, peso 600 |

Evitar el uso excesivo de mayúsculas, cursivas, negritas y tamaños grandes. Mantener una jerarquía clara y consistente.

# 4. Estructura general de la aplicación

La interfaz autenticada debe utilizar una estructura de panel administrativo.

## 4.1 Barra lateral

- Ubicación: lado izquierdo.
- Ancho orientativo: 240–260 px en escritorio.
- Fondo: blanco o gris muy claro.
- Incluir el nombre o identificador visual de la Biblioteca Virtual G03 en la parte superior.
- Mostrar las opciones de navegación con iconos sencillos y etiquetas.
- Resaltar la sección actual con un fondo naranja claro y un indicador naranja.
- Permitir contraer la barra lateral en pantallas medianas o pequeñas.
- Las opciones visibles deben depender de los permisos reales del usuario.

No inventar permisos ni asignar secciones a roles que todavía estén en discusión. La navegación debe construirse a partir de las responsabilidades que queden aprobadas en el SRS.

## 4.2 Barra superior

Debe contener, según corresponda:

- Nombre de la sección o ruta de navegación.
- Título de la vista actual cuando sea útil.
- Acceso al perfil del usuario.
- Acción para cerrar sesión.
- Notificaciones solo si existe un requerimiento aprobado para ellas.

Evitar llenar la barra superior con iconos sin función.

## 4.3 Área de contenido

- Fondo general `#F7F7F8`.
- Márgenes amplios y consistentes.
- Contenido alineado a una cuadrícula.
- Tarjetas blancas con bordes discretos.
- Evitar sombras fuertes; usar elevación baja o bordes sutiles.
- Mantener una separación uniforme entre secciones.

# 5. Componentes visuales

Utilizar Material UI (MUI) como biblioteca principal de componentes. Personalizar su tema para aplicar la paleta definida.

## 5.1 Botones

- **Primario:** naranja, para la acción principal de la pantalla.
- **Secundario:** variante outlined o tonal, para acciones alternativas.
- **Terciario:** texto, para acciones de baja prioridad.
- **Destructivo:** rojo, únicamente para eliminar o ejecutar acciones irreversibles.
- Los botones deben usar verbos claros: «Guardar», «Registrar devolución», «Aprobar solicitud».
- Evitar botones con solo iconos cuando la acción pueda resultar ambigua. Añadir tooltip si se usa un icono aislado.

## 5.2 Formularios

- Etiquetas visibles encima de los campos.
- Indicar los campos obligatorios.
- Mostrar errores junto al campo correspondiente y explicar cómo corregirlos.
- Mantener tamaños y espaciados consistentes.
- Agrupar campos relacionados en secciones.
- No borrar los datos introducidos cuando ocurra un error de validación.
- Confirmar visualmente el resultado de guardar o actualizar.

## 5.3 Tablas y listados

El sistema administra información bibliográfica y préstamos; las tablas deben ser claras y fáciles de explorar.

- Encabezados diferenciados del contenido.
- Filas con altura cómoda y alineación consistente.
- Acciones por fila agrupadas en un menú o columna final.
- Búsqueda y filtros solo cuando correspondan a los datos y requerimientos de la pantalla.
- Paginación cuando el volumen de registros lo justifique.
- Mostrar estados mediante chips con texto.
- Incluir estados vacíos útiles, por ejemplo: «No hay préstamos registrados».
- En pantallas pequeñas, permitir desplazamiento horizontal controlado o transformar la tabla en tarjetas compactas. No comprimir el texto hasta hacerlo ilegible.

## 5.4 Tarjetas de resumen

Utilizarlas para métricas realmente útiles, como cantidades de préstamos o ejemplares, únicamente si están respaldadas por los requerimientos y datos disponibles.

- Fondo blanco.
- Título breve.
- Valor destacado.
- Icono discreto opcional.
- No utilizar colores saturados como fondo completo.
- No inventar indicadores, porcentajes o métricas.

## 5.5 Diálogos y confirmaciones

- Utilizar diálogos para confirmar acciones importantes o mostrar formularios breves.
- Indicar con claridad qué acción se va a ejecutar.
- En acciones destructivas, explicar qué registro se verá afectado.
- Ofrecer opciones claras, como «Cancelar» y «Confirmar».
- No solicitar confirmaciones repetitivas para acciones rutinarias de bajo riesgo.

# 6. Pantallas y criterios de presentación

Las siguientes pautas describen la presentación visual de las funciones contempladas en el proyecto. No autorizan a agregar funcionalidades que no estén en el SRS.

## 6.1 Inicio de sesión

- Diseño centrado y sencillo.
- Identidad de la Biblioteca Virtual G03.
- Campos de usuario/correo y contraseña, según el mecanismo de autenticación que se apruebe.
- Botón principal naranja.
- Mensajes de error claros y discretos.
- No mostrar información interna del sistema ni revelar si una cuenta existe mediante mensajes inseguros.

## 6.2 Panel principal

- Mostrar un saludo o identificación breve del usuario.
- Presentar accesos a las tareas permitidas para su rol.
- Incluir resúmenes solo si existen requerimientos y datos que los respalden.
- Evitar gráficos decorativos o métricas sin utilidad operativa.

## 6.3 Catálogo bibliográfico

- Facilitar la búsqueda y consulta de libros.
- Mostrar información bibliográfica con jerarquía clara: título, autor y otros datos definidos en el modelo.
- Diferenciar visualmente el registro bibliográfico de sus ejemplares físicos.
- La disponibilidad debe mostrarse de acuerdo con la regla de negocio que se apruebe.
- No mostrar precios, botones de compra, carritos ni elementos comerciales.

## 6.4 Gestión de ejemplares

- Presentar cada ejemplar como una unidad individual identificable.
- Mostrar su identificador y estado/condición cuando esos campos estén definidos.
- Diferenciar el estado del ejemplar del estado del préstamo.
- Las acciones disponibles deben respetar los permisos aprobados.

## 6.5 Préstamos y solicitudes

- Utilizar tablas o listados con filtros comprensibles.
- Mostrar claramente el identificador, usuario, fechas y estado, de acuerdo con los datos aprobados.
- Representar cada estado con un chip de texto y color semántico.
- Separar visualmente las acciones disponibles de la información del préstamo.
- No inventar transiciones de estado, plazos ni reglas de aprobación.

## 6.6 Devoluciones

- Presentar la información del préstamo y del ejemplar de forma diferenciada.
- Permitir registrar la condición de devolución únicamente según las reglas que se aprueben.
- Solicitar confirmación cuando la acción cambie de forma importante el estado del préstamo o ejemplar.
- No asumir qué ocurre con un ejemplar dañado o perdido; esa regla debe definirse en el SRS.

## 6.7 Usuarios y perfiles

- Mostrar la información en formularios ordenados.
- Diferenciar datos de cuenta, perfil y tipo de cliente si el modelo aprobado los separa.
- Ocultar o deshabilitar acciones no permitidas, pero validar siempre los permisos en el backend.
- No exponer información personal innecesaria.

## 6.8 Reportes

- Priorizar legibilidad, filtros claros y presentación ordenada.
- Utilizar tablas y gráficos solo cuando ayuden a interpretar los datos.
- No inventar métricas ni permitir acceso a reportes que el rol no tenga autorizado.

# 7. Diseño adaptable (responsive)

La aplicación debe ser usable en escritorio, tablet y móvil.

- **Escritorio:** barra lateral fija o contraíble y contenido amplio.
- **Tablet:** barra lateral contraíble, formularios en una o dos columnas según el espacio.
- **Móvil:** navegación compacta, formularios de una columna y tablas adaptadas.
- Los botones principales deben ser fáciles de pulsar.
- Evitar desbordamientos horizontales de toda la página.
- No ocultar información esencial en dispositivos pequeños.

Los puntos de quiebre deben centralizarse en el tema de MUI o en una configuración común, no repetirse arbitrariamente.

# 8. Accesibilidad y usabilidad

1. Mantener contraste suficiente entre texto y fondo.
2. No comunicar información solo mediante color.
3. Permitir navegación por teclado y mostrar foco visible.
4. Usar etiquetas asociadas a los campos de formulario.
5. Utilizar textos de botones y enlaces que describan su acción.
6. Mantener tamaños de texto legibles.
7. Mostrar mensajes de validación comprensibles.
8. Evitar animaciones innecesarias y efectos que distraigan.
9. Mantener consistencia en iconos, nombres, estados y acciones.
10. No depender exclusivamente de iconos para comunicar funciones.

# 9. Reglas de consistencia

- Crear un tema centralizado de MUI con colores, tipografía, radios y estilos comunes.
- Reutilizar componentes para botones, campos, tablas, chips de estado y encabezados de página.
- Mantener los mismos nombres para una misma acción en todas las pantallas.
- Utilizar iconos de una misma familia visual.
- Mantener espaciados y radios consistentes.
- No introducir gradientes, glassmorphism, efectos 3D, sombras intensas ni decoraciones que compitan con el contenido.
- No usar emojis como sustituto de iconos de interfaz.
- No cambiar la paleta principal sin una decisión explícita.
- Evitar duplicar estilos en cada pantalla.

# 10. Instrucciones para el agente de desarrollo

Al implementar el frontend:

1. Leer primero `guia_revision_biblioteca_G03.mk` y este documento.
2. Respetar el SRS como fuente de verdad para las funciones y reglas de negocio.
3. Aplicar la paleta naranja y el sistema visual descrito aquí.
4. Configurar el tema de Material UI de forma centralizada.
5. Construir una estructura reutilizable para navegación, encabezados, contenido, formularios, tablas y diálogos.
6. Mantener separada la lógica de presentación de las llamadas a la API.
7. No conectar React directamente a MySQL.
8. No inventar pantallas, campos, métricas, permisos, estados o acciones.
9. Si una pantalla depende de una contradicción o decisión pendiente del SRS, señalarla y solicitar confirmación antes de implementar esa parte.
10. Priorizar primero una interfaz funcional, clara y consistente; añadir refinamientos visuales después de validar los flujos.

## Orden visual recomendado de implementación

1. Tema MUI y tokens de diseño.
2. Estructura autenticada: barra lateral, barra superior y área de contenido.
3. Inicio de sesión.
4. Componentes reutilizables: botones, campos, tablas, chips, tarjetas y diálogos.
5. Pantallas funcionales según los requerimientos aprobados.
6. Adaptación responsive.
7. Revisión de accesibilidad, consistencia y estados de carga, error y vacío.

---

**Criterio final:** la interfaz debe sentirse como un sistema institucional de gestión bibliotecaria, no como una tienda ni como una plantilla genérica recargada. El naranja debe darle identidad sin perjudicar la lectura, la claridad ni la accesibilidad.
