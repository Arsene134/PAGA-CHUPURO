import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { SEED_TAXPAYERS, SEED_TX, BODEGAS } from './datos.mjs';

export class Regla extends Error {}

export class Recaudacion {
  constructor(archivo) {
    this.db = new DatabaseSync(archivo);
    this.db.exec(`PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS recibos(id TEXT PRIMARY KEY, dni TEXT NOT NULL, centimos INTEGER NOT NULL, pagado INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS operaciones(numero INTEGER PRIMARY KEY, datos TEXT NOT NULL, bodega TEXT NOT NULL, cerrado INTEGER NOT NULL DEFAULT 0);`);
    if (!this.db.prepare('SELECT 1 FROM recibos LIMIT 1').get()) this.reiniciar();
  }

  atomico(accion) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const resultado = accion();
      this.db.exec('COMMIT');
      return resultado;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  reiniciar() {
    this.atomico(() => {
      this.db.exec('DELETE FROM recibos; DELETE FROM operaciones;');
      const insertar = this.db.prepare('INSERT INTO recibos VALUES (?,?,?,?)');
      for (const persona of SEED_TAXPAYERS) {
        for (const deuda of persona.deudas) {
          insertar.run(deuda.id, persona.dni, Math.round(deuda.monto * 100), Number(deuda.pagado));
        }
      }
      for (const pago of SEED_TX) this.guardar(pago);
    });
  }

  guardar(pago) {
    this.db.prepare('INSERT INTO operaciones(datos,bodega) VALUES (?,?)').run(JSON.stringify(pago), pago.bodegaId);
  }

  estado() {
    const personas = structuredClone(SEED_TAXPAYERS);
    const pagados = new Set(this.db.prepare('SELECT id FROM recibos WHERE pagado=1').all().map(r => r.id));
    for (const persona of personas) {
      for (const deuda of persona.deudas) deuda.pagado = pagados.has(deuda.id);
    }
    const transactions = this.db.prepare('SELECT datos,cerrado FROM operaciones ORDER BY numero DESC').all()
      .map(r => ({ ...JSON.parse(r.datos), cerrado: Boolean(r.cerrado) }));
    return { taxpayers: personas, transactions };
  }

  cobrar({ dni, ids, canal, bodegaId = '' }) {
    const persona = SEED_TAXPAYERS.find(p => p.dni === dni);
    if (!persona || !Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length)
      throw new Regla('Seleccione recibos válidos del contribuyente.');
    if (!['Yape QR','Pasarela BCP','Agente BCP'].includes(canal) ||
        (canal === 'Agente BCP' ? !Object.hasOwn(BODEGAS,bodegaId) : bodegaId !== ''))
      throw new Regla('Canal o bodega inválidos.');

    return this.atomico(() => {
      const aplicar = this.db.prepare('UPDATE recibos SET pagado=1 WHERE dni=? AND id=? AND pagado=0 RETURNING centimos');
      let centimos = 0;
      for (const id of ids) {
        const recibo = aplicar.get(dni, id);
        if (!recibo) throw new Regla('Un recibo ya fue pagado o no pertenece al contribuyente.');
        centimos += recibo.centimos;
      }
      const siguiente = this.db.prepare('SELECT COALESCE(MAX(numero),0)+1 AS n FROM operaciones').get().n;
      const id = 'CP-2026-' + String(siguiente).padStart(4,'0');
      const fecha = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
      const pago = { id, fecha, dni, nombre: persona.nombre, sector: persona.sector, ids, canal, bodegaId, monto: centimos/100 };
      pago.hash = createHash('sha256').update(JSON.stringify(pago)).digest('hex');
      this.guardar(pago);
      return pago;
    });
  }

  cerrar(bodega) {
    if (!Object.hasOwn(BODEGAS,bodega)) throw new Regla('Bodega inválida.');
    return this.atomico(() => {
      const filas = this.db.prepare('UPDATE operaciones SET cerrado=1 WHERE bodega=? AND cerrado=0 RETURNING datos').all(bodega);
      if (!filas.length) throw new Regla('El turno no tiene cobros pendientes.');
      const centimos = filas.reduce((s,r) => s + Math.round(JSON.parse(r.datos).monto*100),0);
      return { cantidad: filas.length, monto: centimos/100 };
    });
  }
}