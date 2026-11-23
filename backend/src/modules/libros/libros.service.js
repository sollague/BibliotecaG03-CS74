import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { contarDisponibles } from '../../utils/availability.js';
import { ESTADOS_ACTIVOS, ESTADOS_TERMINALES } from '../../utils/constants.js';
import { usuarioResumenSelect } from '../../utils/serializers.js';

export function normalizarIsbn(isbn) {
  return isbn.replace(/[\s-]/g, '').toUpperCase();
}

function numero(valor) {
  return Number(valor ?? 0);
}

function mapearFilaLibro(fila) {
  return {
    id: fila.id,
    titulo: fila.titulo,
    autor: fila.autor,
    editorial: fila.editorial,
    anioPublicacion: fila.anioPublicacion,
    isbn: fila.isbn,
    categoriaId: fila.categoriaId,
    categoriaNombre: fila.categoriaNombre,
    activo: Boolean(fila.activo),
    totalEjemplares: numero(fila.totalEjemplares),
    disponibles: numero(fila.disponibles),
  };
}

export async function listarLibros({ q, categoriaId, incluirInactivos, skip, take }) {
  const filtros = [];

  if (q) {
    const patron = `%${q}%`;
    filtros.push(Prisma.sql`(l.titulo LIKE ${patron} OR l.autor LIKE ${patron})`);
  }
  if (categoriaId) {
    filtros.push(Prisma.sql`l.categoriaId = ${categoriaId}`);
  }
  if (!incluirInactivos) {
    filtros.push(Prisma.sql`l.activo = 1`);
  }

  const where = filtros.length
    ? Prisma.sql`WHERE ${Prisma.join(filtros, ' AND ')}`
    : Prisma.empty;

  const [filas, conteo] = await Promise.all([
    prisma.$queryRaw`
      SELECT l.id, l.titulo, l.autor, l.editorial, l.anioPublicacion, l.isbn,
             l.categoriaId, l.activo, c.nombre AS categoriaNombre,
             COUNT(e.id) AS totalEjemplares,
             COALESCE(SUM(
               CASE WHEN e.condicion <> 'PERDIDO' AND NOT EXISTS (
                 SELECT 1 FROM Prestamo p
                 WHERE p.ejemplarId = e.id
                   AND p.estado IN ('APROBADO', 'PRESTADO', 'RENOVADO')
               ) THEN 1 ELSE 0 END
             ), 0) AS disponibles
      FROM Libro l
      INNER JOIN Categoria c ON c.id = l.categoriaId
      LEFT JOIN Ejemplar e ON e.libroId = l.id
      ${where}
      GROUP BY l.id, l.titulo, l.autor, l.editorial, l.anioPublicacion, l.isbn,
               l.categoriaId, l.activo, c.nombre
      ORDER BY l.titulo ASC
      LIMIT ${take} OFFSET ${skip}
    `,
    prisma.$queryRaw`
      SELECT COUNT(*) AS total
      FROM Libro l
      ${where}
    `,
  ]);

  return {
    total: numero(conteo[0]?.total),
    libros: filas.map(mapearFilaLibro),
  };
}

