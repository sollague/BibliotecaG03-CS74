-- CreateTable
CREATE TABLE `DocumentoSolicitudTipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitudId` INTEGER NOT NULL,
    `nombreOriginal` VARCHAR(255) NOT NULL,
    `nombreArchivo` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `tamano` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DocumentoSolicitudTipo_solicitudId_idx`(`solicitudId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DocumentoSolicitudTipo` ADD CONSTRAINT `DocumentoSolicitudTipo_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `SolicitudTipoCliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
