-- ============================================================================
-- Biblioteca Virtual G03 - Creación de la base de datos
-- MySQL 8.0+
--
-- Uso recomendado (como root o un usuario con permisos de administración):
--   mysql -u root -p < database/biblioteca_g03.sql
--
-- El script:
--   1. Crea la base de datos `biblioteca_g03`.
--   2. Crea el usuario de aplicación `biblioteca` con acceso local.
--   3. Crea todas las tablas del modelo Prisma.
--   4. Registra las migraciones ya aplicadas para que `prisma migrate`
--      reconozca la base como actualizada.
--   5. Inserta las categorías y políticas iniciales.
--
-- El Administrador NO se crea aquí porque su contraseña se cifra con bcrypt
-- a partir de ADMIN_PASSWORD. Después de ejecutar este script ejecuta:
--   npm run prisma:generate
--   npm run prisma:seed
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Base de datos y usuario de aplicación
-- ----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `biblioteca_g03`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Clave de desarrollo. Si la cambias, actualiza también DATABASE_URL en
-- backend/.env. Se crean ambos hosts porque MySQL distingue `localhost`
-- (socket/TCP local) de `127.0.0.1`.
CREATE USER IF NOT EXISTS 'biblioteca'@'localhost' IDENTIFIED BY 'biblioteca123';
CREATE USER IF NOT EXISTS 'biblioteca'@'127.0.0.1' IDENTIFIED BY 'biblioteca123';

ALTER USER 'biblioteca'@'localhost' IDENTIFIED BY 'biblioteca123';
ALTER USER 'biblioteca'@'127.0.0.1' IDENTIFIED BY 'biblioteca123';

GRANT ALL PRIVILEGES ON `biblioteca_g03`.* TO 'biblioteca'@'localhost';
GRANT ALL PRIVILEGES ON `biblioteca_g03`.* TO 'biblioteca'@'127.0.0.1';
FLUSH PRIVILEGES;

USE `biblioteca_g03`;

