-- AlterEnum
ALTER TABLE `Usuario` MODIFY `tipoCliente` ENUM('LECTOR_GENERAL', 'ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA') NULL;

-- AlterEnum
ALTER TABLE `PoliticaPrestamo` MODIFY `tipoCliente` ENUM('LECTOR_GENERAL', 'ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA') NOT NULL;

-- AlterEnum
ALTER TABLE `SolicitudTipoCliente` MODIFY `tipoSolicitado` ENUM('LECTOR_GENERAL', 'ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA') NOT NULL;

-- CreatePolicy: política inicial para el tipo de cliente Estudiante.
INSERT INTO `PoliticaPrestamo`
    (`tipoCliente`, `maxLibrosSimultaneos`, `plazoDias`, `renovacionesPermitidas`, `diasRenovacion`, `requiereDocumento`, `documentoDescripcion`, `createdAt`, `updatedAt`)
SELECT 'ESTUDIANTE', 4, 20, 1, 20, TRUE, 'Certificado de estudiante o carné institucional', NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `PoliticaPrestamo` WHERE `tipoCliente` = 'ESTUDIANTE'
);
