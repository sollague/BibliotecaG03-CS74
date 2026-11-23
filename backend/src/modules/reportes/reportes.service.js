import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ESTADOS_ACTIVOS } from '../../utils/constants.js';
import { estadoEfectivo, sumarDias } from '../../utils/dates.js';
import { usuarioResumenSelect } from '../../utils/serializers.js';

const OFFSET_ECUADOR_MS = 5 * 60 * 60 * 1000;
const LIMITE_FILAS = 1000;

function inicioDiaEcuador(fecha) {
  return new Date(new Date(`${fecha}T00:00:00.000Z`).getTime() + OFFSET_ECUADOR_MS);
}

function numero(valor) {
  return Number(valor ?? 0);
}

function filtrosLibro({ q, categoriaId }) {
  const filtros = [Prisma.sql`l.activo = 1`];
  if (q) {
    const patron = `%${q}%`;
    filtros.push(Prisma.sql`(l.titulo LIKE ${patron} OR l.autor LIKE ${patron})`);
  }
  if (categoriaId) {
    filtros.push(Prisma.sql`l.categoriaId = ${categoriaId}`);
  }
  return Prisma.sql`WHERE ${Prisma.join(filtros, ' AND ')}`;
}

export async function reporteLibros({ q, categoriaId, soloDisponibles = false }) {
  const where = filtrosLibro({ q, categoriaId });
  const having = soloDisponibles ? Prisma.sql`HAVING disponibles > 0` : Prisma.empty;

  const filas = await prisma.$queryRaw`
    SELECT l.id, l.titulo, l.autor, l.editorial, l.anioPublicacion, l.isbn,
           c.nombre AS categoriaNombre,
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
    GROUP BY l.id, l.titulo, l.autor, l.editorial, l.anioPublicacion, l.isbn, c.nombre
    ${having}
    ORDER BY l.titulo ASC
    LIMIT ${LIMITE_FILAS}
  `;

  const wherePrisma = {
    activo: true,
    ...(categoriaId ? { categoriaId } : {}),
    ...(q
      ? {
          OR: [{ titulo: { contains: q } }, { autor: { contains: q } }],
        }
      : {}),
  };

  const [totalLibros, totalEjemplares, ejemplaresDisponibles, librosConDisponibles] =
    await Promise.all([
      prisma.libro.count({ where: wherePrisma }),
      prisma.ejemplar.count({ where: { libro: wherePrisma } }),
      prisma.ejemplar.count({
        where: {
          libro: wherePrisma,
          condicion: { not: 'PERDIDO' },
          prestamos: { none: { estado: { in: ESTADOS_ACTIVOS } } },
        },
      }),
      prisma.$queryRaw`
        SELECT COUNT(*) AS total FROM (
          SELECT l.id
          FROM Libro l
          INNER JOIN Ejemplar e ON e.libroId = l.id
          ${where}
          AND e.condicion <> 'PERDIDO'
          AND NOT EXISTS (
            SELECT 1 FROM Prestamo p
            WHERE p.ejemplarId = e.id
              AND p.estado IN ('APROBADO', 'PRESTADO', 'RENOVADO')
          )
          GROUP BY l.id
        ) t
      `,
    ]);

  return {
    resumen: {
      totalLibros,
      totalEjemplares,
      ejemplaresDisponibles,
      librosConDisponibles: numero(librosConDisponibles[0]?.total),
    },
    libros: filas.map((fila) => ({
      id: fila.id,
      titulo: fila.titulo,
      autor: fila.autor,
      editorial: fila.editorial,
      anioPublicacion: fila.anioPublicacion,
      isbn: fila.isbn,
      categoriaNombre: fila.categoriaNombre,
      totalEjemplares: numero(fila.totalEjemplares),
      disponibles: numero(fila.disponibles),
    })),
  };
}

export async function reportePrestamos({ q, estado, desde, hasta }) {
  const where = {};

  if (desde || hasta) {
    where.fechaSolicitud = {};
    if (desde) where.fechaSolicitud.gte = inicioDiaEcuador(desde);
    if (hasta) where.fechaSolicitud.lt = sumarDias(inicioDiaEcuador(hasta), 1);
  }

  if (q) {
    where.OR = [
      { cliente: { nombres: { contains: q } } },
      { cliente: { apellidos: { contains: q } } },
      { cliente: { identificacion: { contains: q } } },
      { libro: { titulo: { contains: q } } },
      { libro: { isbn: { contains: q } } },
    ];
  }

  const prestamos = await prisma.prestamo.findMany({
    where,
    include: {
      cliente: { select: usuarioResumenSelect },
      libro: { select: { id: true, titulo: true, isbn: true } },
      ejemplar: { select: { codigo: true } },
    },
    orderBy: { fechaSolicitud: 'desc' },
    take: LIMITE_FILAS,
  });

  const filas = prestamos.map((prestamo) => ({
    ...prestamo,
    estadoEfectivo: estadoEfectivo(prestamo),
  }));

  const filtradas = estado
    ? filas.filter((fila) => fila.estadoEfectivo === estado)
    : filas;

  const porEstado = {};
  for (const fila of filtradas) {
    porEstado[fila.estadoEfectivo] = (porEstado[fila.estadoEfectivo] ?? 0) + 1;
  }

  return {
    resumen: {
      totalPrestamos: filtradas.length,
      porEstado,
      limiteFilas: LIMITE_FILAS,
    },
    prestamos: filtradas,
  };
}
