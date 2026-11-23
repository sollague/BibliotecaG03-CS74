-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `identificacion` VARCHAR(30) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(30) NULL,
    `direccion` VARCHAR(255) NULL,
    `rol` ENUM('ADMINISTRADOR', 'BIBLIOTECARIO', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `tipoCliente` ENUM('LECTOR_GENERAL', 'BECARIO', 'INSTITUCION_EDUCATIVA') NULL,
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

-- CreateTable
CREATE TABLE `PoliticaPrestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoCliente` ENUM('LECTOR_GENERAL', 'BECARIO', 'INSTITUCION_EDUCATIVA') NOT NULL,
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

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Categoria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Libro` (
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
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ejemplar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `libroId` INTEGER NOT NULL,
    `condicion` ENUM('BUENO', 'DANADO', 'PERDIDO') NOT NULL DEFAULT 'BUENO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ejemplar_codigo_key`(`codigo`),
    INDEX `Ejemplar_libroId_condicion_idx`(`libroId`, `condicion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SolicitudPrestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `creadaPorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SolicitudPrestamo_clienteId_idx`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prestamo` (
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
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialEstadoPrestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestamoId` INTEGER NOT NULL,
    `estadoAnterior` ENUM('SOLICITADO', 'APROBADO', 'PRESTADO', 'RENOVADO', 'DEVUELTO', 'DEVUELTO_CON_RETRASO', 'CANCELADO', 'PERDIDO') NULL,
    `estadoNuevo` ENUM('SOLICITADO', 'APROBADO', 'PRESTADO', 'RENOVADO', 'DEVUELTO', 'DEVUELTO_CON_RETRASO', 'CANCELADO', 'PERDIDO') NOT NULL,
    `observacion` VARCHAR(255) NULL,
    `usuarioId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistorialEstadoPrestamo_prestamoId_createdAt_idx`(`prestamoId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Libro` ADD CONSTRAINT `Libro_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ejemplar` ADD CONSTRAINT `Ejemplar_libroId_fkey` FOREIGN KEY (`libroId`) REFERENCES `Libro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitudPrestamo` ADD CONSTRAINT `SolicitudPrestamo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitudPrestamo` ADD CONSTRAINT `SolicitudPrestamo_creadaPorId_fkey` FOREIGN KEY (`creadaPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `SolicitudPrestamo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_libroId_fkey` FOREIGN KEY (`libroId`) REFERENCES `Libro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_ejemplarId_fkey` FOREIGN KEY (`ejemplarId`) REFERENCES `Ejemplar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_aprobadoPorId_fkey` FOREIGN KEY (`aprobadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_entregadoPorId_fkey` FOREIGN KEY (`entregadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_devueltoPorId_fkey` FOREIGN KEY (`devueltoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_canceladoPorId_fkey` FOREIGN KEY (`canceladoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialEstadoPrestamo` ADD CONSTRAINT `HistorialEstadoPrestamo_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `Prestamo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialEstadoPrestamo` ADD CONSTRAINT `HistorialEstadoPrestamo_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
