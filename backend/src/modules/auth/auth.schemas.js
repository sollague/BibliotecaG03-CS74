import { z } from 'zod';

const identificacion = z
  .string()
  .trim()
  .min(5, 'La identificación debe tener al menos 5 caracteres.')
  .max(30, 'La identificación no puede superar 30 caracteres.')
  .regex(/^[A-Za-z0-9-]+$/, 'La identificación solo admite letras, números y guiones.');

const password = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar 72 caracteres.')
  .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.');

export const esquemaRegistro = z.object({
  nombres: z.string().trim().min(2, 'Ingresa tus nombres.').max(100),
  apellidos: z.string().trim().min(2, 'Ingresa tus apellidos.').max(100),
  email: z.string().trim().toLowerCase().email('Ingresa un correo válido.').max(191),
  identificacion,
  password,
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
  direccion: z.string().trim().max(255).optional().or(z.literal('')),
});

export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});
