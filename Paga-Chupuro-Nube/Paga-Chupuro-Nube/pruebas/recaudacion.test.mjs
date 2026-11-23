import test from 'node:test';
import assert from 'node:assert/strict';
import { Recaudacion, Regla } from '../modelo/recaudacion.mjs';

const orden = { dni:'00000001', ids:['D-101','D-102'], canal:'Yape QR' };
function modelo(t) {
  const m = new Recaudacion(':memory:');
  t.after(() => m.db.close());
  return m;
}
test('Dos recibos en un comprobante por S/ 133,50', t => {
  const m = modelo(t);
  const tx = m.cobrar(orden);
  assert.equal(tx.monto,133.50);
  assert.match(tx.hash,/^[a-f0-9]{64}$/);
  assert.equal(m.estado().transactions.length,4);
  assert.ok(m.estado().taxpayers[0].deudas.every(d => d.pagado));
  assert.throws(() => m.cobrar(orden),Regla);
});
test('Un cobro en bodega invalida toda la orden digital previa', t => {
  const m = modelo(t);
  m.cobrar({...orden,ids:['D-102'],canal:'Agente BCP',bodegaId:'b2'});
  assert.throws(() => m.cobrar(orden),Regla);
  assert.equal(m.estado().taxpayers[0].deudas[0].pagado,false);
  assert.equal(m.estado().transactions.length,4);
});
test('Cada bodega cierra únicamente sus cobros abiertos', t => {
  const m = modelo(t);
  m.cobrar({...orden,canal:'Agente BCP',bodegaId:'b2'});
  assert.deepEqual(m.cerrar('b2'),{cantidad:1,monto:133.5});
  assert.throws(() => m.cerrar('b2'),Regla);
  assert.deepEqual(m.cerrar('b1'),{cantidad:1,monto:52});
  assert.equal(m.estado().transactions.length,4);
});
test('Rechaza documentos ajenos, recibos repetidos y canales inválidos', t => {
  const m = modelo(t);
  for (const cambio of [{ids:['D-201']},{ids:['D-101','D-101']},{canal:'Otro'},{canal:'Agente BCP',bodegaId:'b99'}]) {
    assert.throws(() => m.cobrar({...orden,...cambio}),Regla);
  }
  assert.equal(m.estado().transactions.length,3);
});
test('El reinicio recupera los saldos iniciales', t => {
  const m = modelo(t);
  const inicial = m.estado();
  m.cobrar(orden);
  m.reiniciar();
  assert.deepEqual(m.estado(),inicial);
});