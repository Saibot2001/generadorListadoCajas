// Encabezados solicitados (orden corresponde a columnas A..E)
const HEADERS = ["FOR", "TO", "Codigo", "Descripcion", "Cantidad"];


function downloadFile(filename, content, mime='application/octet-stream'){
  const blob = new Blob([content], { type: mime + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadXLSX(filename, rows){
  // rows: array of arrays
  // Build worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadFile(filename, wbout, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

document.addEventListener('DOMContentLoaded', () => {
  const btnXlsx = document.getElementById('downloadXlsx');
  const fileInput = document.getElementById('fileInput');
  const downloadResult = document.getElementById('downloadResult');
  const processMsg = document.getElementById('processMsg');
  const numeroPL = document.getElementById('numeroPL');

  let processedRows = null; // rows for result

  btnXlsx.addEventListener('click', () => {
    const rows = [HEADERS];
    downloadXLSX('plantilla.xlsx', rows);
  });

  // File input handling: process the file automatically when selected
  fileInput.addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f){
      processMsg.textContent = 'Sin archivo cargado.';
      downloadResult.disabled = true;
      processedRows = null;
      return;
    }
    const plValue = numeroPL.value.trim();
    if(!plValue){
      processMsg.textContent = 'Por favor, complete el campo "Número de PL" antes de subir el archivo.';
      downloadResult.disabled = true;
      processedRows = null;
      // Reset the file input
      fileInput.value = '';
      return;
    }
    processMsg.textContent = 'Procesando...';
    downloadResult.disabled = true;
    await processFile(f);
  });

  // Process the selected file when the user clicks the process button
  async function processFile(f){
    if(!f) return;
    processMsg.textContent = 'Procesando...';
    try{
      const arr = await f.arrayBuffer();
      let workbook;
      const name = f.name.toLowerCase();
      if(name.endsWith('.csv')){
        const text = new TextDecoder().decode(arr);
        workbook = XLSX.read(text, { type: 'string' });
      } else {
        workbook = XLSX.read(arr, { type: 'array' });
      }

      const firstSheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      const headerRow = data[0] || [];
      const idx = {
        FOR: headerRow.findIndex(h => String(h).trim().toLowerCase() === 'for'),
        TO: headerRow.findIndex(h => String(h).trim().toLowerCase() === 'to'),
        Codigo: headerRow.findIndex(h => String(h).trim().toLowerCase() === 'codigo'),
        Descripcion: headerRow.findIndex(h => String(h).trim().toLowerCase() === 'descripcion'),
        Cantidad: headerRow.findIndex(h => String(h).trim().toLowerCase() === 'cantidad')
      };

      if(Object.values(idx).some(i => i === -1)){
        processMsg.textContent = 'No se encontraron todos los encabezados (FOR, TO, Codigo, Descripcion, Cantidad).';
        return;
      }

      const result = [];
      let lastCodigo = '';
      let lastDescripcion = '';
      for(let r = 1; r < data.length; r++){
        const row = data[r];
        if(!row) continue;
        const forVal = row[idx.FOR];
        const toVal = row[idx.TO];
        let codigo = row[idx.Codigo];
        let descripcion = row[idx.Descripcion];
        const cantidad = row[idx.Cantidad];

        const start = parseInt(forVal, 10);
        const end = parseInt(toVal, 10);
        if(codigo === '' || codigo == null) codigo = lastCodigo;
        else lastCodigo = codigo;
        if(descripcion === '' || descripcion == null) descripcion = lastDescripcion;
        else lastDescripcion = descripcion;

        if(Number.isInteger(start) && Number.isInteger(end) && end >= start){
          for(let n = start; n <= end; n++){
            result.push([n, codigo, descripcion, cantidad]);
          }
        } else {
          if(forVal !== '' && forVal != null){
            result.push([forVal, codigo, descripcion, cantidad]);
          }
        }
      }

      processedRows = result;
      if(result.length === 0){
        processMsg.textContent = 'No se generaron filas. Revisa los valores FOR/TO.';
        downloadResult.disabled = true;
      } else {
        processMsg.textContent = `Procesado OK — filas generadas: ${result.length}`;
        downloadResult.disabled = false;
      }
    }catch(err){
      console.error(err);
      processMsg.textContent = 'Error al procesar el archivo.';
    }
  }

  downloadResult.addEventListener('click', () => {
    if(!processedRows) return;
    const plValue = numeroPL.value.trim();
    const headerRow = ["BARCODE", "N° de caja", "Codigo", "Descripcion", "Cantidad"];
    const outRows = [headerRow, ...processedRows.map(row => [plValue + "-" + row[0], ...row])];
    downloadXLSX('listado-cajas.xlsx', outRows);
  });
});

