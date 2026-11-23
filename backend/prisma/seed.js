import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIAS = [
  'Literatura',
  'Ciencias sociales',
  'Ciencias naturales',
  'Tecnología',
  'Historia',
  'Derecho',
  'Medicina',
  'Educación',
  'Referencia',
];

// Catálogo inicial de ejemplo. Solo se inserta cuando la tabla Libro está
// vacía, para no mezclar datos de demostración con un catálogo real.
const LIBROS = [
  {
    codigo: 'LIB-001',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    editorial: 'Sudamericana',
    anioPublicacion: 1967,
    isbn: '9780307474728',
    categoria: 'Literatura',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-002',
    titulo: 'La ciudad y los perros',
    autor: 'Mario Vargas Llosa',
    editorial: 'Alfaguara',
    anioPublicacion: 1963,
    isbn: '9788420471839',
    categoria: 'Literatura',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-003',
    titulo: 'El amor en los tiempos del cólera',
    autor: 'Gabriel García Márquez',
    editorial: 'Oveja Negra',
    anioPublicacion: 1985,
    isbn: '9780307387264',
    categoria: 'Literatura',
    ejemplares: 1,
  },
  {
    codigo: 'LIB-004',
    titulo: 'Historia del Ecuador',
    autor: 'Enrique Ayala Mora',
    editorial: 'Corporación Editora Nacional',
    anioPublicacion: 2008,
    isbn: '9789978845118',
    categoria: 'Historia',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-005',
    titulo: 'Breve historia del Ecuador',
    autor: 'Alfredo Pareja Diezcanseco',
    editorial: 'Libresa',
    anioPublicacion: 1999,
    isbn: '9789978806089',
    categoria: 'Historia',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-006',
    titulo: 'Introducción al derecho',
    autor: 'Eduardo García Máynez',
    editorial: 'Porrúa',
    anioPublicacion: 2002,
    isbn: '9789700714420',
    categoria: 'Derecho',
    ejemplares: 3,
  },
  {
    codigo: 'LIB-007',
    titulo: 'Derecho constitucional ecuatoriano',
    autor: 'Hernán Salgado Pesantes',
    editorial: 'Ediciones Legales',
    anioPublicacion: 2019,
    isbn: '9789942767897',
    categoria: 'Derecho',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-008',
    titulo: 'Cálculo de una variable',
    autor: 'James Stewart',
    editorial: 'Cengage Learning',
    anioPublicacion: 2018,
    isbn: '9786075266244',
    categoria: 'Ciencias naturales',
    ejemplares: 3,
  },
  {
    codigo: 'LIB-009',
    titulo: 'Física universitaria, volumen 1',
    autor: 'Hugh D. Young y Roger A. Freedman',
    editorial: 'Pearson',
    anioPublicacion: 2018,
    isbn: '9786073238724',
    categoria: 'Ciencias naturales',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-010',
    titulo: 'Anatomía humana',
    autor: 'Richard S. Snell',
    editorial: 'Panamericana',
    anioPublicacion: 2019,
    isbn: '9788498357530',
    categoria: 'Medicina',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-011',
    titulo: 'Programación en Python',
    autor: 'John Zelle',
    editorial: 'Cengage Learning',
    anioPublicacion: 2017,
    isbn: '9786075266336',
    categoria: 'Tecnología',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-012',
    titulo: 'Estructuras de datos y algoritmos',
    autor: 'Mark Allen Weiss',
    editorial: 'Pearson',
    anioPublicacion: 2013,
    isbn: '9786073227759',
    categoria: 'Tecnología',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-013',
    titulo: 'Sociología',
    autor: 'Anthony Giddens',
    editorial: 'Alianza Editorial',
    anioPublicacion: 2010,
    isbn: '9788420686943',
    categoria: 'Ciencias sociales',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-014',
    titulo: 'Pedagogía del oprimido',
    autor: 'Paulo Freire',
    editorial: 'Siglo XXI',
    anioPublicacion: 2005,
    isbn: '9788432311956',
    categoria: 'Educación',
    ejemplares: 2,
  },
  {
    codigo: 'LIB-015',
    titulo: 'Diccionario de la lengua española',
    autor: 'Real Academia Española',
    editorial: 'Espasa',
    anioPublicacion: 2014,
    isbn: '9788467041897',
    categoria: 'Referencia',
    ejemplares: 2,
  },
];

// Valores iniciales aprobados por el proyecto. El Administrador puede
// modificarlos luego desde la pantalla de políticas de préstamo.
const POLITICAS = [
  {
    tipoCliente: 'LECTOR_GENERAL',
    maxLibrosSimultaneos: 3,
    plazoDias: 15,
    renovacionesPermitidas: 1,
    diasRenovacion: 15,
    requiereDocumento: true,
    documentoDescripcion: 'Cédula o pasaporte',
  },
  {
    tipoCliente: 'ESTUDIANTE',
    maxLibrosSimultaneos: 4,
    plazoDias: 20,
    renovacionesPermitidas: 1,
    diasRenovacion: 20,
    requiereDocumento: true,
    documentoDescripcion: 'Certificado de estudiante o carné institucional',
  },
  {
    tipoCliente: 'BECARIO',
    maxLibrosSimultaneos: 4,
    plazoDias: 20,
    renovacionesPermitidas: 2,
    diasRenovacion: 20,
    requiereDocumento: true,
    documentoDescripcion: 'Certificado de beca vigente',
  },
  {
    tipoCliente: 'INSTITUCION_EDUCATIVA',
    maxLibrosSimultaneos: 10,
    plazoDias: 30,
    renovacionesPermitidas: 1,
    diasRenovacion: 30,
    requiereDocumento: true,
    documentoDescripcion: 'Oficio institucional y datos del responsable',
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 8) {
    throw new Error(
      'Configura ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en backend/.env antes de ejecutar el seed.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: {
      nombres: 'Administrador',
      apellidos: 'del Sistema',
      email,
      identificacion: 'ADMIN-001',
      passwordHash,
      rol: 'ADMINISTRADOR',
      activo: true,
    },
  });

  for (const politica of POLITICAS) {
    await prisma.politicaPrestamo.upsert({
      where: { tipoCliente: politica.tipoCliente },
      update: {},
      create: politica,
    });
  }

  const categorias = {};
  for (const nombre of CATEGORIAS) {
    categorias[nombre] = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const totalLibros = await prisma.libro.count();
  if (totalLibros === 0) {
    await prisma.$transaction(async (tx) => {
      for (const { ejemplares, categoria, codigo, ...datos } of LIBROS) {
        const libro = await tx.libro.create({
          data: { ...datos, categoriaId: categorias[categoria].id },
        });
        await tx.ejemplar.createMany({
          data: Array.from({ length: ejemplares }, (_, indice) => ({
            libroId: libro.id,
            codigo: `${codigo}-EJ-${String(indice + 1).padStart(2, '0')}`,
          })),
        });
      }
    });
    console.log(`Catálogo inicial: ${LIBROS.length} libros de ejemplo agregados.`);
  } else {
    console.log(
      `El catálogo ya tiene ${totalLibros} libro(s); no se agregaron ejemplos.`,
    );
  }

  console.log('Seed completado: administrador, políticas, categorías y catálogo.');
  console.log(`Correo del administrador: ${email}`);
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
