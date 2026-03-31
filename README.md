# Plantilla CSV / XLSX - importadorPL

Pequeña página estática que permite descargar una plantilla con los encabezados:

- FOR
- TO
- Codigo
- Descripcion
- Cantidad

Archivos:

- `index.html` - interfaz principal
- `styles.css` - estilos
- `script.js` - lógica para generar y descargar el CSV y XLSX
- `server.js` - servidor Node.js ligero para servir archivos estáticos
- `package.json` - script `start` para ejecutar el servidor

Cómo usar:

1. Abrir PowerShell y posicionarse en la carpeta del proyecto:

```powershell
Set-Location -LiteralPath 'C:\Users\Tobias\Desktop\Nueva carpeta\importadorPL'
```

2. Ejecutar el servidor:

```powershell
npm start
```

3. Abrir http://localhost:3000/ en tu navegador.

# Plantilla CSV / XLSX - importadorPL

Pequeña página estática que permite generar y procesar plantillas (CSV/XLSX) en el navegador.

Principales características
- Genera una plantilla XLSX con encabezados FOR / TO / Codigo / Descripcion / Cantidad.
- Permite subir la plantilla completada y genera un listado por rango (FOR..TO) con la columna "N° de caja".
- Todo el procesamiento se realiza en el navegador (no se suben datos a servidores).

Despliegue recomendado: GitHub Pages (sitio estático)

Pasos para subir y publicar en GitHub Pages:

1. Inicializa el repositorio localmente (si no lo has hecho) y haz commit:

```powershell
cd 'C:\Users\Tobias\Desktop\Nueva carpeta\importadorPL'
git init
git add .
git commit -m "Initial importadorPL"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

2. El workflow `.github/workflows/deploy-pages.yml` está incluido y publicará la carpeta raíz en la rama `gh-pages` cada vez que empujes a `main`. Solo necesitas activar Actions en tu repositorio y permitir que el workflow ejecute.

3. Tras el primer push, GitHub Actions construirá y publicará el sitio en `https://tu-usuario.github.io/tu-repo/` (puede tardar unos minutos).

Notas:
- No necesitas que el usuario tenga Visual Studio Code; basta con darles la URL pública y podrán usar la web desde el navegador.
- `server.js` es útil para desarrollo local, pero no es necesario en GitHub Pages (puedes dejarlo en el repo).

Si quieres, puedo también:
- Añadir un pequeño script de deploy (`gh-pages`) para publicar manualmente si prefieres no usar Actions.
- Configurar `homepage` en `package.json` o crear un archivo `CNAME` si tienes un dominio personalizado.
