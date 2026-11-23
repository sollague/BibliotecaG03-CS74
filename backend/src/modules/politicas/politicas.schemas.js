import { z } from 'zod';

export const esquemaActualizarPolitica = z
  .object({
    maxLibrosSimultaneos: z.coerce
      .number()
      .int()
      .min(1, 'El máximo debe ser al menos 1.')
      .max(50, 'El máximo no puede superar 50.'),
    plazoDias: z.coerce
      .number()
      .int()
      .min(1, 'El plazo debe ser al menos 1 día.')
      .max(365, 'El plazo no puede superar 365 días.'),
    renovacionesPermitidas: z.coerce
      .number()
      .int()
      .min(0, 'Las renovaciones no pueden ser negativas.')
      .max(10, 'No se permiten más de 10 renovaciones.'),
    diasRenovacion: z.coerce
      .number()
      .int()
      .min(1, 'La renovación debe extender al menos 1 día.')
      .max(365, 'La renovación no puede superar 365 días.'),
    requiereDocumento: z.boolean(),
    documentoDescripcion: z
      .string()
      .trim()
      .min(3, 'Describe el documento de validación.')
      .max(255),
  })
  .refine((datos) => datos.renovacionesPermitidas === 0 || datos.diasRenovacion > 0, {
    message: 'Si se permiten renovaciones, la extensión debe ser mayor que cero.',
    path: ['diasRenovacion'],
  });

export const esquemaTipoClienteParam = z.object({
  tipoCliente: z.enum([
    'LECTOR_GENERAL',
    'ESTUDIANTE',
    'BECARIO',
    'INSTITUCION_EDUCATIVA',
  ]),
});
