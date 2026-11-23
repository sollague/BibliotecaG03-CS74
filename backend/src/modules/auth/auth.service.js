import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { usuarioSelect } from '../../utils/serializers.js';

const COSTO_BCRYPT = 12;

export async function registrarCliente(datos) {
  const existente = await prisma.usuario.findFirst({
    where: {
      OR: [{ email: datos.email }, { identificacion: datos.identificacion }],
    },
    select: { email: true, identificacion: true },
  });

  if (existente) {
    if (existente.email === datos.email) {
      throw new AppError(409, 'El correo ya está registrado.', [
        { campo: 'email', mensaje: 'El correo ya está registrado.' },
      ]);
    }
    throw new AppError(409, 'La identificación ya está registrada.', [
      {
        campo: 'identificacion',
        mensaje: 'La identificación ya está registrada.',
      },
    ]);
  }

  const passwordHash = await bcrypt.hash(datos.password, COSTO_BCRYPT);

  return prisma.usuario.create({
    data: {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      email: datos.email,
      identificacion: datos.identificacion,
      passwordHash,
      telefono: datos.telefono || null,
      direccion: datos.direccion || null,
      rol: 'CLIENTE',
      tipoCliente: 'LECTOR_GENERAL',
    },
    select: usuarioSelect,
  });
}

export async function autenticarUsuario({ email, password }) {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  // Mensaje único para no revelar si el correo existe.
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw new AppError(401, 'Correo o contraseña incorrectos.');
  }

  if (!usuario.activo) {
    throw new AppError(403, 'Tu cuenta está desactivada. Contacta al administrador.');
  }

  const { passwordHash, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}
