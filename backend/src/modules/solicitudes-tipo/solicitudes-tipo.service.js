import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { usuarioResumenSelect } from '../../utils/serializers.js';

export const DIRECTORIO_DOCUMENTOS = fileURLToPath(
  new URL('../../../uploads/solicitudes/', import.meta.url),
);

const EXTENSIONES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

export const solicitudTipoSelect = {
  id: true,
  clienteId: true,
  tipoSolicitado: true,
  documentoValidacion: true,
  institucionNombre: true,
  institucionRuc: true,
  responsableNombre: true,
  responsableCargo: true,
  responsableEmail: true,
  responsableTelefono: true,
  motivo: true,
  estado: true,
  observacionRevision: true,
  revisadaPorId: true,
  revisadaEn: true,
  createdAt: true,
  updatedAt: true,
  cliente: { select: usuarioResumenSelect },
  revisadaPor: { select: usuarioResumenSelect },
  documentos: {
    select: {
      id: true,
      nombreOriginal: true,
      mimeType: true,
      tamano: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  },
};

async function eliminarArchivos(archivos) {
  await Promise.all(
    archivos.map((archivo) =>
      unlink(path.join(DIRECTORIO_DOCUMENTOS, archivo.nombreArchivo)).catch(
        () => undefined,
      ),
    ),
  );
}

async function guardarArchivos(archivos = []) {
  if (archivos.length === 0) return [];

  await mkdir(DIRECTORIO_DOCUMENTOS, { recursive: true });
  const guardados = [];

  try {
    for (const archivo of archivos) {
      const nombreArchivo = `${Date.now()}-${randomUUID()}${
        EXTENSIONES[archivo.mimetype] ?? ''
      }`;
      await writeFile(path.join(DIRECTORIO_DOCUMENTOS, nombreArchivo), archivo.buffer);
      guardados.push({
        nombreOriginal: archivo.originalname.slice(0, 255),
        nombreArchivo,
        mimeType: archivo.mimetype,
        tamano: archivo.size,
      });
    }
    return guardados;
  } catch (error) {
    await eliminarArchivos(guardados);
    throw error;
  }
}

function datosInstitucionSolicitud(datos) {
  const esInstitucion = datos.tipoSolicitado === 'INSTITUCION_EDUCATIVA';
  return {
    institucionNombre: esInstitucion ? datos.institucionNombre || null : null,
    institucionRuc: esInstitucion ? datos.institucionRuc || null : null,
    responsableNombre: esInstitucion ? datos.responsableNombre || null : null,
    responsableCargo: esInstitucion ? datos.responsableCargo || null : null,
    responsableEmail: esInstitucion ? datos.responsableEmail || null : null,
    responsableTelefono: esInstitucion ? datos.responsableTelefono || null : null,
  };
}

export async function crearSolicitudTipo(clienteId, datos, archivos = []) {
  const cliente = await prisma.usuario.findUnique({
    where: { id: clienteId },
    select: { id: true, rol: true, activo: true, tipoCliente: true },
  });

  if (!cliente) throw new AppError(404, 'La cuenta no existe.');
  if (cliente.rol !== 'CLIENTE') {
    throw new AppError(403, 'Solo los clientes pueden solicitar un cambio de tipo.');
  }
  if (!cliente.activo) {
    throw new AppError(403, 'Tu cuenta está desactivada. Contacta al administrador.');
  }
  if (cliente.tipoCliente === datos.tipoSolicitado) {
    throw new AppError(400, 'Ya cuentas con ese tipo de cliente.');
  }

  const pendiente = await prisma.solicitudTipoCliente.findFirst({
    where: { clienteId, estado: 'PENDIENTE' },
    select: { id: true },
  });
  if (pendiente) {
    throw new AppError(
      409,
      'Ya tienes una solicitud de cambio pendiente. Espera la revisión del Bibliotecario.',
    );
  }

  const documentos = await guardarArchivos(archivos);
  const descripcion =
    datos.documentoValidacion?.trim() ||
    documentos
      .map((documento) => documento.nombreOriginal)
      .join(', ')
      .slice(0, 255);

  try {
    return await prisma.solicitudTipoCliente.create({
      data: {
        clienteId,
        tipoSolicitado: datos.tipoSolicitado,
        documentoValidacion: descripcion,
        motivo: datos.motivo || null,
        ...datosInstitucionSolicitud(datos),
        documentos: { create: documentos },
      },
      select: solicitudTipoSelect,
    });
  } catch (error) {
    await eliminarArchivos(documentos);
    throw error;
  }
}

export async function obtenerDocumentoSolicitud(solicitudId, documentoId, usuario) {
  const solicitud = await prisma.solicitudTipoCliente.findUnique({
    where: { id: solicitudId },
    select: {
      clienteId: true,
      documentos: {
        where: { id: documentoId },
        select: { nombreOriginal: true, nombreArchivo: true, mimeType: true },
      },
    },
  });

  const esStaff =
    usuario.rol === 'BIBLIOTECARIO' || usuario.rol === 'ADMINISTRADOR';
  const esPropietario =
    usuario.rol === 'CLIENTE' && solicitud?.clienteId === usuario.id;

  if (!solicitud || (!esStaff && !esPropietario) || solicitud.documentos.length === 0) {
    throw new AppError(404, 'El documento no existe.');
  }

  return solicitud.documentos[0];
}

export async function listarSolicitudesCliente(clienteId) {
  return prisma.solicitudTipoCliente.findMany({
    where: { clienteId },
    select: solicitudTipoSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function cancelarSolicitudCliente(clienteId, solicitudId) {
  const solicitud = await prisma.solicitudTipoCliente.findUnique({
    where: { id: solicitudId },
    select: { id: true, clienteId: true, estado: true },
  });

  if (!solicitud || solicitud.clienteId !== clienteId) {
    throw new AppError(404, 'La solicitud no existe.');
  }
  if (solicitud.estado !== 'PENDIENTE') {
    throw new AppError(409, 'Solo puedes cancelar una solicitud pendiente.');
  }

  return prisma.solicitudTipoCliente.update({
    where: { id: solicitudId },
    data: { estado: 'CANCELADA' },
    select: solicitudTipoSelect,
  });
}

export async function listarSolicitudesTipo({ estado, skip, take }) {
  const where = estado ? { estado } : {};

  const [total, solicitudes] = await Promise.all([
    prisma.solicitudTipoCliente.count({ where }),
    prisma.solicitudTipoCliente.findMany({
      where,
      select: solicitudTipoSelect,
      orderBy: [{ estado: 'asc' }, { createdAt: 'asc' }],
      skip,
      take,
    }),
  ]);

  return { total, solicitudes };
}

export async function revisarSolicitudTipo(solicitudId, datos, revisorId) {
  return prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitudTipoCliente.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError(404, 'La solicitud no existe.');
    if (solicitud.estado !== 'PENDIENTE') {
      throw new AppError(409, 'La solicitud ya fue revisada o cancelada.');
    }

    const actualizada = await tx.solicitudTipoCliente.updateMany({
      where: { id: solicitudId, estado: 'PENDIENTE' },
      data: {
        estado: datos.estado,
        observacionRevision: datos.observacionRevision || null,
        revisadaPorId: revisorId,
        revisadaEn: new Date(),
      },
    });

    if (actualizada.count === 0) {
      throw new AppError(409, 'La solicitud ya fue revisada o cancelada.');
    }

    if (datos.estado === 'APROBADA') {
      await tx.usuario.update({
        where: { id: solicitud.clienteId },
        data: {
          tipoCliente: solicitud.tipoSolicitado,
          documentoValidacion: solicitud.documentoValidacion,
          ...datosInstitucionSolicitud(solicitud),
        },
      });
    }

    return tx.solicitudTipoCliente.findUnique({
      where: { id: solicitudId },
      select: solicitudTipoSelect,
    });
  });
}
