import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { usuarioSelect } from '../../utils/serializers.js';

const COSTO_BCRYPT = 12;

async function contarAdministradoresActivos(excluirId = null) {
  return prisma.usuario.count({
    where: {
      rol: 'ADMINISTRADOR',
      activo: true,
      ...(excluirId ? { id: { not: excluirId } } : {}),
    },
  });
}

export async function listarUsuarios({ q, rol, activo, skip, take }) {
  const where = {
    ...(rol ? { rol } : {}),
    ...(activo === undefined ? {} : { activo }),
    ...(q
      ? {
          OR: [
            { nombres: { contains: q } },
            { apellidos: { contains: q } },
            { email: { contains: q } },
            { identificacion: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, usuarios] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      select: usuarioSelect,
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      skip,
      take,
    }),
  ]);

  return { total, usuarios };
}

export async function crearPersonal(datos) {
  const existente = await prisma.usuario.findFirst({
    where: {
      OR: [{ email: datos.email }, { identificacion: datos.identificacion }],
    },
    select: { email: true },
  });

  if (existente) {
    throw new AppError(
      409,
      existente.email === datos.email
        ? 'El correo ya está registrado.'
        : 'La identificación ya está registrada.',
    );
  }

  const passwordHash = await bcrypt.hash(datos.password, COSTO_BCRYPT);

  return prisma.usuario.create({
    data: {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      email: datos.email,
      identificacion: datos.identificacion,
      telefono: datos.telefono || null,
      passwordHash,
      rol: datos.rol,
      tipoCliente: null,
    },
    select: usuarioSelect,
  });
}

export async function cambiarRol(usuarioId, rol, actorId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, rol: true, activo: true },
  });

  if (!usuario) throw new AppError(404, 'El usuario no existe.');
  if (usuario.id === actorId) {
    throw new AppError(400, 'No puedes cambiar el rol de tu propia cuenta.');
  }
  if (usuario.rol === 'ADMINISTRADOR' && rol !== 'ADMINISTRADOR') {
    const otros = await contarAdministradoresActivos(usuario.id);
    if (otros === 0) {
      throw new AppError(400, 'Debe existir al menos un administrador activo.');
    }
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data:
      rol === 'CLIENTE'
        ? { rol, tipoCliente: 'LECTOR_GENERAL' }
        : {
            rol,
            tipoCliente: null,
            documentoValidacion: null,
            institucionNombre: null,
            institucionRuc: null,
            responsableNombre: null,
            responsableCargo: null,
            responsableEmail: null,
            responsableTelefono: null,
          },
    select: usuarioSelect,
  });
}

export async function cambiarEstado(usuarioId, activo, actorId) {
  if (usuarioId === actorId && !activo) {
    throw new AppError(400, 'No puedes desactivar tu propia cuenta.');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, rol: true },
  });

  if (!usuario) throw new AppError(404, 'El usuario no existe.');

  if (usuario.rol === 'ADMINISTRADOR' && !activo) {
    const otros = await contarAdministradoresActivos(usuario.id);
    if (otros === 0) {
      throw new AppError(400, 'Debe existir al menos un administrador activo.');
    }
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { activo },
    select: usuarioSelect,
  });
}

export async function listarClientes({ q, activo, skip, take }) {
  const where = {
    rol: 'CLIENTE',
    ...(activo === undefined ? {} : { activo }),
    ...(q
      ? {
          OR: [
            { nombres: { contains: q } },
            { apellidos: { contains: q } },
            { email: { contains: q } },
            { identificacion: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, clientes] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      select: usuarioSelect,
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      skip,
      take,
    }),
  ]);

  return { total, clientes };
}

export async function actualizarCliente(usuarioId, datos) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, rol: true },
  });

  if (!usuario || usuario.rol !== 'CLIENTE') {
    throw new AppError(404, 'El cliente no existe.');
  }

  const esInstitucion = datos.tipoCliente === 'INSTITUCION_EDUCATIVA';

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      tipoCliente: datos.tipoCliente,
      documentoValidacion: datos.documentoValidacion || null,
      institucionNombre: esInstitucion ? datos.institucionNombre || null : null,
      institucionRuc: esInstitucion ? datos.institucionRuc || null : null,
      responsableNombre: esInstitucion ? datos.responsableNombre || null : null,
      responsableCargo: esInstitucion ? datos.responsableCargo || null : null,
      responsableEmail: esInstitucion ? datos.responsableEmail || null : null,
      responsableTelefono: esInstitucion ? datos.responsableTelefono || null : null,
    },
    select: usuarioSelect,
  });
}
