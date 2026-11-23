let taxpayers = [];
let transactions = [];
let activeTp = null;
let pendingPay = null;
let timerInterval = null;
let netState = '3g';
let padronMode = 'clean';
let ocupado = false;
const elemento = id => document.getElementById(id);

async function api(ruta, datos) {
  const opciones = datos === undefined ? {} : {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(datos)
  };
  const respuesta = await fetch('/api/'+ruta, opciones);
  const contenido = await respuesta.json();
  if (!respuesta.ok) throw new Error(contenido.error);
  return contenido;
}

async function actualizar() {
  ({taxpayers, transactions} = await api('estado'));
  buscarContribuyente();
  renderBodega();
  if (netState !== 'off' && elemento('agDni').value.trim()) buscarEnBodega();
  renderTesoreria();
}

async function ejecutar(accion) {
  if (ocupado) return;
  ocupado = true;
  try {
    await accion();
  } catch (error) {
    try { await actualizar(); } catch { /* El usuario puede reintentar al recuperar la conexión. */ }
    showToast(error.message);
  } finally {
    ocupado = false;
  }
}

function cancelarOrden() {
  clearInterval(timerInterval);
  pendingPay = null;
  elemento('payActive').style.display = 'none';
  elemento('payIdle').style.display = 'block';
}

function procesarPagoDigital() {
  const orden = pendingPay;
  if (!orden || !elemento('chkLey').checked) return;
  if (Date.now() >= orden.vence) {
    cancelarOrden();
    return showToast('La orden venció. Genere una nueva.');
  }
  return ejecutar(async () => {
    const pago = await api('cobros', {dni:orden.dni, ids:orden.ids, canal:orden.canal});
    cancelarOrden();
    await actualizar();
    const persona = taxpayers.find(p => p.dni === pago.dni);
    elemento('voucherCard').style.display = 'block';
    elemento('vNum').textContent = 'COMPROBANTE N.° '+pago.id+' · PAGADO';
    const detalles = elemento('vDetails');
    detalles.replaceChildren();
    for (const [etiqueta,valor] of Object.entries({
      Fecha:pago.fecha, Contribuyente:pago.nombre, DNI:pago.dni, Predio:persona.predio,
      Sector:pago.sector, Canal:pago.canal, Total:'S/ '+pago.monto.toFixed(2)
    })) {
      const fila = document.createElement('div');
      fila.className = 'kv-row';
      const nombre = document.createElement('span');
      const dato = document.createElement('strong');
      nombre.textContent = etiqueta;
      dato.textContent = valor;
      fila.append(nombre,dato);
      detalles.append(fila);
    }
    elemento('vHash').textContent = 'Huella SHA-256: '+pago.hash;
    elemento('vSmsTel').textContent = 'Cel. '+persona.tel;
    elemento('vSmsMsg').textContent = 'SMS simulado · Pago de S/ '+pago.monto.toFixed(2)+' registrado en '+pago.id+'.';
    showToast('Pago de demostración registrado.');
  });
}

function cobrarBodega(dni,id) {
  if (netState === 'off') return showToast('Active el módem de respaldo para cobrar.');
  const bodegaId = elemento('bodegaSelect').value;
  return ejecutar(async () => {
    const pago = await api('cobros',{dni,ids:[id],canal:'Agente BCP',bodegaId});
    await actualizar();
    showToast('Cobro registrado · '+pago.id+' · S/ '+pago.monto.toFixed(2));
  });
}

function liquidarTurno() {
  if (netState === 'off') return showToast('Active el módem de respaldo para cerrar el turno.');
  const bodega = elemento('bodegaSelect').value;
  return ejecutar(async () => {
    const cierre = await api('cierres',{bodega});
    await actualizar();
    if (elemento('bodegaSelect').value !== bodega) return;
    elemento('agTurnBadge').textContent = 'Lote liquidado';
    const comprobante = elemento('agCloseReceipt');
    comprobante.textContent = BODEGAS[bodega].name+' · '+cierre.cantidad+' cobro(s) liquidados por S/ '+cierre.monto.toFixed(2);
    comprobante.style.display = 'block';
  });
}

function resetState() {
  if (!confirm('¿Restaurar los datos de demostración y eliminar los cobros nuevos?')) return;
  return ejecutar(async () => {
    await api('reinicio',{});
    location.reload();
  });
}

selectMapNode('b1');
ejecutar(actualizar);