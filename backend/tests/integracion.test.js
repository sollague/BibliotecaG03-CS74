import test from 'node:test';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { sumarDias } from '../src/utils/dates.js';
import { DIRECTORIO_DOCUMENTOS } from '../src/modules/solicitudes-tipo/solicitudes-tipo.service.js';

const STAMP = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
const PASSWORD = 'Prueba12345';
const PASSWORD_HASH = await bcrypt.hash(PASSWORD, 4);
const MS_DIA = 24 * 60 * 60 * 1000;

let servidor;
let baseUrl;
let categoriaId;
let secuencia = 0;

const idsUsuarios = new Set();
const idsLibros = new Set();

const SAL_ISBN = String(Math.floor(Math.random() * 900) + 100);

function nuevoIsbn() {
  secuencia += 1;
  const sufijo = String(Date.now()).slice(-3);
  return `978${SAL_ISBN}${String(secuencia).padStart(4, '0')}${sufijo}`;
}

async function solicitar(metodo, ruta, { cookie, body } = {}) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, {
    method: metodo,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = texto;
    }
  }

  return { status: respuesta.status, body: datos };
}

async function iniciarSesion(email, password = PASSWORD) {
  const respuesta = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const datos = await respuesta.json();
  assert.equal(
    respuesta.status,
    200,
    `No se pudo iniciar sesión con ${email}: ${JSON.stringify(datos)}`,
  );
  const cookie = respuesta.headers.getSetCookie()[0]?.split(';')[0];
  assert.ok(cookie, 'El login debe establecer la cookie de sesión.');
  return { cookie, usuario: datos.data.usuario };
}

function sesion(cookie) {
  return (metodo, ruta, body) => solicitar(metodo, ruta, { cookie, body });
}

async function crearCliente(rotulo) {
  const identificacion = `T${STAMP}${(secuencia += 1)}`.slice(0, 30);
  const usuario = await prisma.usuario.create({
    data: {
      nombres: 'Cliente',
      apellidos: `Prueba ${rotulo}`,
      email: `prueba.${rotulo}.${STAMP}@example.com`,
      identificacion,
      passwordHash: PASSWORD_HASH,
      rol: 'CLIENTE',
      tipoCliente: 'LECTOR_GENERAL',
    },
  });
  idsUsuarios.add(usuario.id);
  return { usuario, ...(await iniciarSesion(usuario.email)) };
}

async function crearLibro(apiBibliotecario, titulo, cantidad = 1) {
  const respuesta = await apiBibliotecario('POST', '/libros', {
    titulo,
    autor: 'Autor de prueba',
    editorial: 'Editorial de prueba',
    categoriaId,
    anioPublicacion: 2024,
    isbn: nuevoIsbn(),
    cantidadEjemplares: cantidad,
  });
  assert.equal(respuesta.status, 201, JSON.stringify(respuesta.body));
  idsLibros.add(respuesta.body.data.id);
  return respuesta.body.data;
}

async function solicitarPrestamo(apiCliente, libroIds, clienteId) {
  return apiCliente('POST', '/prestamos/solicitudes', {
    ...(clienteId ? { clienteId } : {}),
    libroIds,
  });
}

async function crearPrestamo(apiCliente, libroId) {
  const respuesta = await solicitarPrestamo(apiCliente, [libroId]);
  assert.equal(respuesta.status, 201, JSON.stringify(respuesta.body));
  return respuesta.body.data.prestamos[0];
}

async function cicloHastaPrestado(apiCliente, apiBibliotecario, libroId) {
  const prestamo = await crearPrestamo(apiCliente, libroId);
  const aprobado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/aprobar`,
  );
  assert.equal(aprobado.status, 200, JSON.stringify(aprobado.body));
  const entregado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/entregar`,
  );
  assert.equal(entregado.status, 200, JSON.stringify(entregado.body));
  return entregado.body.data;
}

async function usarPolitica(t, tipoCliente, cambios) {
  const original = await prisma.politicaPrestamo.findUnique({
    where: { tipoCliente },
  });
  assert.ok(original, `Debe existir la política ${tipoCliente}.`);

  await prisma.politicaPrestamo.update({
    where: { tipoCliente },
    data: cambios,
  });

  t.after(async () => {
    await prisma.politicaPrestamo.update({
      where: { tipoCliente },
      data: {
        maxLibrosSimultaneos: original.maxLibrosSimultaneos,
        plazoDias: original.plazoDias,
        renovacionesPermitidas: original.renovacionesPermitidas,
        diasRenovacion: original.diasRenovacion,
        requiereDocumento: original.requiereDocumento,
        documentoDescripcion: original.documentoDescripcion,
      },
    });
  });

  return { ...original, ...cambios };
}

function diasDesdeAhora(fecha) {
  return (new Date(fecha).getTime() - Date.now()) / MS_DIA;
}

async function disponibilidad(api, libroId) {
  const respuesta = await api('GET', '/libros?pageSize=100');
  assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
  return respuesta.body.data.find((libro) => libro.id === libroId)?.disponibles;
}

