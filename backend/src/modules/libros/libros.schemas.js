import { z } from 'zod';

const anioActual = new Date().getFullYear();

export const isbnSchema = z
  .string()
  .trim()
  .min(10, 'Ingresa un ISBN válido.')
  .max(20, 'El ISBN no puede superar 20 caracteres.')
  .refine((valor) => {
    const limpio = valor.replace(/[\s-]/g, '');
    return /^(?:\d{9}[\dXx]|\d{13})$/.test(limpio);
  }, 'El ISBN debe tener 10 o 13 caracteres válidos.');

export const esquemaListarLibros = z.object({
  q: z.string().trim().max(100).optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  incluirInactivos: z
    .enum(['true', 'false'])
    .optional()
    .transform((valor) => valor === 'true'),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const esquemaCrearLibro = z.object({
  titulo: z.string().trim().min(1, 'Ingresa el título.').max(255),
  autor: z.string().trim().min(1, 'Ingresa el autor.').max(191),
  editorial: z.string().trim().min(1, 'Ingresa la editorial.').max(191),
  categoriaId: z.coerce.number().int().positive('Selecciona una categoría.'),
  anioPublicacion: z.coerce
    .number()
    .int()
    .min(1400, 'El año no es válido.')
    .max(anioActual + 1, 'El año no puede ser futuro.'),
  isbn: isbnSchema,
  cantidadEjemplares: z.coerce
    .number()
    .int()
    .min(1, 'Registra al menos un ejemplar.')
    .max(100, 'No se pueden registrar más de 100 ejemplares a la vez.'),
});

export const esquemaActualizarLibro = z
  .object({
    titulo: z.string().trim().min(1, 'Ingresa el título.').max(255).optional(),
    autor: z.string().trim().min(1, 'Ingresa el autor.').max(191).optional(),
    editorial: z.string().trim().min(1, 'Ingresa la editorial.').max(191).optional(),
    categoriaId: z.coerce.number().int().positive().optional(),
    anioPublicacion: z.coerce
      .number()
      .int()
      .min(1400, 'El año no es válido.')
      .max(anioActual + 1, 'El año no puede ser futuro.')
      .optional(),
    isbn: isbnSchema.optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'No se recibieron cambios para guardar.',
  });

export const esquemaAgregarEjemplares = z.object({
  cantidad: z.coerce
    .number()
    .int()
    .min(1, 'Agrega al menos un ejemplar.')
    .max(100, 'No se pueden agregar más de 100 ejemplares a la vez.'),
});

export const esquemaIdParam = z.object({
  id: z.coerce.number().int().positive(),
});
