import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { usuarioSelect } from '../../utils/serializers.js';

export async function actualizarPerfil(usuarioId, datos) {
  if (datos.email) {
    const existente = await prisma.usuario.findFirst({
      where: { email: datos.email, id: { not: usuarioId } },
      select: { id: true },
    });
    if (existente) {
      throw new AppError(409, 'El correo ya está registrado por otra cuenta.');
    }
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      ...(datos.nombres !== undefined ? { nombres: datos.nombres } : {}),
      ...(datos.apellidos !== undefined ? { apellidos: datos.apellidos } : {}),
      ...(datos.email !== undefined ? { email: datos.email } : {}),
      ...(datos.telefono !== undefined ? { telefono: datos.telefono || null } : {}),
      ...(datos.direccion !== undefined ? { direccion: datos.direccion || null } : {}),
    },
    select: usuarioSelect,
  });
}