async function limpiarDatosDePrueba() {
  const usuarios = [...idsUsuarios];
  const libros = [...idsLibros];

  if (usuarios.length > 0) {
    await prisma.solicitudTipoCliente.deleteMany({
      where: {
        OR: [
          { clienteId: { in: usuarios } },
          { revisadaPorId: { in: usuarios } },
        ],
      },
    });

    const prestamos = await prisma.prestamo.findMany({
      where: { clienteId: { in: usuarios } },
      select: { id: true },
    });
    if (prestamos.length > 0) {
      await prisma.historialEstadoPrestamo.deleteMany({
        where: { prestamoId: { in: prestamos.map((p) => p.id) } },
      });
      await prisma.prestamo.deleteMany({
        where: { id: { in: prestamos.map((p) => p.id) } },
      });
    }

    await prisma.solicitudPrestamo.deleteMany({
      where: { clienteId: { in: usuarios } },
    });
  }

  if (libros.length > 0) {
    await prisma.prestamo.deleteMany({ where: { libroId: { in: libros } } });
    await prisma.solicitudPrestamo.deleteMany({
      where: { prestamos: { some: { libroId: { in: libros } } } },
    });
    await prisma.ejemplar.deleteMany({ where: { libroId: { in: libros } } });
    await prisma.libro.deleteMany({ where: { id: { in: libros } } });
  }

  if (usuarios.length > 0) {
    await prisma.usuario.deleteMany({ where: { id: { in: usuarios } } });
  }
}

let admin;
let bibliotecario;

