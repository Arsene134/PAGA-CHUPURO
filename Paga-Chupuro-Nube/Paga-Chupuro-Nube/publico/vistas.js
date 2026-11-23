function switchView(id, tabEl) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("view-" + id).classList.add("active");
  if (tabEl) tabEl.classList.add("active");
  if (id === "contribuyente") buscarContribuyente();
  if (id === "tesoreria") renderTesoreria();
  if (id === "bodegas") renderBodega();
  if (id === "inicio") selectMapNode("b1");
}

function toggleMobile() {
  document.body.classList.toggle("mobile-view");
  document.getElementById("btnMobile").classList.toggle("active");
}

function showToast(htmlMsg) {
  const el = document.getElementById("toast");
  el.innerHTML = htmlMsg;
  el.classList.add("show");
  clearTimeout(window._t);
  window._t = setTimeout(() => el.classList.remove("show"), 4200);
}

function computeHash(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const x = n => (n >>> 0).toString(16).padStart(8, "0");
  return x(h) + x(h ^ 0x5a5a5a5a) + x(h * 31) + x(h ^ 0xa5a5a5a5) + x(h * 17) + x(h ^ 0x3c3c3c3c);
}

function createQrSvg(seed, fgColor) {
  const n = 21;
  let rects = "";
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let on = false;
      if (isFinder(r, c)) {
        const lr = r < 7 ? r : r - (n - 7), lc = c < 7 ? c : c - (n - 7);
        on = (lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4));
      } else {
        const v = Math.abs(Math.sin((r * 29 + c * 17 + hash) * 12.9898) * 43758.5453);
        on = (v - Math.floor(v)) > 0.47;
      }
      if (on) rects += `<rect x="${c * 7}" y="${r * 7}" width="7" height="7" fill="${fgColor}"/>`;
    }
  }
  return `<svg width="147" height="147" viewBox="0 0 147 147" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

/* ================= 1. INICIO Y MAPA ================= */
function consultarDesdeInicio() {
  const val = document.getElementById("heroDni").value.trim() || "00000001";
  document.getElementById("dniInput").value = val;
  switchView("contribuyente", document.querySelectorAll(".nav-tab")[1]);
  buscarContribuyente();
}

function selectMapNode(key) {
  const title = document.getElementById("mapTitle");
  const sub = document.getElementById("mapSub");
  const badge = document.getElementById("mapBadge");
  const body = document.getElementById("mapBody");
  const actions = document.getElementById("mapActions");

  if (key === "muni") {
    const rev = transactions.reduce((s, x) => s + x.monto, 0);
    title.textContent = "Palacio Municipal de Chupuro";
    sub.textContent = "Subgerencia de Rentas y Tesorería · Plaza Principal";
    badge.textContent = "Sede central";
    body.innerHTML = `
      <p style="margin-bottom:12px;">Recibe en tiempo real los pagos efectuados desde el portal web, Yape QR y la red de 5 bodegas autorizadas, emitiendo el cuadre contable diario.</p>
      <div class="kv-row"><span>Recaudación conciliada hoy</span><strong class="num" style="color:var(--ok);">S/ ${rev.toFixed(2)}</strong></div>
      <div class="kv-row"><span>Operaciones registradas</span><strong class="num">${transactions.length}</strong></div>
      <div class="kv-row"><span>Horario presencial</span><strong>Lun–Vie · 8:00 a.m. a 4:30 p.m.</strong></div>
    `;
    actions.innerHTML = `<button class="btn btn-navy btn-sm" onclick="switchView('tesoreria', document.querySelectorAll('.nav-tab')[3])">Ir a Tesorería y Rentas</button>`;
    return;
  }

  const b = BODEGAS[key];
  const ops = transactions.filter(t => t.bodegaId === key);
  const sum = ops.reduce((s, x) => s + x.monto, 0);
  title.textContent = b.name;
  sub.textContent = `${b.sector} · ${b.addr}`;
  badge.textContent = "Agente BCP activo";
  body.innerHTML = `
    <p style="margin-bottom:12px;">${b.note}</p>
    <div class="kv-row"><span>Horario de atención</span><strong>${b.hours}</strong></div>
    <div class="kv-row"><span>Titular del comercio</span><strong>${b.owner}</strong></div>
    <div class="kv-row"><span>Conectividad</span><strong>${b.conn}</strong></div>
    <div class="kv-row"><span>Recaudación del turno</span><strong class="num">S/ ${sum.toFixed(2)} (${ops.length} op.)</strong></div>
  `;
  actions.innerHTML = `
    <button class="btn btn-accent btn-sm" onclick="abrirBodega('${b.id}')">Abrir ventanilla de esta bodega</button>
    <button class="btn btn-ghost btn-sm" onclick="switchView('contribuyente', document.querySelectorAll('.nav-tab')[1])">Pagar en línea</button>
  `;
}

function abrirBodega(id) {
  document.getElementById("bodegaSelect").value = id;
  switchView("bodegas", document.querySelectorAll(".nav-tab")[2]);
  renderBodega();
}

/* ================= 2. PORTAL CONTRIBUYENTE ================= */
function cargarDni(dni) {
  document.getElementById("dniInput").value = dni;
  buscarContribuyente();
}

function buscarContribuyente() {
  cancelarOrden();
  activeTp = null;
  const q = document.getElementById("dniInput").value.trim().toUpperCase();
  const tp = taxpayers.find(t => t.dni === q || t.predio.toUpperCase() === q);
  const card = document.getElementById("tpResultCard");
  if (!tp) {
    card.style.display = "none";
    showToast("No se encontró ningún registro para el DNI o predio ingresado.");
    return;
  }
  activeTp = tp;
  card.style.display = "block";
  document.getElementById("tpName").textContent = tp.nombre;
  document.getElementById("tpMeta").textContent = `DNI ${tp.dni} · Predio ${tp.predio} · ${tp.sector}`;

  const pending = tp.deudas.filter(d => !d.pagado).length;
  const st = document.getElementById("tpStatus");
  st.textContent = pending ? `${pending} recibo(s) pendiente(s)` : "Sin deuda pendiente";
  st.className = "badge " + (pending ? "bg-warn" : "bg-ok");

  document.getElementById("tpDebtsBody").innerHTML = tp.deudas.map(d => `
    <tr>
      <td><input type="checkbox" class="debt-cb" value="${d.id}" ${d.pagado ? "disabled" : "checked"} onchange="actualizarTotalPago()"></td>
      <td><strong>${d.concepto}</strong></td>
      <td>${d.periodo}</td>
      <td class="num" style="text-align:right;"><strong>S/ ${d.monto.toFixed(2)}</strong></td>
      <td><span class="badge ${d.pagado ? "bg-ok" : "bg-warn"}">${d.pagado ? "Pagado" : "Pendiente"}</span></td>
    </tr>
  `).join("");

  actualizarTotalPago();
}

function actualizarTotalPago() {
  cancelarOrden();
  if (!activeTp) return;
  const checked = Array.from(document.querySelectorAll(".debt-cb:checked"));
  const sum = checked.reduce((acc, el) => {
    const item = activeTp.deudas.find(d => d.id === el.value);
    return acc + (item ? item.monto : 0);
  }, 0);
  document.getElementById("tpTotal").textContent = `S/ ${sum.toFixed(2)}`;
  const allow = sum > 0 && document.getElementById("chkLey").checked;
  document.getElementById("btnYape").disabled = !allow;
  document.getElementById("btnBcp").disabled = !allow;
}

function abrirCheckout(canal) {
  const ids = Array.from(document.querySelectorAll(".debt-cb:checked")).map(el => el.value);
  if (!ids.length) return;
  const total = activeTp.deudas.filter(d => ids.includes(d.id)).reduce((s, x) => s + x.monto, 0);
  const orderCode = `OP-${Date.now().toString().slice(-6)}`;
  pendingPay = { vence: Date.now() + 300000, dni: activeTp.dni, ids, total, canal, orderCode };

  document.getElementById("payIdle").style.display = "none";
  document.getElementById("payActive").style.display = "block";
  document.getElementById("voucherCard").style.display = "none";

  const isYape = canal === "Yape QR";
  document.getElementById("checkoutBox").className = "checkout-panel " + (isYape ? "is-yape" : "is-bcp");
  document.getElementById("ckTitle").textContent = isYape ? "Código de demostración Yape" : "Orden de pago — Pasarela BCP";
  document.getElementById("ckOrder").textContent = `Referencia ${orderCode} · ${activeTp.nombre}`;
  document.getElementById("ckAmount").textContent = `S/ ${total.toFixed(2)}`;
  document.getElementById("ckQr").innerHTML = createQrSvg(orderCode + total, isYape ? "#682578" : "#122642");

  // Temporizador realista de vigencia (5 minutos)
  clearInterval(timerInterval);
  let secs = 299;
  const tEl = document.getElementById("ckTimer");
  tEl.textContent = "04:59";
  timerInterval = setInterval(() => {
    secs = Math.max(0, Math.ceil((pendingPay.vence - Date.now()) / 1000));
    if (!secs) { cancelarOrden(); showToast("La orden venció. Genere una nueva."); return; }
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    tEl.textContent = `${mm}:${ss}`;
  }, 1000);
}

function setNet(mode) {
  netState = mode;
  document.getElementById("np3g").className = "net-pill" + (mode === "3g" ? " on-ok" : "");
  document.getElementById("npOff").className = "net-pill" + (mode === "off" ? " on-err" : "");
  document.getElementById("np4g").className = "net-pill" + (mode === "4g" ? " on-warn" : "");

  const lbl = document.getElementById("netLabel");
  const ban = document.getElementById("offlineBanner");
  if (mode === "3g") {
    lbl.textContent = "Red móvil 3G operativa";
    lbl.style.color = "var(--ok)";
    ban.style.display = "none";
  } else if (mode === "off") {
    lbl.textContent = "Sin señal de datos";
    lbl.style.color = "var(--err)";
    ban.style.display = "flex";
  } else {
    lbl.textContent = "Conectado vía módem 4G de respaldo";
    lbl.style.color = "var(--warn)";
    ban.style.display = "none";
  }
}

function buscarEnBodega() {
  if (netState === "off") {
    showToast("Sin conexión disponible. Active el módem 4G de respaldo para consultar.");
    return;
  }
  const q = document.getElementById("agDni").value.trim().toUpperCase();
  const tp = taxpayers.find(t => t.dni === q || t.predio.toUpperCase() === q);
  const card = document.getElementById("agCard");
  if (!tp) {
    card.style.display = "none";
    showToast("No se encontraron registros para el DNI consultado.");
    return;
  }
  card.style.display = "block";
  document.getElementById("agName").textContent = tp.nombre;
  document.getElementById("agMeta").textContent = `DNI ${tp.dni} · Predio ${tp.predio} · ${tp.sector}`;
  document.getElementById("agBody").innerHTML = tp.deudas.map(d => `
    <tr>
      <td><strong>${d.concepto}</strong></td>
      <td>${d.periodo}</td>
      <td class="num" style="text-align:right;"><strong>S/ ${d.monto.toFixed(2)}</strong></td>
      <td style="text-align:right;">
        ${d.pagado
          ? '<span class="badge bg-ok">Pagado</span>'
          : `<button class="btn btn-ok btn-sm" onclick="cobrarBodega('${tp.dni}','${d.id}')">Registrar cobro</button>`}
      </td>
    </tr>
  `).join("");
}

function renderBodega() {
  const bid = document.getElementById("bodegaSelect").value;
  const info = BODEGAS[bid];
  document.getElementById("agCloseReceipt").style.display = "none";
  document.getElementById("agTurnBadge").textContent = "Turno abierto";
  document.getElementById("agStoreName").textContent = `${info.name} · ${info.sector}`;
  document.getElementById("agStoreDetails").innerHTML = `
    <div class="kv-row"><span>Dirección</span><strong>${info.addr}</strong></div>
    <div class="kv-row"><span>Titular</span><strong>${info.owner}</strong></div>
    <div class="kv-row"><span>Horario</span><strong>${info.hours}</strong></div>
    <div class="kv-row"><span>Enlace</span><strong>${info.conn}</strong></div>
  `;

  const list = transactions.filter(t => t.bodegaId === bid && !t.cerrado);
  const sum = list.reduce((s, x) => s + x.monto, 0);
  document.getElementById("agCash").textContent = `S/ ${sum.toFixed(2)}`;
  document.getElementById("agCount").textContent = list.length;

  const tbody = document.getElementById("agHistory");
  tbody.innerHTML = list.length
    ? list.map(t => `
        <tr>
          <td class="num">${t.fecha.split(" ")[1] || t.fecha}</td>
          <td>${t.nombre}</td>
          <td class="num" style="text-align:right;"><strong>S/ ${t.monto.toFixed(2)}</strong></td>
          <td><span class="badge bg-navy num">${t.id}</span></td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:16px;">Sin cobros registrados en este turno.</td></tr>`;
}

