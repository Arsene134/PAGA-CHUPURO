const BODEGAS = {
  b1: {
    id: "b1", name: "Bodega 01 — Minimarket Plaza Principal", sector: "Chupuro Centro",
    addr: "Jr. Lima 104, frente a la Plaza Principal", hours: "Lunes a Domingo · 7:00 a.m. a 9:00 p.m.",
    owner: "Agente Demo 1", conn: "4G estable con módem de respaldo",
    note: "Punto céntrico de mayor afluencia para vecinos del casco urbano y adultos mayores."
  },
  b2: {
    id: "b2", name: "Bodega 02 — Comercial San Juan", sector: "Barrio San Juan",
    addr: "Av. San Juan Mz. B Lt. 12", hours: "Lunes a Domingo · 7:30 a.m. a 8:30 p.m.",
    owner: "Agente Demo 2", conn: "3G / 4G operativa",
    note: "Cobertura directa para las familias del Barrio San Juan sin desplazamientos al centro."
  },
  b3: {
    id: "b3", name: "Bodega 03 — Bodega Los Andes", sector: "Sector Socos",
    addr: "Camino Real Sector Socos Km 1.5", hours: "Lunes a Sábado · 7:00 a.m. a 8:00 p.m.",
    owner: "Agente Demo 3", conn: "3G rural con módem 4G de respaldo",
    note: "Atención cercana para productores y familias de la zona agrícola de Socos."
  },
  b4: {
    id: "b4", name: "Bodega 04 — Abarrotes El Valle", sector: "Anexo Carhuapaccha",
    addr: "Plaza Comunal de Carhuapaccha s/n", hours: "Lunes a Domingo · 7:00 a.m. a 7:30 p.m.",
    owner: "Agente Demo 4", conn: "3G optimizada (carga web ligera)",
    note: "Elimina viajes hasta el palacio municipal para los contribuyentes del anexo Carhuapaccha."
  },
  b5: {
    id: "b5", name: "Bodega 05 — Multiservicios Chupuro", sector: "Acceso Carretera",
    addr: "Carretera Huancayo–Chupuro Km 14", hours: "Lunes a Domingo · 6:30 a.m. a 9:00 p.m.",
    owner: "Agente Demo 5", conn: "4G alta disponibilidad",
    note: "Punto estratégico de paso rápido en el ingreso principal del distrito."
  }
};

const SEED_TAXPAYERS = [
  {
    predio: "P-001", dni: "00000001", nombre: "Contribuyente Demo 01",
    sector: "Chupuro Centro", tel: "000-000-001", etl: "Validado",
    deudas: [
      { id: "D-101", concepto: "Impuesto Predial", periodo: "2026 · Trim. III y IV", monto: 85.50, pagado: false },
      { id: "D-102", concepto: "Arbitrios de Limpieza y Serenazgo", periodo: "2026 · Anual", monto: 48.00, pagado: false }
    ]
  },
  {
    predio: "P-002", dni: "00000002", nombre: "Contribuyente Demo 02",
    sector: "Barrio San Juan", tel: "000-000-002", etl: "Validado",
    deudas: [
      { id: "D-201", concepto: "Impuesto Predial", periodo: "2026 · Anual", monto: 112.00, pagado: false },
      { id: "D-202", concepto: "Arbitrios Municipales", periodo: "2026 · Sem. II", monto: 36.00, pagado: false }
    ]
  },
  {
    predio: "P-003", dni: "00000003", nombre: "Contribuyente Demo 03",
    sector: "Sector Socos", tel: "000-000-003", etl: "Validado",
    deudas: [
      { id: "D-301", concepto: "Impuesto Predial Rural", periodo: "2026 · Anual", monto: 64.00, pagado: false },
      { id: "D-302", concepto: "Arbitrios de Limpieza Pública", periodo: "2026 · Anual", monto: 30.00, pagado: false }
    ]
  },
  {
    predio: "P-004", dni: "00000004", nombre: "Contribuyente Demo 04",
    sector: "Anexo Carhuapaccha", tel: "000-000-004", etl: "Validado",
    deudas: [
      { id: "D-401", concepto: "Impuesto Predial", periodo: "2026 · Anual", monto: 95.00, pagado: false }
    ]
  },
  {
    predio: "P-005", dni: "00000005", nombre: "Contribuyente Demo 05",
    sector: "Chupuro Centro", tel: "000-000-005", etl: "Validado",
    deudas: [
      { id: "D-501", concepto: "Impuesto Predial", periodo: "2026 · Anual", monto: 128.50, pagado: false },
      { id: "D-502", concepto: "Arbitrios de Serenazgo", periodo: "2026 · Anual", monto: 42.00, pagado: false }
    ]
  },
  {
    predio: "P-006", dni: "00000006", nombre: "Contribuyente Demo 06",
    sector: "Barrio San Juan", tel: "000-000-006", etl: "Validado",
    deudas: [{ id: "D-601", concepto: "Impuesto Predial", periodo: "2026 · Anual", monto: 78.00, pagado: true }]
  },
  {
    predio: "P-007", dni: "00000007", nombre: "Contribuyente Demo 07",
    sector: "Sector Socos", tel: "000-000-007", etl: "Validado",
    deudas: [{ id: "D-701", concepto: "Impuesto Predial", periodo: "2026 · Anual", monto: 140.00, pagado: true }]
  },
  {
    predio: "P-008", dni: "00000008", nombre: "Contribuyente Demo 08",
    sector: "Anexo Carhuapaccha", tel: "000-000-008", etl: "Validado",
    deudas: [{ id: "D-801", concepto: "Arbitrios Municipales", periodo: "2026 · Anual", monto: 52.00, pagado: true }]
  }
];

const SEED_TX = [
  { id: "CP-2026-0001", fecha: "20/11/2026 09:14", dni: "00000006", nombre: "Contribuyente Demo 06", sector: "Barrio San Juan", canal: "Yape QR", bodegaId: "", monto: 78.00, hash: "8f4b2c19e07a91c5d4e2a8f0c3b6a192" },
  { id: "CP-2026-0002", fecha: "20/11/2026 10:05", dni: "00000007", nombre: "Contribuyente Demo 07", sector: "Sector Socos", canal: "Pasarela BCP", bodegaId: "", monto: 140.00, hash: "3a9d7e41b2c8f014a6d9e5c2b1a8740f" },
  { id: "CP-2026-0003", fecha: "20/11/2026 11:22", dni: "00000008", nombre: "Contribuyente Demo 08", sector: "Anexo Carhuapaccha", canal: "Agente BCP", bodegaId: "b1", monto: 52.00, hash: "c71e5a92f4b803d1e6a4c9b2f08d31e7" }
];


export { BODEGAS, SEED_TAXPAYERS, SEED_TX };