test.before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${servidor.address().port}/api`;

  const categoria = await prisma.categoria.findFirst({
    orderBy: { id: 'asc' },
  });
  assert.ok(categoria, 'El seed debe haber creado al menos una categoría.');
  categoriaId = categoria.id;

  const [adminCreado, bibliotecarioCreado] = await Promise.all([
    prisma.usuario.create({
      data: {
        nombres: 'Administrador',
        apellidos: `Prueba ${STAMP}`,
        email: `admin.prueba.${STAMP}@example.com`,
        identificacion: `A${STAMP}`.slice(0, 30),
        passwordHash: PASSWORD_HASH,
        rol: 'ADMINISTRADOR',
      },
    }),
    prisma.usuario.create({
      data: {
        nombres: 'Bibliotecario',
        apellidos: `Prueba ${STAMP}`,
        email: `bib.prueba.${STAMP}@example.com`,
        identificacion: `B${STAMP}`.slice(0, 30),
        passwordHash: PASSWORD_HASH,
        rol: 'BIBLIOTECARIO',
      },
    }),
  ]);
  idsUsuarios.add(adminCreado.id);
  idsUsuarios.add(bibliotecarioCreado.id);

  [admin, bibliotecario] = await Promise.all([
    iniciarSesion(adminCreado.email),
    iniciarSesion(bibliotecarioCreado.email),
  ]);
});

test.after(async () => {
  await limpiarDatosDePrueba();
  await new Promise((resolve) => servidor.close(resolve));
  await prisma.$disconnect();
});

test('el registro público crea un Lector general y nunca expone la contraseña', async (t) => {
  const email = `registro.${STAMP}@example.com`;
  const identificacion = `R${STAMP}`.slice(0, 30);

  const registro = await solicitar('POST', '/auth/registro', {
    body: {
      nombres: 'Registro',
      apellidos: 'Público',
      email,
      identificacion,
      password: PASSWORD,
    },
  });
  assert.equal(registro.status, 201, JSON.stringify(registro.body));
  assert.equal(registro.body.data.rol, 'CLIENTE');
  assert.equal(registro.body.data.tipoCliente, 'LECTOR_GENERAL');
  assert.equal(registro.body.data.passwordHash, undefined);
  idsUsuarios.add(registro.body.data.id);

  const guardado = await prisma.usuario.findUnique({ where: { email } });
  assert.notEqual(guardado.passwordHash, PASSWORD);
  assert.equal(await bcrypt.compare(PASSWORD, guardado.passwordHash), true);

  const duplicado = await solicitar('POST', '/auth/registro', {
    body: {
      nombres: 'Otro',
      apellidos: 'Usuario',
      email,
      identificacion: `R2${STAMP}`.slice(0, 30),
      password: PASSWORD,
    },
  });
  assert.equal(duplicado.status, 409, JSON.stringify(duplicado.body));

  const sesionRegistro = await iniciarSesion(email);
  const yo = await sesion(sesionRegistro.cookie)('GET', '/auth/me');
  assert.equal(yo.status, 200);
  assert.equal(yo.body.data.id, registro.body.data.id);
  assert.equal(yo.body.data.passwordHash, undefined);

  // El Bibliotecario registra el documento de validación del cliente.
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const actualizado = await apiBibliotecario(
    'PATCH',
    `/usuarios/clientes/${registro.body.data.id}`,
    {
      tipoCliente: 'LECTOR_GENERAL',
      documentoValidacion: 'Cédula 0912345678',
    },
  );
  assert.equal(actualizado.status, 200, JSON.stringify(actualizado.body));
  assert.equal(actualizado.body.data.documentoValidacion, 'Cédula 0912345678');
});

test('los permisos por rol se validan en el servidor (RN-02)', async () => {
  const apiCliente = sesion((await crearCliente('permisos')).cookie);
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const apiAdmin = sesion(admin.cookie);

  const anonimo = await solicitar('GET', '/libros');
  assert.equal(anonimo.status, 401);

  const libro = await crearLibro(apiBibliotecario, `Permisos ${STAMP}`);

  const casos = [
    ['cliente crea libro', apiCliente, 'POST', '/libros', { titulo: 'X' }, 403],
    ['cliente lista usuarios', apiCliente, 'GET', '/usuarios', undefined, 403],
    ['cliente lista ejemplares', apiCliente, 'GET', `/libros/${libro.id}/ejemplares`, undefined, 403],
    ['cliente genera reporte', apiCliente, 'GET', '/reportes/libros', undefined, 403],
    ['cliente crea usuario', apiCliente, 'POST', '/usuarios', {}, 403],
    ['bibliotecario crea usuario', apiBibliotecario, 'POST', '/usuarios', {}, 403],
    ['bibliotecario edita política', apiBibliotecario, 'PATCH', '/politicas/LECTOR_GENERAL', {}, 403],
    ['administrador crea libro', apiAdmin, 'POST', '/libros', {}, 403],
    ['administrador crea solicitud', apiAdmin, 'POST', '/prestamos/solicitudes', { libroIds: [libro.id] }, 403],
    ['administrador actualiza cliente', apiAdmin, 'PATCH', '/usuarios/clientes/1', {}, 403],
  ];

  for (const [nombre, api, metodo, ruta, body, esperado] of casos) {
    const respuesta = await api(metodo, ruta, body);
    assert.equal(
      respuesta.status,
      esperado,
      `${nombre}: se esperaba ${esperado} y llegó ${respuesta.status} ${JSON.stringify(respuesta.body)}`,
    );
  }

  const catalogo = await apiCliente('GET', '/libros');
  assert.equal(catalogo.status, 200);
});

test('la solicitud valida duplicados, lote, disponibilidad y capacidad', async (t) => {
  const politica = await usarPolitica(t, 'LECTOR_GENERAL', {
    maxLibrosSimultaneos: 2,
    plazoDias: 15,
    renovacionesPermitidas: 1,
    diasRenovacion: 15,
  });

  const apiBibliotecario = sesion(bibliotecario.cookie);
  const cliente = await crearCliente('capacidad');
  const otroCliente = await crearCliente('sin-cupo');
  const apiCliente = sesion(cliente.cookie);

  const libro1 = await crearLibro(apiBibliotecario, `Capacidad uno ${STAMP}`);
  const libro2 = await crearLibro(apiBibliotecario, `Capacidad dos ${STAMP}`);
  const libro3 = await crearLibro(apiBibliotecario, `Capacidad tres ${STAMP}`);

  const duplicado = await solicitarPrestamo(apiCliente, [libro1.id, libro1.id]);
  assert.equal(duplicado.status, 400, JSON.stringify(duplicado.body));

  const loteNoInstitucional = await solicitarPrestamo(apiCliente, [
    libro1.id,
    libro2.id,
  ]);
  assert.equal(
    loteNoInstitucional.status,
    400,
    JSON.stringify(loteNoInstitucional.body),
  );

  const prestamo1 = await crearPrestamo(apiCliente, libro1.id);
  const aprobado1 = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo1.id}/aprobar`,
  );
  assert.equal(aprobado1.status, 200, JSON.stringify(aprobado1.body));

  // El ejemplar reservado ya no está disponible para otro cliente.
  const sinCupo = await solicitarPrestamo(sesion(otroCliente.cookie), [libro1.id]);
  assert.equal(sinCupo.status, 409, JSON.stringify(sinCupo.body));

  const prestamo2 = await crearPrestamo(apiCliente, libro2.id);
  const aprobado2 = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo2.id}/aprobar`,
  );
  assert.equal(aprobado2.status, 200, JSON.stringify(aprobado2.body));

  const excede = await solicitarPrestamo(apiCliente, [libro3.id]);
  assert.equal(excede.status, 409, JSON.stringify(excede.body));
  assert.match(excede.body.error.mensaje, new RegExp(String(politica.maxLibrosSimultaneos)));
});

test('la institución educativa puede solicitar un lote y requiere sus datos', async () => {
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const institucion = await crearCliente('institucion');
  const apiInstitucion = sesion(institucion.cookie);

  const incompleto = await apiBibliotecario(
    'PATCH',
    `/usuarios/clientes/${institucion.usuario.id}`,
    {
      tipoCliente: 'INSTITUCION_EDUCATIVA',
      documentoValidacion: 'Oficio 001',
    },
  );
  assert.equal(incompleto.status, 400, JSON.stringify(incompleto.body));

  const completo = await apiBibliotecario(
    'PATCH',
    `/usuarios/clientes/${institucion.usuario.id}`,
    {
      tipoCliente: 'INSTITUCION_EDUCATIVA',
      documentoValidacion: 'Oficio 001',
      institucionNombre: 'Unidad Educativa G03',
      institucionRuc: '0999999999001',
      responsableNombre: 'Responsable de Prueba',
      responsableCargo: 'Rector',
      responsableEmail: 'responsable@example.com',
      responsableTelefono: '0999999999',
    },
  );
  assert.equal(completo.status, 200, JSON.stringify(completo.body));
  assert.equal(completo.body.data.tipoCliente, 'INSTITUCION_EDUCATIVA');
  assert.equal(completo.body.data.institucionNombre, 'Unidad Educativa G03');

  const libro1 = await crearLibro(apiBibliotecario, `Lote uno ${STAMP}`);
  const libro2 = await crearLibro(apiBibliotecario, `Lote dos ${STAMP}`);

  const lote = await solicitarPrestamo(apiInstitucion, [libro1.id, libro2.id]);
  assert.equal(lote.status, 201, JSON.stringify(lote.body));
  assert.equal(lote.body.data.prestamos.length, 2);
  assert.equal(
    new Set(lote.body.data.prestamos.map((p) => p.solicitudId)).size,
    1,
  );
  for (const prestamo of lote.body.data.prestamos) {
    assert.equal(prestamo.estado, 'SOLICITADO');
  }

  // Un cliente que no es institución no puede pedir un lote.
  const particular = await crearCliente('lote-particular');
  const libro3 = await crearLibro(apiBibliotecario, `Lote tres ${STAMP}`);
  const libro4 = await crearLibro(apiBibliotecario, `Lote cuatro ${STAMP}`);
  const loteParticular = await solicitarPrestamo(
    sesion(particular.cookie),
    [libro3.id, libro4.id],
  );
  assert.equal(
    loteParticular.status,
    400,
    JSON.stringify(loteParticular.body),
  );
  assert.match(loteParticular.body.error.mensaje, /instituciones educativas/i);
});

test('la entrega calcula el plazo y la renovación lo extiende una sola vez', async (t) => {
  await usarPolitica(t, 'LECTOR_GENERAL', {
    maxLibrosSimultaneos: 3,
    plazoDias: 10,
    renovacionesPermitidas: 1,
    diasRenovacion: 7,
  });

  const apiBibliotecario = sesion(bibliotecario.cookie);
  const cliente = await crearCliente('renovacion');
  const apiCliente = sesion(cliente.cookie);
  const libro = await crearLibro(apiBibliotecario, `Renovación ${STAMP}`, 2);

  const prestamo = await crearPrestamo(apiCliente, libro.id);

  const renovarSolicitado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/renovar`,
  );
  assert.equal(renovarSolicitado.status, 409);

  const aprobado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/aprobar`,
  );
  assert.equal(aprobado.status, 200, JSON.stringify(aprobado.body));

  const renovarAprobado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/renovar`,
  );
  assert.equal(renovarAprobado.status, 409);

  const entregado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/entregar`,
  );
  assert.equal(entregado.status, 200, JSON.stringify(entregado.body));
  assert.equal(entregado.body.data.estado, 'PRESTADO');
  assert.ok(
    Math.abs(diasDesdeAhora(entregado.body.data.fechaLimite) - 10) < 0.01,
    `La fecha límite debe ser de 10 días: ${entregado.body.data.fechaLimite}`,
  );
  const limiteOriginal = entregado.body.data.fechaLimite;

  const renovado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/renovar`,
  );
  assert.equal(renovado.status, 200, JSON.stringify(renovado.body));
  assert.equal(renovado.body.data.estado, 'RENOVADO');
  assert.equal(renovado.body.data.renovacionesRealizadas, 1);
  assert.ok(
    Math.abs(
      new Date(renovado.body.data.fechaLimite).getTime() -
        new Date(limiteOriginal).getTime() -
        7 * MS_DIA,
    ) < 1000,
    'La renovación debe sumar exactamente 7 días.',
  );

  const segundaRenovacion = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/renovar`,
  );
  assert.equal(segundaRenovacion.status, 409);
  assert.match(segundaRenovacion.body.error.mensaje, /renovaciones/i);

  const cancelarActivo = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/cancelar`,
    {},
  );
  assert.equal(cancelarActivo.status, 409);

  const devuelto = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/devolver`,
    { condicion: 'BUENO' },
  );
  assert.equal(devuelto.status, 200, JSON.stringify(devuelto.body));
  assert.equal(devuelto.body.data.estado, 'DEVUELTO');
  assert.equal(await disponibilidad(apiCliente, libro.id), 2);
});

test('la devolución distingue retraso, daño y pérdida del ejemplar', async () => {
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const cliente = await crearCliente('devoluciones');
  const apiCliente = sesion(cliente.cookie);
  const libro = await crearLibro(apiBibliotecario, `Condiciones ${STAMP}`, 2);

  // Pérdida: el ejemplar no vuelve a estar disponible.
  const perdido = await cicloHastaPrestado(
    apiCliente,
    apiBibliotecario,
    libro.id,
  );
  const devueltoPerdido = await apiBibliotecario(
    'PATCH',
    `/prestamos/${perdido.id}/devolver`,
    { condicion: 'PERDIDO', observaciones: 'No fue devuelto' },
  );
  assert.equal(devueltoPerdido.status, 200, JSON.stringify(devueltoPerdido.body));
  assert.equal(devueltoPerdido.body.data.estado, 'PERDIDO');
  assert.equal(await disponibilidad(apiCliente, libro.id), 1);

  // Daño: el ejemplar sí vuelve a estar disponible.
  const danado = await cicloHastaPrestado(apiCliente, apiBibliotecario, libro.id);
  const devueltoDanado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${danado.id}/devolver`,
    { condicion: 'DANADO' },
  );
  assert.equal(devueltoDanado.status, 200, JSON.stringify(devueltoDanado.body));
  assert.equal(devueltoDanado.body.data.estado, 'DEVUELTO');
  assert.equal(devueltoDanado.body.data.condicionDevolucion, 'DANADO');
  assert.equal(await disponibilidad(apiCliente, libro.id), 1);

  // Retraso: se calcula con la fecha límite vencida.
  const atrasado = await cicloHastaPrestado(
    apiCliente,
    apiBibliotecario,
    libro.id,
  );
  await prisma.prestamo.update({
    where: { id: atrasado.id },
    data: { fechaLimite: sumarDias(new Date(), -1) },
  });
  const devueltoAtrasado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${atrasado.id}/devolver`,
    { condicion: 'BUENO' },
  );
  assert.equal(devueltoAtrasado.status, 200, JSON.stringify(devueltoAtrasado.body));
  assert.equal(devueltoAtrasado.body.data.estado, 'DEVUELTO_CON_RETRASO');

  // Con un solo ejemplar perdido, el libro queda sin disponibilidad.
  const libroUnico = await crearLibro(
    apiBibliotecario,
    `Único ejemplar ${STAMP}`,
    1,
  );
  const unico = await cicloHastaPrestado(
    apiCliente,
    apiBibliotecario,
    libroUnico.id,
  );
  const perdidoUnico = await apiBibliotecario(
    'PATCH',
    `/prestamos/${unico.id}/devolver`,
    { condicion: 'PERDIDO' },
  );
  assert.equal(perdidoUnico.status, 200, JSON.stringify(perdidoUnico.body));
  assert.equal(await disponibilidad(apiCliente, libroUnico.id), 0);

  const sinEjemplares = await solicitarPrestamo(apiCliente, [libroUnico.id]);
  assert.equal(sinEjemplares.status, 409, JSON.stringify(sinEjemplares.body));

  // El libro perdido sigue existiendo en el catálogo.
  const catalogo = await apiCliente('GET', '/libros?pageSize=100');
  assert.ok(catalogo.body.data.some((fila) => fila.id === libroUnico.id));
});

test('la cancelación libera el ejemplar y respeta el estado y el dueño', async () => {
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const clienteA = await crearCliente('cancelacion-a');
  const clienteB = await crearCliente('cancelacion-b');
  const apiA = sesion(clienteA.cookie);
  const apiB = sesion(clienteB.cookie);
  const libro = await crearLibro(apiBibliotecario, `Cancelación ${STAMP}`, 1);

  const solicitudA = await crearPrestamo(apiA, libro.id);
  const canceladaA = await apiA(
    'PATCH',
    `/prestamos/${solicitudA.id}/cancelar`,
    { observaciones: 'Ya no la necesito' },
  );
  assert.equal(canceladaA.status, 200, JSON.stringify(canceladaA.body));
  assert.equal(canceladaA.body.data.estado, 'CANCELADO');
  assert.equal(await disponibilidad(apiB, libro.id), 1);

  const solicitudB = await crearPrestamo(apiB, libro.id);
  const aprobadaB = await apiBibliotecario(
    'PATCH',
    `/prestamos/${solicitudB.id}/aprobar`,
  );
  assert.equal(aprobadaB.status, 200, JSON.stringify(aprobadaB.body));

  const cancelarAjeno = await apiA(
    'PATCH',
    `/prestamos/${solicitudB.id}/cancelar`,
    {},
  );
  assert.equal(cancelarAjeno.status, 409);

  const cancelarAprobadoCliente = await apiB(
    'PATCH',
    `/prestamos/${solicitudB.id}/cancelar`,
    {},
  );
  assert.equal(cancelarAprobadoCliente.status, 409);

  const canceladaBibliotecario = await apiBibliotecario(
    'PATCH',
    `/prestamos/${solicitudB.id}/cancelar`,
    { observaciones: 'Cancelado en mostrador' },
  );
  assert.equal(
    canceladaBibliotecario.status,
    200,
    JSON.stringify(canceladaBibliotecario.body),
  );
  assert.equal(canceladaBibliotecario.body.data.estado, 'CANCELADO');
  assert.equal(await disponibilidad(apiA, libro.id), 1);

  const prestado = await cicloHastaPrestado(apiA, apiBibliotecario, libro.id);
  const cancelarPrestado = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestado.id}/cancelar`,
    {},
  );
  assert.equal(cancelarPrestado.status, 409);
});