function switchTesTab(sub, btn) {
  document.querySelectorAll(".sub-tab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.getElementById("tes-recaudacion").style.display = sub === "recaudacion" ? "block" : "none";
  document.getElementById("tes-padron").style.display = sub === "padron" ? "block" : "none";
  if (sub === "padron") renderPadron();
}

function renderTesoreria() {
  const total = transactions.reduce((s, x) => s + x.monto, 0);
  document.getElementById("kpiRev").textContent = `S/ ${total.toFixed(2)}`;
  document.getElementById("kpiOps").textContent = transactions.length;

  const canales = [
    { name: "Yape QR", color: "#682578" },
    { name: "Pasarela BCP", color: "#002a8d" },
    { name: "Agente BCP", color: "#c45a16" }
  ];
  document.getElementById("barsCanal").innerHTML = canales.map(c => {
    const s = transactions.filter(t => t.canal === c.name).reduce((a, b) => a + b.monto, 0);
    const pct = total ? Math.round((s / total) * 100) : 0;
    return `
      <div class="bar-row">
        <div class="bar-head"><span>${c.name}</span><span class="num">S/ ${s.toFixed(2)} (${pct}%)</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${c.color};"></div></div>
      </div>
    `;
  }).join("");

  const sectores = ["Chupuro Centro", "Barrio San Juan", "Sector Socos", "Anexo Carhuapaccha"];
  document.getElementById("barsSector").innerHTML = sectores.map(sec => {
    const s = transactions.filter(t => t.sector === sec).reduce((a, b) => a + b.monto, 0);
    const pct = total ? Math.round((s / total) * 100) : 0;
    return `
      <div class="bar-row">
        <div class="bar-head"><span>${sec}</span><span class="num">S/ ${s.toFixed(2)} (${pct}%)</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:#146347;"></div></div>
      </div>
    `;
  }).join("");

  document.getElementById("tesTxBody").innerHTML = transactions.map(t => {
    const cls = t.canal === "Yape QR" ? "bg-yape" : (t.canal === "Pasarela BCP" ? "bg-navy" : "bg-accent");
    return `
      <tr>
        <td class="num"><strong>${t.id}</strong></td>
        <td>${t.nombre}</td>
        <td><span class="badge ${cls}">${t.canal}</span></td>
        <td class="num" style="text-align:right;"><strong>S/ ${t.monto.toFixed(2)}</strong></td>
      </tr>
    `;
  }).join("");

  renderPadron();
}

function conciliarBcp() {
  document.getElementById("concilResult").style.display = "block";
  showToast("Conciliación de ejemplo: 100% de operaciones cuadradas.");
}

function setPadronMode(mode) {
  padronMode = mode;
  document.getElementById("btnPadClean").className = "btn btn-sm " + (mode === "clean" ? "btn-navy" : "btn-ghost");
  document.getElementById("btnPadLegacy").className = "btn btn-sm " + (mode === "legacy" ? "btn-navy" : "btn-ghost");
  document.getElementById("padControls").style.display = mode === "clean" ? "flex" : "none";
  renderPadron();
}

function renderPadron() {
  const notice = document.getElementById("padNotice");
  const wrap = document.getElementById("padTableWrap");

  if (padronMode === "legacy") {
    notice.style.background = "var(--warn-bg)";
    notice.style.color = "var(--warn)";
    notice.innerHTML = "<strong>Auditoría de saneamiento:</strong> Muestra de registros históricos con inconsistencias detectadas en libros físicos y hojas de cálculo antes de la migración definitiva.";
    wrap.innerHTML = `
      <table>
        <thead><tr><th>Cód. anterior</th><th>DNI registrado</th><th>Nombre original</th><th>Sector</th><th>Observación detectada</th><th>Corrección aplicada</th></tr></thead>
        <tbody>
          ${LEGACY_ISSUES.map(r => `
            <tr>
              <td class="num"><span class="badge bg-err">${r.cod}</span></td>
              <td class="num">${r.dni}</td>
              <td>${r.nom}</td>
              <td>${r.sec}</td>
              <td style="color:var(--err);">${r.obs}</td>
              <td style="color:var(--ok); font-weight:600;">${r.acc}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    return;
  }

  notice.style.background = "var(--ok-bg)";
  notice.style.color = "var(--ok)";
  notice.innerHTML = "<strong>Padrón vigente normalizado:</strong> 87.5% de registros depurados, 0% duplicados y 100% de campos obligatorios validados.";

  const sec = document.getElementById("filSector").value;
  const est = document.getElementById("filEstado").value;
  const filtered = taxpayers.filter(tp => {
    const pend = tp.deudas.filter(d => !d.pagado).reduce((s, x) => s + x.monto, 0);
    const st = pend > 0 ? "Pendiente" : "Al día";
    return (sec === "ALL" || tp.sector === sec) && (est === "ALL" || st === est);
  });

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Predio</th><th>DNI</th><th>Contribuyente</th><th>Sector</th><th>Calidad</th><th style="text-align:right;">Saldo pendiente</th><th>Situación</th></tr></thead>
      <tbody>
        ${filtered.map(tp => {
          const pend = tp.deudas.filter(d => !d.pagado).reduce((s, x) => s + x.monto, 0);
          return `
            <tr>
              <td class="num"><strong>${tp.predio}</strong></td>
              <td class="num">${tp.dni}</td>
              <td>${tp.nombre}</td>
              <td>${tp.sector}</td>
              <td><span class="badge bg-ok">${tp.etl}</span></td>
              <td class="num" style="text-align:right;"><strong>S/ ${pend.toFixed(2)}</strong></td>
              <td><span class="badge ${pend > 0 ? "bg-warn" : "bg-ok"}">${pend > 0 ? "Pendiente" : "Al día"}</span></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

/* ================= 5. CENTRO TÉCNICO TI ================= */
function testEndpoint(kind) {
  const out = document.getElementById("jsonOut");
  const lat = kind === "padron" ? 318 : (kind === "yape" ? 442 : 284);
  document.getElementById("tiLatency").textContent = `${lat} ms`;
  const sig = computeHash(kind + Date.now()).slice(0, 42);

  if (kind === "padron") {
    out.innerHTML = `<span class="j-m">GET</span> <span class="j-s">https://pagos.munichupuro.gob.pe/api/v1/padron/00000001</span>
<span class="j-k">Status:</span> <span class="j-s">200 OK</span> · <span class="j-n">${lat} ms</span> · TLS 1.3
<span class="j-k">X-Signature-SHA256:</span> <span class="j-s">${sig}</span>
{
  <span class="j-k">"predio"</span>: <span class="j-s">"P-001"</span>,
  <span class="j-k">"contribuyente"</span>: <span class="j-s">"Contribuyente Demo 01"</span>,
  <span class="j-k">"sector"</span>: <span class="j-s">"Chupuro Centro"</span>,
  <span class="j-k">"estado_padron"</span>: <span class="j-s">"VALIDADO"</span>,
  <span class="j-k">"saldo_pendiente_pen"</span>: <span class="j-n">133.50</span>
}`;
  } else if (kind === "yape") {
    out.innerHTML = `<span class="j-m">POST</span> <span class="j-s">https://api.bcp.com.pe/yape/v2/qr-dinamico</span>
<span class="j-k">Status:</span> <span class="j-s">201 Created</span> · <span class="j-n">${lat} ms</span> · TLS 1.3
<span class="j-k">X-Signature-SHA256:</span> <span class="j-s">${sig}</span>
{
  <span class="j-k">"convenio"</span>: <span class="j-s">"MUNI-CHUPURO-BCP-2026"</span>,
  <span class="j-k">"orden_id"</span>: <span class="j-s">"OP-882941"</span>,
  <span class="j-k">"monto_pen"</span>: <span class="j-n">85.50</span>,
  <span class="j-k">"vigencia_seg"</span>: <span class="j-n">300</span>,
  <span class="j-k">"estado"</span>: <span class="j-s">"GENERADO"</span>
}`;
  } else {
    out.innerHTML = `<span class="j-m">POST</span> <span class="j-s">https://pagos.munichupuro.gob.pe/api/v1/bcp/conciliar</span>
<span class="j-k">Status:</span> <span class="j-s">200 OK</span> · <span class="j-n">${lat} ms</span> · ACID Commit
<span class="j-k">X-Signature-SHA256:</span> <span class="j-s">${sig}</span>
{
  <span class="j-k">"comprobante"</span>: <span class="j-s">"CP-2026-0004"</span>,
  <span class="j-k">"conciliacion"</span>: <span class="j-s">"CONCILIADO"</span>,
  <span class="j-k">"descuadre_pen"</span>: <span class="j-n">0.00</span>,
  <span class="j-k">"notificacion_sms"</span>: <span class="j-s">"ENTREGADO"</span>
}`;
  }
}

function verifySecurity() {
  showToast("Controles propuestos para producción. Esta pantalla técnica muestra ejemplos simulados.");
}
