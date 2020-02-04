Al ejecutarse desde el crontab, la ruta empieza en / y no desde el la carpeta del proyecto, por lo que las variables de entorno escritas no van a funcionar correctamente. Hay que sustituirlas en su linea correspondiente.

Si se está desplegando en linux, en el archivo index.js hay que sustituir 
    const urls = data.toString().replace(/\n/g, '').split('\r')
    por
    const urls = data.toString().split('\n')

Todas las rutas deben ser sustituidas por la ruta absoluta del sistema.