test('el catálogo usa baja lógica y bloquea eliminar con préstamos pendientes', async () => {
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const cliente = await crearCliente('baja-logica');
  const apiCliente = sesion(cliente.cookie);
  const libro = await crearLibro(apiBibliotecario, `Baja lógica ${STAMP}`);

  const prestamo = await crearPrestamo(apiCliente, libro.id);
  const bloqueada = await apiBibliotecario('DELETE', `/libros/${libro.id}`);
  assert.equal(bloqueada.status, 409, JSON.stringify(bloqueada.body));

  const cancelada = await apiBibliotecario(
    'PATCH',
    `/prestamos/${prestamo.id}/cancelar`,
    {},
  );
  assert.equal(cancelada.status, 200, JSON.stringify(cancelada.body));

  const eliminada = await apiBibliotecario('DELETE', `/libros/${libro.id}`);
  assert.equal(eliminada.status, 200, JSON.stringify(eliminada.body));

  const catalogoCliente = await apiCliente('GET', '/libros?pageSize=100');
  assert.ok(!catalogoCliente.body.data.some((fila) => fila.id === libro.id));

  // El cliente no puede ver libros inactivos ni forzando el parámetro.
  const forzado = await apiCliente(
    'GET',
    '/libros?pageSize=100&incluirInactivos=true',
  );
  assert.ok(!forzado.body.data.some((fila) => fila.id === libro.id));

  const catalogoStaff = await apiBibliotecario(
    'GET',
    '/libros?pageSize=100&incluirInactivos=true',
  );
  const fila = catalogoStaff.body.data.find((item) => item.id === libro.id);
  assert.ok(fila, 'El bibliotecario debe ver los libros eliminados.');
  assert.equal(fila.activo, false);
});