export async function obtenerLibro(id, { esStaff = false } = {}) {
  const libro = await prisma.libro.findUnique({
    where: { id },
    include: {
      categoria: { select: { id: true, nombre: true } },
      ejemplares: {
        orderBy: { codigo: 'asc' },
        include: {
          prestamos: {
            where: { estado: { in: ESTADOS_ACTIVOS } },
            select: {
              id: true,
              estado: true,
              fechaLimite: true,
              cliente: { select: usuarioResumenSelect },
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!libro) throw new AppError(404, 'El libro no existe.');

  const totalEjemplares = libro.ejemplares.length;
  const disponibles = libro.ejemplares.filter(
    (ejemplar) =>
      ejemplar.condicion !== 'PERDIDO' && ejemplar.prestamos.length === 0,
  ).length;

  const base = {
    id: libro.id,
    titulo: libro.titulo,
    autor: libro.autor,
    editorial: libro.editorial,
    anioPublicacion: libro.anioPublicacion,
    isbn: libro.isbn,
    categoriaId: libro.categoriaId,
    categoriaNombre: libro.categoria.nombre,
    activo: libro.activo,
    totalEjemplares,
    disponibles,
  };

  if (!esStaff) return base;

  return {
    ...base,
    ejemplares: libro.ejemplares.map(({ prestamos, ...ejemplar }) => ({
      ...ejemplar,
      prestamoActivo: prestamos[0] ?? null,
    })),
  };
}

async function generarCodigos(tx, libroId, isbn, cantidad) {
  const existentes = await tx.ejemplar.findMany({
    where: { libroId },
    select: { codigo: true },
  });

  const prefijo = `${isbn}-`;
  let consecutivo = existentes.reduce((maximo, ejemplar) => {
    if (!ejemplar.codigo.startsWith(prefijo)) return maximo;
    const sufijo = Number(ejemplar.codigo.slice(prefijo.length));
    return Number.isInteger(sufijo) ? Math.max(maximo, sufijo) : maximo;
  }, 0);

  return Array.from({ length: cantidad }, () => {
    consecutivo += 1;
    return `${prefijo}${String(consecutivo).padStart(3, '0')}`;
  });
}

export async function crearLibro(datos) {
  const isbn = normalizarIsbn(datos.isbn);

  const libro = await prisma.$transaction(async (tx) => {
    const creado = await tx.libro.create({
      data: {
        titulo: datos.titulo,
        autor: datos.autor,
        editorial: datos.editorial,
        categoriaId: datos.categoriaId,
        anioPublicacion: datos.anioPublicacion,
        isbn,
      },
      include: { categoria: { select: { nombre: true } } },
    });

    const codigos = await generarCodigos(
      tx,
      creado.id,
      isbn,
      datos.cantidadEjemplares,
    );
    await tx.ejemplar.createMany({
      data: codigos.map((codigo) => ({ libroId: creado.id, codigo })),
    });

    return creado;
  });

  return {
    id: libro.id,
    titulo: libro.titulo,
    autor: libro.autor,
    editorial: libro.editorial,
    anioPublicacion: libro.anioPublicacion,
    isbn: libro.isbn,
    categoriaId: libro.categoriaId,
    categoriaNombre: libro.categoria.nombre,
    activo: libro.activo,
    totalEjemplares: datos.cantidadEjemplares,
    disponibles: datos.cantidadEjemplares,
  };
}

export async function actualizarLibro(id, datos) {
  const libro = await prisma.libro.findUnique({ where: { id }, select: { id: true } });
  if (!libro) throw new AppError(404, 'El libro no existe.');

  const actualizado = await prisma.libro.update({
    where: { id },
    data: {
      ...datos,
      ...(datos.isbn ? { isbn: normalizarIsbn(datos.isbn) } : {}),
    },
    include: { categoria: { select: { nombre: true } } },
  });

  const [totalEjemplares, disponibles] = await Promise.all([
    prisma.ejemplar.count({ where: { libroId: id } }),
    contarDisponibles(prisma, id),
  ]);

  return {
    id: actualizado.id,
    titulo: actualizado.titulo,
    autor: actualizado.autor,
    editorial: actualizado.editorial,
    anioPublicacion: actualizado.anioPublicacion,
    isbn: actualizado.isbn,
    categoriaId: actualizado.categoriaId,
    categoriaNombre: actualizado.categoria.nombre,
    activo: actualizado.activo,
    totalEjemplares,
    disponibles,
  };
}

export async function eliminarLibro(id) {
  const libro = await prisma.libro.findUnique({
    where: { id },
    select: { id: true, titulo: true },
  });
  if (!libro) throw new AppError(404, 'El libro no existe.');

  const prestamosVigentes = await prisma.prestamo.count({
    where: { libroId: id, estado: { notIn: ESTADOS_TERMINALES } },
  });

  if (prestamosVigentes > 0) {
    throw new AppError(
      409,
      'No se puede eliminar un libro con préstamos activos o solicitudes pendientes.',
    );
  }

  await prisma.libro.update({ where: { id }, data: { activo: false } });
  return libro;
}

export async function listarEjemplares(libroId) {
  const libro = await prisma.libro.findUnique({
    where: { id: libroId },
    select: { id: true, titulo: true, isbn: true, activo: true },
  });
  if (!libro) throw new AppError(404, 'El libro no existe.');

  const ejemplares = await prisma.ejemplar.findMany({
    where: { libroId },
    orderBy: { codigo: 'asc' },
    include: {
      prestamos: {
        where: { estado: { in: ESTADOS_ACTIVOS } },
        select: {
          id: true,
          estado: true,
          fechaLimite: true,
          cliente: { select: usuarioResumenSelect },
        },
        take: 1,
      },
      _count: { select: { prestamos: true } },
    },
  });

  return {
    libro,
    ejemplares: ejemplares.map(({ prestamos, _count, ...ejemplar }) => ({
      ...ejemplar,
      prestamoActivo: prestamos[0] ?? null,
      totalPrestamos: _count.prestamos,
    })),
  };
}

export async function agregarEjemplares(libroId, cantidad) {
  const libro = await prisma.libro.findUnique({
    where: { id: libroId },
    select: { id: true, isbn: true, activo: true },
  });
  if (!libro) throw new AppError(404, 'El libro no existe.');
  if (!libro.activo) {
    throw new AppError(409, 'No se pueden agregar ejemplares a un libro eliminado.');
  }

  return prisma.$transaction(async (tx) => {
    const codigos = await generarCodigos(tx, libro.id, libro.isbn, cantidad);
    await tx.ejemplar.createMany({
      data: codigos.map((codigo) => ({ libroId: libro.id, codigo })),
    });
    const total = await tx.ejemplar.count({ where: { libroId: libro.id } });
    return { agregados: cantidad, totalEjemplares: total };
  });
}

export async function eliminarEjemplar(id) {
  const ejemplar = await prisma.ejemplar.findUnique({
    where: { id },
    include: { _count: { select: { prestamos: true } } },
  });
  if (!ejemplar) throw new AppError(404, 'El ejemplar no existe.');

  if (ejemplar._count.prestamos > 0) {
    throw new AppError(
      409,
      'No se puede eliminar un ejemplar con historial de préstamos.',
    );
  }

  await prisma.ejemplar.delete({ where: { id } });
  return { id: ejemplar.id, codigo: ejemplar.codigo };
}
