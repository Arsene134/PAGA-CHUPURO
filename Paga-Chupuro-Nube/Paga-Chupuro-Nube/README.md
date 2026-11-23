# Paga Chupuro · prueba en la nube

Esta carpeta contiene la aplicación MVC, el backend Node.js 24, la interfaz y las pruebas. El servicio crea su propia base SQLite al arrancar. Utiliza una sola instancia para que todas las operaciones compartan la misma base.

## Desplegar en Render con Docker

1. Crea un repositorio con **el contenido de esta carpeta en la raíz**. Comprueba que el Dockerfile, package.json y servidor.mjs aparecen juntos.
2. En Render elige **New → Web Service**, conecta el repositorio y selecciona **Docker** como runtime. Si subiste la carpeta completa dentro del repositorio, indica su ruta como **Root Directory**.
3. Inicia el despliegue. El contenedor usa el puerto indicado por el proveedor y escucha en 0.0.0.0. Abre la URL HTTPS que Render muestra para el servicio.
4. Si un cobro devuelve 403 detrás de un proxy que cambia el encabezado Host, configura PUBLIC_ORIGIN con el origen público exacto, por ejemplo https://mi-demo.onrender.com, sin barra final. Reinicia el servicio.

## Otros servicios con Node.js

Selecciona un servicio web con Node.js 24 y un sistema de archivos escribible. Comando de inicio: npm start (equivale a node servidor.mjs). No hay paquetes externos que instalar. PORT lo asigna el proveedor. Esta aplicación requiere un proceso de servidor en ejecución.

## Probar el incremento

Abre el portal del contribuyente y consulta el predio **P-001** o el DNI de prueba **00000001**. Selecciona ambos recibos y confirma el pago simulado de **S/ 133,50**. Desde la base inicial, Tesorería debe mostrar cuatro operaciones por **S/ 403,50**. Una segunda consulta del predio debe mostrar ambos recibos pagados. Para ejecutar las pruebas automáticas usa npm test.

## Persistencia y alcance de la demo

Por defecto los datos se escriben en datos/chupuro.sqlite. En un contenedor con almacenamiento efímero, un reinicio o redespliegue puede restaurar el estado inicial. Si necesitas conservar los cobros, monta un volumen persistente escribible y configura CHUPURO_DB con la ruta completa dentro de ese volumen, por ejemplo /var/data/chupuro.sqlite.

La demo es compartida por sus visitantes, incluido el botón de reinicio. Utiliza únicamente datos de prueba. Los pagos, los SMS y la conciliación bancaria son simulados.

Documentación del proveedor: [servicios web](https://render.com/docs/web-services) y [discos persistentes](https://render.com/docs/disks).
