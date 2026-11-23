import { z } from 'zod';

const fechaISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato de fecha aaaa-mm-dd.');

export const esquemaReporteLibros = z.object({
  q: z.string().trim().max(100).optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
});

export const esquemaReportePrestamos = z.object({
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
  desde: fechaISO.optional(),
  hasta: fechaISO.optional(),
});
