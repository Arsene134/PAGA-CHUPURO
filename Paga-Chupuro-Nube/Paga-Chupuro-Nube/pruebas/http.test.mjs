import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

test('El portal, el cobro y Tesorería comparten el estado del servidor', async t => {
  const servidor = spawn(process.execPath,[fileURLToPath(new URL('../servidor.mjs',import.meta.url))], {
    env:{ ...process.env, HOST:'0.0.0.0', PORT:'0', PUBLIC_ORIGIN:'https://prueba.example', CHUPURO_DB:':memory:' }, windowsHide:true
  });
  t.after(() => servidor.kill());
  const [inicio] = await once(servidor.stdout,'data');
  const base = inicio.toString().match(/http:\/\/\S+/)[0];
  const pagina = await (await fetch(base)).text();
  for (const [,ruta] of pagina.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    assert.equal((await fetch(base+ruta)).status,200);
  }
  const cobrar = () => fetch(base+'/api/cobros',{method:'POST',headers:{'Content-Type':'application/json', Origin:'https://prueba.example'},
    body:JSON.stringify({dni:'00000001',ids:['D-101','D-102'],canal:'Yape QR',monto:0.01})});
  const respuestas = await Promise.all([cobrar(),cobrar()]);
  assert.deepEqual(respuestas.map(r=>r.status).sort(),[201,409]);
  const estado = await (await fetch(base+'/api/estado')).json();
  assert.equal(estado.transactions.length,4);
  assert.equal(estado.transactions[0].monto,133.50);
  assert.equal(estado.transactions.reduce((s,op)=>s+op.monto,0),403.50);
});