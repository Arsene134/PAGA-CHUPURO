import http from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Recaudacion, Regla } from './modelo/recaudacion.mjs';

const host = process.env.HOST || '0.0.0.0';
const puerto = Number(process.env.PORT || 8080);
mkdirSync(new URL('./datos/', import.meta.url), { recursive: true });
const modelo = new Recaudacion(process.env.CHUPURO_DB || fileURLToPath(new URL('./datos/chupuro.sqlite', import.meta.url)));
const archivos = new Map([
  ['/', ['index.html','text/html']], ['/estilos.css',['estilos.css','text/css']],
  ...['catalogo','vistas','controlador'].map(n => ['/'+n+'.js',[n+'.js','text/javascript']])
]);
const servidor = http.createServer(async (req,res) => {
  function json(estado,datos) {
    res.writeHead(estado, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
    res.end(JSON.stringify(datos));
  }
  try {
    if (req.method === 'GET' && archivos.has(req.url)) {
      const [nombre,tipo] = archivos.get(req.url);
      const contenido = readFileSync(new URL('./publico/'+nombre,import.meta.url));
      res.writeHead(200,{'Content-Type':tipo+'; charset=utf-8'});
      return res.end(contenido);
    }
    if (req.method === 'GET' && req.url === '/api/estado') return json(200,modelo.estado());
    if (req.method !== 'POST' || !['/api/cobros','/api/cierres','/api/reinicio'].includes(req.url))
      return json(404,{ error:'Ruta desconocida.' });
    if (req.headers['content-type'] !== 'application/json' ||
        (req.headers.origin && !['https://'+req.headers.host, 'http://'+req.headers.host, process.env.PUBLIC_ORIGIN].includes(req.headers.origin)))
      return json(403,{error:'Origen o formato no permitido.'});
    let cuerpo = '';
    for await (const parte of req) {
      cuerpo += parte;
      if (cuerpo.length > 8192) return json(413,{error:'Solicitud demasiado grande.'});
    }
    const datos = JSON.parse(cuerpo);
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return json(400,{error:'Objeto JSON requerido.'});
    if (req.url === '/api/cobros') return json(201,modelo.cobrar(datos));
    if (req.url === '/api/cierres') return json(200,modelo.cerrar(datos.bodega));
    modelo.reiniciar();
    json(200,{ok:true});
  } catch (err) {
    if (err instanceof Regla) return json(409,{error:err.message});
    if (err instanceof SyntaxError || err instanceof TypeError) return json(400,{error:'Revise los campos enviados.'});
    console.error(err);
    json(500,{error:'No se pudo completar la operación.'});
  }
});
servidor.listen(puerto,host,() => console.log('Paga Chupuro · http://127.0.0.1:'+servidor.address().port));