-- ----------------------------------------------------------------------------
-- 2. Tablas del modelo Prisma
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `identificacion` VARCHAR(30) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(30) NULL,
    `direccion` VARCHAR(255) NULL,
    `rol` ENUM('ADMINISTRADOR', 'BIBLIOTECARIO', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `tipoCliente` ENUM('LECTOR_GENERAL', 'ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA') NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `documentoValidacion` VARCHAR(255) NULL,
    `institucionNombre` VARCHAR(191) NULL,
    `institucionRuc` VARCHAR(20) NULL,
    `responsableNombre` VARCHAR(191) NULL,
    `responsableCargo` VARCHAR(100) NULL,
    `responsableEmail` VARCHAR(191) NULL,
    `responsableTelefono` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    UNIQUE INDEX `Usuario_identificacion_key`(`identificacion`),
    INDEX `Usuario_rol_activo_idx`(`rol`, `activo`),
    INDEX `Usuario_tipoCliente_idx`(`tipoCliente`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PoliticaPrestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoCliente` ENUM('LECTOR_GENERAL', 'ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA') NOT NULL,
    `maxLibrosSimultaneos` INTEGER NOT NULL,
    `plazoDias` INTEGER NOT NULL,
    `renovacionesPermitidas` INTEGER NOT NULL,
    `diasRenovacion` INTEGER NOT NULL,
    `requiereDocumento` BOOLEAN NOT NULL DEFAULT true,
    `documentoDescripcion` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PoliticaPrestamo_tipoCliente_key`(`tipoCliente`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Categoria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Libro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `autor` VARCHAR(191) NOT NULL,
    `editorial` VARCHAR(191) NOT NULL,
    `anioPublicacion` INTEGER NOT NULL,
    `isbn` VARCHAR(20) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Libro_isbn_key`(`isbn`),
    INDEX `Libro_titulo_idx`(`titulo`),
    INDEX `Libro_autor_idx`(`autor`),
    INDEX `Libro_categoriaId_activo_idx`(`categoriaId`, `activo`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Libro_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Ejemplar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `libroId` INTEGER NOT NULL,
    `condicion` ENUM('BUENO', 'DANADO', 'PERDIDO') NOT NULL DEFAULT 'BUENO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ejemplar_codigo_key`(`codigo`),
    INDEX `Ejemplar_libroId_condicion_idx`(`libroId`, `condicion`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Ejemplar_libroId_fkey` FOREIGN KEY (`libroId`) REFERENCES `Libro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SolicitudPrestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `creadaPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SolicitudPrestamo_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `SolicitudPrestamo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `SolicitudPrestamo_creadaPorId_fkey` FOREIGN KEY (`creadaPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Prestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitudId` INTEGER NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `libroId` INTEGER NOT NULL,
    `ejemplarId` INTEGER NULL,
    `estado` ENUM('SOLICITADO', 'APROBADO', 'PRESTADO', 'RENOVADO', 'DEVUELTO', 'DEVUELTO_CON_RETRASO', 'CANCELADO', 'PERDIDO') NOT NULL DEFAULT 'SOLICITADO',
    `fechaSolicitud` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaAprobacion` DATETIME(3) NULL,
    `fechaEntrega` DATETIME(3) NULL,
    `fechaLimite` DATETIME(3) NULL,
    `fechaDevolucion` DATETIME(3) NULL,
    `renovacionesRealizadas` INTEGER NOT NULL DEFAULT 0,
    `condicionDevolucion` ENUM('BUENO', 'DANADO', 'PERDIDO') NULL,
    `observaciones` TEXT NULL,
    `aprobadoPorId` INTEGER NULL,
    `entregadoPorId` INTEGER NULL,
    `devueltoPorId` INTEGER NULL,
    `canceladoPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Prestamo_clienteId_estado_idx`(`clienteId`, `estado`),
    INDEX `Prestamo_libroId_estado_idx`(`libroId`, `estado`),
    INDEX `Prestamo_ejemplarId_idx`(`ejemplarId`),
    INDEX `Prestamo_fechaLimite_idx`(`fechaLimite`),
    INDEX `Prestamo_fechaSolicitud_idx`(`fechaSolicitud`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Prestamo_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `SolicitudPrestamo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_libroId_fkey` FOREIGN KEY (`libroId`) REFERENCES `Libro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_ejemplarId_fkey` FOREIGN KEY (`ejemplarId`) REFERENCES `Ejemplar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_aprobadoPorId_fkey` FOREIGN KEY (`aprobadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_entregadoPorId_fkey` FOREIGN KEY (`entregadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_devueltoPorId_fkey` FOREIGN KEY (`devueltoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `Prestamo_canceladoPorId_fkey` FOREIGN KEY (`canceladoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `HistorialEstadoPrestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestamoId` INTEGER NOT NULL,
    `estadoAnterior` ENUM('SOLICITADO', 'APROBADO', 'PRESTADO', 'RENOVADO', 'DEVUELTO', 'DEVUELTO_CON_RETRASO', 'CANCELADO', 'PERDIDO') NULL,
    `estadoNuevo` ENUM('SOLICITADO', 'APROBADO', 'PRESTADO', 'RENOVADO', 'DEVUELTO', 'DEVUELTO_CON_RETRASO', 'CANCELADO', 'PERDIDO') NOT NULL,
    `observacion` VARCHAR(255) NULL,
    `usuarioId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistorialEstadoPrestamo_prestamoId_createdAt_idx`(`prestamoId`, `createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `HistorialEstadoPrestamo_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `Prestamo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `HistorialEstadoPrestamo_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SolicitudTipoCliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `tipoSolicitado` ENUM('LECTOR_GENERAL', 'ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA') NOT NULL,
    `documentoValidacion` VARCHAR(255) NOT NULL,
    `institucionNombre` VARCHAR(191) NULL,
    `institucionRuc` VARCHAR(20) NULL,
    `responsableNombre` VARCHAR(191) NULL,
    `responsableCargo` VARCHAR(100) NULL,
    `responsableEmail` VARCHAR(191) NULL,
    `responsableTelefono` VARCHAR(30) NULL,
    `motivo` VARCHAR(255) NULL,
    `estado` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    `observacionRevision` VARCHAR(255) NULL,
    `revisadaPorId` INTEGER NULL,
    `revisadaEn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SolicitudTipoCliente_clienteId_estado_idx`(`clienteId`, `estado`),
    INDEX `SolicitudTipoCliente_estado_createdAt_idx`(`estado`, `createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `SolicitudTipoCliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `SolicitudTipoCliente_revisadaPorId_fkey` FOREIGN KEY (`revisadaPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `DocumentoSolicitudTipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitudId` INTEGER NOT NULL,
    `nombreOriginal` VARCHAR(255) NOT NULL,
    `nombreArchivo` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `tamano` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DocumentoSolicitudTipo_solicitudId_idx`(`solicitudId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `DocumentoSolicitudTipo_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `SolicitudTipoCliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Control de migraciones de Prisma
-- ----------------------------------------------------------------------------
-- Permite que `prisma migrate status` y `prisma migrate deploy` reconozcan
-- el esquema como actualizado y no intenten recrear las tablas.

CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
    `checksum` VARCHAR(64) COLLATE utf8mb4_unicode_ci NOT NULL,
    `finished_at` DATETIME(3) DEFAULT NULL,
    `migration_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `logs` TEXT COLLATE utf8mb4_unicode_ci,
    `rolled_back_at` DATETIME(3) DEFAULT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `_prisma_migrations`
    (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
SELECT '09632d14-90e2-4963-8926-5f9929b03387',
       '96e639d9028b80d2584374e3297c9e8d63118da116f9afdf165f9773085059ce',
       NOW(3),
       '20261118001823_init',
       NULL,
       NULL,
       NOW(3),
       1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `_prisma_migrations`
    WHERE `migration_name` = '20261118001823_init'
);

INSERT INTO `_prisma_migrations`
    (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
SELECT '4f63d8fe-5b6f-4b06-8281-5d1bc1e9609b',
       '595c2a24f5c87fd101de5e105ab7db03b236a9eb3ebe134691c88f932e63882b',
       NOW(3),
       '20261119120000_solicitud_cambio_tipo_cliente',
       NULL,
       NULL,
       NOW(3),
       1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `_prisma_migrations`
    WHERE `migration_name` = '20261119120000_solicitud_cambio_tipo_cliente'
);

INSERT INTO `_prisma_migrations`
    (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
SELECT '77fe5049-5417-4f76-93b4-075c978e823c',
       'f6e73fc4a96366775596bcfc4910bd8514c19c2818504c395388953aafb424f5',
       NOW(3),
       '20261119190000_documentos_solicitud_tipo',
       NULL,
       NULL,
       NOW(3),
       1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `_prisma_migrations`
    WHERE `migration_name` = '20261119190000_documentos_solicitud_tipo'
);

INSERT INTO `_prisma_migrations`
    (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`)
SELECT '21ab1d9e-cd2c-4200-8705-00689b271f40',
       'a1156f07b2e78202f244a3bc16d2c854dcbf9101db8dea0ccfffd9fee3ede762',
       NOW(3),
       '20261123120000_tipo_cliente_estudiante',
       NULL,
       NULL,
       NOW(3),
       1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `_prisma_migrations`
    WHERE `migration_name` = '20261123120000_tipo_cliente_estudiante'
);

-- ----------------------------------------------------------------------------
-- 4. Datos iniciales (idempotentes)
-- ----------------------------------------------------------------------------
-- El Administrador se crea con `npm run prisma:seed` a partir de
-- ADMIN_EMAIL y ADMIN_PASSWORD de backend/.env.

INSERT IGNORE INTO `Categoria` (`nombre`, `createdAt`, `updatedAt`) VALUES
    ('Literatura', NOW(3), NOW(3)),
    ('Ciencias sociales', NOW(3), NOW(3)),
    ('Ciencias naturales', NOW(3), NOW(3)),
    ('Tecnología', NOW(3), NOW(3)),
    ('Historia', NOW(3), NOW(3)),
    ('Derecho', NOW(3), NOW(3)),
    ('Medicina', NOW(3), NOW(3)),
    ('Educación', NOW(3), NOW(3)),
    ('Referencia', NOW(3), NOW(3));

INSERT IGNORE INTO `PoliticaPrestamo`
    (`tipoCliente`, `maxLibrosSimultaneos`, `plazoDias`, `renovacionesPermitidas`, `diasRenovacion`, `requiereDocumento`, `documentoDescripcion`, `createdAt`, `updatedAt`)
VALUES
    ('LECTOR_GENERAL', 3, 15, 1, 15, TRUE, 'Cédula o pasaporte', NOW(3), NOW(3)),
    ('ESTUDIANTE', 4, 20, 1, 20, TRUE, 'Certificado de estudiante o carné institucional', NOW(3), NOW(3)),
    ('BECARIO', 4, 20, 2, 20, TRUE, 'Certificado de beca vigente', NOW(3), NOW(3)),
    ('INSTITUCION_EDUCATIVA', 10, 30, 1, 30, TRUE, 'Oficio institucional y datos del responsable', NOW(3), NOW(3));