test('los reportes están restringidos, filtran por fechas y el cliente solo ve lo propio', async () => {
  const apiBibliotecario = sesion(bibliotecario.cookie);
  const apiAdmin = sesion(admin.cookie);
  const clienteA = await crearCliente('reporte-a');
  const clienteB = await crearCliente('reporte-b');
  const apiA = sesion(clienteA.cookie);
  const apiB = sesion(clienteB.cookie);
  const titulo = `Reporte único ${STAMP}`;
  const libro = await crearLibro(apiBibliotecario, titulo);

  const prestamoA = await crearPrestamo(apiA, libro.id);

  for (const reporte of ['libros', 'disponibilidad', 'prestamos']) {
    const denegado = await apiA('GET', `/reportes/${reporte}`);
    assert.equal(denegado.status, 403, `Reporte ${reporte} para cliente`);
  }

  for (const api of [apiBibliotecario, apiAdmin]) {
    for (const reporte of ['libros', 'disponibilidad', 'prestamos']) {
      const permitido = await api('GET', `/reportes/${reporte}`);
      assert.equal(
        permitido.status,
        200,
        `Reporte ${reporte}: ${JSON.stringify(permitido.body)}`,
      );
    }
  }

  const libros = await apiBibliotecario(
    'GET',
    `/reportes/libros?q=${encodeURIComponent(titulo)}`,
  );
  assert.equal(libros.status, 200);
  assert.equal(libros.body.data.resumen.totalLibros, 1);
  assert.equal(libros.body.data.libros[0].titulo, titulo);
  // La solicitud aún no reserva el ejemplar.
  assert.equal(libros.body.data.libros[0].disponibles, 1);

  const filtrado = await apiBibliotecario(
    'GET',
    `/reportes/prestamos?q=${encodeURIComponent(titulo)}`,
  );
  assert.equal(filtrado.status, 200);
  assert.equal(filtrado.body.data.resumen.totalPrestamos, 1);
  assert.equal(filtrado.body.data.resumen.limiteFilas, 1000);
  assert.equal(filtrado.body.data.prestamos[0].libro.titulo, titulo);

  const futuro = await apiBibliotecario(
    'GET',
    '/reportes/prestamos?desde=2099-01-01',
  );
  assert.equal(futuro.status, 200);
  assert.equal(futuro.body.data.resumen.totalPrestamos, 0);

  const pasado = await apiBibliotecario(
    'GET',
    '/reportes/prestamos?hasta=2000-01-01',
  );
  assert.equal(pasado.status, 200);
  assert.equal(pasado.body.data.resumen.totalPrestamos, 0);

  const listaA = await apiA('GET', '/prestamos?pageSize=100');
  assert.equal(listaA.status, 200);
  assert.ok(listaA.body.data.some((p) => p.id === prestamoA.id));
  assert.ok(listaA.body.data.every((p) => p.cliente.id === clienteA.usuario.id));

  const listaB = await apiB('GET', '/prestamos?pageSize=100');
  assert.equal(listaB.status, 200);
  assert.ok(!listaB.body.data.some((p) => p.id === prestamoA.id));

  const detalleAjeno = await apiB('GET', `/prestamos/${prestamoA.id}`);
  assert.equal(detalleAjeno.status, 404);

  const detallePropio = await apiA('GET', `/prestamos/${prestamoA.id}`);
  assert.equal(detallePropio.status, 200);
  assert.equal(detallePropio.body.data.estadoEfectivo, 'SOLICITADO');
});

