import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoEfectivo, sumarDias } from '../src/utils/dates.js';
import { DIAS_POR_VENCER } from '../src/utils/constants.js';

const AHORA = new Date('2026-06-15T12:00:00.000Z');
const MS_DIA = 24 * 60 * 60 * 1000;

function conLimite(estado, diasDesdeAhora) {
  return {
    estado,
    fechaLimite: new Date(AHORA.getTime() + diasDesdeAhora * MS_DIA),
  };
}

test('sumarDias conserva la hora y suma días calendario', () => {
  const resultado = sumarDias(AHORA, 15);
  assert.equal(resultado.getTime() - AHORA.getTime(), 15 * MS_DIA);
});

test('los estados terminales no se derivan a Por vencer ni Vencido', () => {
  for (const estado of [
    'SOLICITADO',
    'APROBADO',
    'DEVUELTO',
    'DEVUELTO_CON_RETRASO',
    'CANCELADO',
    'PERDIDO',
  ]) {
    assert.equal(estadoEfectivo(conLimite(estado, -10), AHORA), estado);
    assert.equal(estadoEfectivo(conLimite(estado, 1), AHORA), estado);
  }
});

test('un préstamo activo sin fecha límite conserva su estado persistido', () => {
  assert.equal(estadoEfectivo({ estado: 'PRESTADO', fechaLimite: null }, AHORA), 'PRESTADO');
});

test('Por vencer se calcula dentro de los días configurados', () => {
  assert.equal(
    estadoEfectivo(conLimite('PRESTADO', DIAS_POR_VENCER), AHORA),
    'POR_VENCER',
  );
  assert.equal(
    estadoEfectivo(conLimite('RENOVADO', DIAS_POR_VENCER - 1), AHORA),
    'POR_VENCER',
  );
});

test('un préstamo activo fuera del umbral sigue Prestado o Renovado', () => {
  assert.equal(
    estadoEfectivo(conLimite('PRESTADO', DIAS_POR_VENCER + 1), AHORA),
    'PRESTADO',
  );
  assert.equal(
    estadoEfectivo(conLimite('RENOVADO', DIAS_POR_VENCER + 10), AHORA),
    'RENOVADO',
  );
});

test('Vencido prevalece cuando la fecha límite ya pasó', () => {
  assert.equal(estadoEfectivo(conLimite('PRESTADO', -0.01), AHORA), 'VENCIDO');
  assert.equal(estadoEfectivo(conLimite('RENOVADO', -30), AHORA), 'VENCIDO');
});
