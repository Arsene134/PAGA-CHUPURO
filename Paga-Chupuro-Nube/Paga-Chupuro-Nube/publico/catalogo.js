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

const LEGACY_ISSUES = [
  { cod: "S/N", dni: "00000001", nom: "QUISPE MENDOZA CARLOS", sec: "centro", obs: "Sin código de predio · Nombres sin estandarizar", acc: "Asignado P-001 y unificado" },
  { cod: "P-001", dni: "00000001", nom: "Carlos A. Quispe M.", sec: "Chupuro", obs: "Registro duplicado entre libro físico y hoja Excel", acc: "Consolidado (0 duplicados)" },
  { cod: "P-002", dni: "Sin dato", nom: "Huaman Ricapa Maria", sec: "Sn Juan", obs: "DNI ausente · Nombre de barrio abreviado", acc: "Validado DNI y Barrio San Juan" },
  { cod: "P-003", dni: "4589120", nom: "Paucar Cerron Jorge", sec: "Socos", obs: "DNI incompleto (7 dígitos) · Tributo sin código", acc: "Corregido y homologado 2026" },
  { cod: "P-004", dni: "00000004", nom: "Cardenas Lazo Lucia", sec: "Carhuapacha", obs: "Error ortográfico en anexo · Sin periodo fiscal", acc: "Normalizado Anexo Carhuapaccha" }
];