test('el cliente actualiza sus datos personales y no puede cambiar rol ni tipo', async () => {
  const cliente = await crearCliente('perfil');
  const apiCliente = sesion(cliente.cookie);
  const nuevoEmail = `perfil.actualizado.${STAMP}@example.com`;

  const actualizado = await apiCliente('PATCH', '/perfil', {
    nombres: 'Nombre',
    apellidos: 'Actualizado',
    email: nuevoEmail,
    telefono: '0991112222',
    direccion: 'Av. Prueba 123',
    rol: 'ADMINISTRADOR',
    tipoCliente: 'INSTITUCION_EDUCATIVA',
    identificacion: 'CAMBIADA',
  });
  assert.equal(actualizado.status, 200, JSON.stringify(actualizado.body));
  assert.equal(actualizado.body.data.email, nuevoEmail);
  assert.equal(actualizado.body.data.rol, 'CLIENTE');
  assert.equal(actualizado.body.data.tipoCliente, 'LECTOR_GENERAL');
  assert.equal(
    actualizado.body.data.identificacion,
    cliente.usuario.identificacion,
  );
  assert.equal(actualizado.body.data.passwordHash, undefined);

  const otro = await crearCliente('perfil-duplicado');
  const duplicado = await apiCliente('PATCH', '/perfil', {
    email: otro.usuario.email,
  });
  assert.equal(duplicado.status, 409, JSON.stringify(duplicado.body));
});

