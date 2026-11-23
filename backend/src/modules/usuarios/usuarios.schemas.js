import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Ingresa un correo válido.').max(191);
const identificacion = z
  .string()
  .trim()
  .min(5, 'La identificación debe tener al menos 5 caracteres.')
  .max(30)
  .regex(/^[A-Za-z0-9-]+$/, 'La identificación solo admite letras, números y guiones.');
const password = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72)
  .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.');

const activoQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((valor) => (valor === undefined ? undefined : valor === 'true'));

export const esquemaListarUsuarios = z.object({
  q: z.string().trim().max(100).optional(),
  rol: z.enum(['ADMINISTRADOR', 'BIBLIOTECARIO', 'CLIENTE']).optional(),
  activo: activoQuery,
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const esquemaCrearPersonal = z.object({
  nombres: z.string().trim().min(2, 'Ingresa los nombres.').max(100),
  apellidos: z.string().trim().min(2, 'Ingresa los apellidos.').max(100),
  email,
  identificacion,
  password,
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
  rol: z.enum(['ADMINISTRADOR', 'BIBLIOTECARIO'], {
    errorMap: () => ({ message: 'Solo se pueden crear cuentas de Administrador o Bibliotecario.' }),
  }),
});

export const esquemaCambiarRol = z.object({
  rol: z.enum(['ADMINISTRADOR', 'BIBLIOTECARIO', 'CLIENTE']),
});

export const esquemaCambiarEstado = z.object({
  activo: z.boolean({ required_error: 'Indica si la cuenta debe estar activa.' }),
});

export const esquemaActualizarCliente = z
  .object({
    tipoCliente: z.enum([
      'LECTOR_GENERAL',
      'ESTUDIANTE',
      'BECARIO',
      'INSTITUCION_EDUCATIVA',
    ]),
    documentoValidacion: z.string().trim().max(255).optional().or(z.literal('')),
    institucionNombre: z.string().trim().max(191).optional().or(z.literal('')),
    institucionRuc: z.string().trim().max(20).optional().or(z.literal('')),
    responsableNombre: z.string().trim().max(191).optional().or(z.literal('')),
    responsableCargo: z.string().trim().max(100).optional().or(z.literal('')),
    responsableEmail: z.string().trim().max(191).optional().or(z.literal('')),
    responsableTelefono: z.string().trim().max(30).optional().or(z.literal('')),
  })
  .superRefine((datos, ctx) => {
    if (datos.tipoCliente === 'LECTOR_GENERAL') return;

    if (!datos.documentoValidacion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documentoValidacion'],
        message: 'El documento de validación es obligatorio para este tipo de cliente.',
      });
    }

    if (datos.tipoCliente === 'INSTITUCION_EDUCATIVA') {
      if (!datos.institucionNombre) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['institucionNombre'],
          message: 'Ingresa el nombre de la institución educativa.',
        });
      }
      if (!datos.responsableNombre) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsableNombre'],
          message: 'Ingresa el nombre del responsable.',
        });
      }
      if (datos.responsableEmail && !z.string().email().safeParse(datos.responsableEmail).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['responsableEmail'],
          message: 'Ingresa un correo válido para el responsable.',
        });
      }
    }
  });
