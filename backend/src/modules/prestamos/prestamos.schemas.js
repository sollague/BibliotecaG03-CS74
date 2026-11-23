import { z } from 'zod';

const fechaISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato de fecha aaaa-mm-dd.');

export const esquemaCrearSolicitud = z.object({
  clienteId: z.coerce.number().int().positive().optional(),
  libroIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Selecciona al menos un libro.')
    .max(50, 'No se pueden solicitar más de 50 libros en un lote.'),
  observaciones: z.string().trim().max(500).optional().or(z.literal('')),
});

export const esquemaListarPrestamos = z.object({
  q: z.string().trim().max(100).optional(),
  estado: z
    .enum([
      'SOLICITADO',
      'APROBADO',
      'PRESTADO',
      'POR_VENCER',
      'RENOVADO',
      'VENCIDO',
      'DEVUELTO',
      'DEVUELTO_CON_RETRASO',
      'CANCELADO',
      'PERDIDO',
    ])
    .optional(),
  clienteId: z.coerce.number().int().positive().optional(),
  desde: fechaISO.optional(),
  hasta: fechaISO.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const esquemaDevolucion = z.object({
  condicion: z.enum(['BUENO', 'DANADO', 'PERDIDO'], {
    errorMap: () => ({ message: 'Selecciona la condición del ejemplar.' }),
  }),
  observaciones: z.string().trim().max(500).optional().or(z.literal('')),
});

export const esquemaCancelacion = z.object({
  observaciones: z.string().trim().max(500).optional().or(z.literal('')),
});

export const esquemaIdParam = z.object({
  id: z.coerce.number().int().positive(),
});