test('el cliente solicita cambio a becario y el bibliotecario lo aprueba', async () => {
  const cliente = await crearCliente('solicitud-becario');
  const apiCliente = sesion(cliente.cookie);
  const apiBibliotecario = sesion(bibliotecario.cookie);

  const creada = await apiCliente('POST', '/solicitudes-tipo', {
    tipoSolicitado: 'BECARIO',
    documentoValidacion: 'Certificado de beca 2026-001',
    motivo: 'Beca académica vigente',
  });
  assert.equal(creada.status, 201, JSON.stringify(creada.body));
  assert.equal(creada.body.data.estado, 'PENDIENTE');
  assert.equal(creada.body.data.tipoSolicitado, 'BECARIO');

  const mias = await apiCliente('GET', '/solicitudes-tipo/mias');
  assert.equal(mias.status, 200);
  assert.equal(mias.body.data.length, 1);
  assert.equal(mias.body.data[0].id, creada.body.data.id);

  const duplicada = await apiCliente('POST', '/solicitudes-tipo', {
    tipoSolicitado: 'BECARIO',
    documentoValidacion: 'Otro documento',
  });
  assert.equal(duplicada.status, 409, JSON.stringify(duplicada.body));

  const revisarCliente = await apiCliente(
    'PATCH',
    `/solicitudes-tipo/${creada.body.data.id}/revisar`,
    { estado: 'APROBADA' },
  );
  assert.equal(revisarCliente.status, 403);

  const listado = await apiBibliotecario(
    'GET',
    '/solicitudes-tipo?estado=PENDIENTE',
  );
  assert.equal(listado.status, 200, JSON.stringify(listado.body));
  assert.ok(listado.body.data.some((solicitud) => solicitud.id === creada.body.data.id));

  const aprobada = await apiBibliotecario(
    'PATCH',
    `/solicitudes-tipo/${creada.body.data.id}/revisar`,
    { estado: 'APROBADA' },
  );
  assert.equal(aprobada.status, 200, JSON.stringify(aprobada.body));
  assert.equal(aprobada.body.data.estado, 'APROBADA');
  assert.equal(aprobada.body.data.revisadaPorId, bibliotecario.usuario.id);

  const perfil = await apiCliente('GET', '/perfil');
  assert.equal(perfil.status, 200);
  assert.equal(perfil.body.data.tipoCliente, 'BECARIO');
  assert.equal(
    perfil.body.data.documentoValidacion,
    'Certificado de beca 2026-001',
  );
  assert.equal(perfil.body.data.institucionNombre, null);

  const revisarOtraVez = await apiBibliotecario(
    'PATCH',
    `/solicitudes-tipo/${creada.body.data.id}/revisar`,
    { estado: 'RECHAZADA', observacionRevision: 'Ya revisada' },
  );
  assert.equal(revisarOtraVez.status, 409, JSON.stringify(revisarOtraVez.body));
});

