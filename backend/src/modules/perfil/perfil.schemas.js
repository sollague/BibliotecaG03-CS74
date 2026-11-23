import { z } from 'zod';

export const esquemaActualizarPerfil = z
  .object({
    nombres: z.string().trim().min(2, 'Ingresa tus nombres.').max(100).optional(),
    apellidos: z.string().trim().min(2, 'Ingresa tus apellidos.').max(100).optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Ingresa un correo válido.')
      .max(191)
      .optional(),
    telefono: z.string().trim().max(30).optional().or(z.literal('')),
    direccion: z.string().trim().max(255).optional().or(z.literal('')),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No se recibieron cambios para guardar.',
  });
