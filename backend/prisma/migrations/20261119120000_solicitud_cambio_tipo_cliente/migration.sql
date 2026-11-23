-- CreateTable
CREATE TABLE `SolicitudTipoCliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `tipoSolicitado` ENUM('LECTOR_GENERAL', 'BECARIO', 'INSTITUCION_EDUCATIVA') NOT NULL,
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
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SolicitudTipoCliente` ADD CONSTRAINT `SolicitudTipoCliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SolicitudTipoCliente` ADD CONSTRAINT `SolicitudTipoCliente_revisadaPorId_fkey` FOREIGN KEY (`revisadaPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