test('la solicitud de institución exige datos, el rechazo conserva el tipo y se puede cancelar', async () => {
  const cliente = await crearCliente('solicitud-institucion');
  const apiCliente = sesion(cliente.cookie);
  const apiBibliotecario = sesion(bibliotecario.cookie);

  const incompleta = await apiCliente('POST', '/solicitudes-tipo', {
    tipoSolicitado: 'INSTITUCION_EDUCATIVA',
    documentoValidacion: 'Oficio 001',
  });
  assert.equal(incompleta.status, 400, JSON.stringify(incompleta.body));

  const creada = await apiCliente('POST', '/solicitudes-tipo', {
    tipoSolicitado: 'INSTITUCION_EDUCATIVA',
    documentoValidacion: 'Oficio 001',
    institucionNombre: 'Unidad Educativa G03',
    institucionRuc: '0999999999001',
    responsableNombre: 'Responsable de Prueba',
    responsableCargo: 'Rector',
    responsableEmail: 'responsable@example.com',
  });
  assert.equal(creada.status, 201, JSON.stringify(creada.body));

  const sinObservacion = await apiBibliotecario(
    'PATCH',
    `/solicitudes-tipo/${creada.body.data.id}/revisar`,
    { estado: 'RECHAZADA' },
  );
  assert.equal(sinObservacion.status, 400, JSON.stringify(sinObservacion.body));

  const rechazada = await apiBibliotecario(
    'PATCH',
    `/solicitudes-tipo/${creada.body.data.id}/revisar`,
    {
      estado: 'RECHAZADA',
      observacionRevision: 'El oficio no coincide con el RUC.',
    },
  );
  assert.equal(rechazada.status, 200, JSON.stringify(rechazada.body));
  assert.equal(rechazada.body.data.estado, 'RECHAZADA');

  const perfil = await apiCliente('GET', '/perfil');
  assert.equal(perfil.body.data.tipoCliente, 'LECTOR_GENERAL');
  assert.equal(perfil.body.data.institucionNombre, null);

  const nueva = await apiCliente('POST', '/solicitudes-tipo', {
    tipoSolicitado: 'INSTITUCION_EDUCATIVA',
    documentoValidacion: 'Oficio 002 corregido',
    institucionNombre: 'Unidad Educativa G03',
    responsableNombre: 'Responsable de Prueba',
  });
  assert.equal(nueva.status, 201, JSON.stringify(nueva.body));

  const cancelada = await apiCliente(
    'PATCH',
    `/solicitudes-tipo/${nueva.body.data.id}/cancelar`,
  );
  assert.equal(cancelada.status, 200, JSON.stringify(cancelada.body));
  assert.equal(cancelada.body.data.estado, 'CANCELADA');

  const otra = await apiCliente('POST', '/solicitudes-tipo', {
    tipoSolicitado: 'INSTITUCION_EDUCATIVA',
    documentoValidacion: 'Oficio 003',
    institucionNombre: 'Unidad Educativa G03',
    responsableNombre: 'Responsable de Prueba',
  });
  assert.equal(otra.status, 201, JSON.stringify(otra.body));

  const otro = await crearCliente('solicitud-ajena');
  const cancelarAjena = await sesion(otro.cookie)(
    'PATCH',
    `/solicitudes-tipo/${otra.body.data.id}/cancelar`,
  );
  assert.equal(cancelarAjena.status, 404, JSON.stringify(cancelarAjena.body));
});

test('el cliente adjunta documentos y solo el personal o el dueño puede descargarlos', async (t) => {
  const cliente = await crearCliente('solicitud-documentos');

  const formulario = new FormData();
  formulario.set('tipoSolicitado', 'BECARIO');
  formulario.set('motivo', 'Beca académica vigente');
  formulario.append(
    'documentos',
    new Blob([Buffer.from('%PDF-1.4 documento de prueba')], {
      type: 'application/pdf',
    }),
    'certificado-beca.pdf',
  );

  const respuesta = await fetch(`${baseUrl}/solicitudes-tipo`, {
    method: 'POST',
    headers: { Cookie: cliente.cookie },
    body: formulario,
  });
  const cuerpo = await respuesta.json();
  assert.equal(respuesta.status, 201, JSON.stringify(cuerpo));
  assert.equal(cuerpo.data.documentos.length, 1);

  const documento = cuerpo.data.documentos[0];
  assert.equal(documento.nombreOriginal, 'certificado-beca.pdf');
  assert.equal(documento.mimeType, 'application/pdf');

  const registro = await prisma.documentoSolicitudTipo.findUnique({
    where: { id: documento.id },
    select: { nombreArchivo: true },
  });

  t.after(async () => {
    await prisma.solicitudTipoCliente.deleteMany({
      where: { id: cuerpo.data.id },
    });
    await unlink(
      path.join(DIRECTORIO_DOCUMENTOS, registro.nombreArchivo),
    ).catch(() => undefined);
  });

  const descarga = await fetch(
    `${baseUrl}/solicitudes-tipo/${cuerpo.data.id}/documentos/${documento.id}`,
    { headers: { Cookie: bibliotecario.cookie } },
  );
  assert.equal(descarga.status, 200);
  assert.match(
    descarga.headers.get('content-disposition') ?? '',
    /certificado-beca\.pdf/,
  );
  const contenido = Buffer.from(await descarga.arrayBuffer()).toString('utf8');
  assert.match(contenido, /documento de prueba/);

  const otro = await crearCliente('solicitud-documentos-ajena');
  const prohibido = await fetch(
    `${baseUrl}/solicitudes-tipo/${cuerpo.data.id}/documentos/${documento.id}`,
    { headers: { Cookie: otro.cookie } },
  );
  assert.equal(prohibido.status, 404);
});
