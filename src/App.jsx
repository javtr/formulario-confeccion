import { useState, useEffect, useRef } from 'react'
import './App.css'
import listas from './data/listas.json'
import { toBlob } from 'html-to-image'


function App() {
  // Estado para los datos generales del recibo
  const [generalData, setGeneralData] = useState({
    fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    empresa: '',
    operario: ''
  });

  // Estado temporal para la operación que se está escribiendo antes de agregarla a la lista
  const [opData, setOpData] = useState({
    operacion: '',
    cantidad: '',
    valorUnitario: ''
  });

  // Estado para la lista (tabla) de operaciones
  const [listaOperaciones, setListaOperaciones] = useState([]);

// Referencia al contenedor del recibo para la captura de imagen
  const reciboRef = useRef(null);


  // Manejadores de cambios
  const handleGeneralChange = (e) => {
    setGeneralData({ ...generalData, [e.target.name]: e.target.value });
  };

  const handleOpChange = (e) => {
    const { name, value } = e.target;
    let nuevoOpData = { ...opData, [name]: value };

    // Si el campo que cambia es la operación, buscamos su valor unitario por defecto
    if (name === 'operacion') {
      const operacionEncontrada = listas.operaciones.find(op => op.nombre === value);
      if (operacionEncontrada) {
        nuevoOpData.valorUnitario = operacionEncontrada.precio;
      }
    }

    setOpData(nuevoOpData);
  };

  // Función para agregar una operación a la lista
  const agregarOperacion = () => {
    if (!opData.operacion || !opData.cantidad || !opData.valorUnitario) {
      alert("Por favor completa los datos de la operación (Operación, Cantidad y Valor).");
      return;
    }
    setListaOperaciones([...listaOperaciones, opData]);
    // Limpiamos los campos de operación para agregar la siguiente
    setOpData({ operacion: '', cantidad: '', valorUnitario: '' });
  };

  // Función para eliminar una operación de la lista
  const eliminarOperacion = (index) => {
    const nuevaLista = [...listaOperaciones];
    nuevaLista.splice(index, 1);
    setListaOperaciones(nuevaLista);
  };

  // Función para limpiar todo y hacer un recibo nuevo
  const limpiarRecibo = () => {
    setGeneralData({ fecha: new Date().toISOString().split('T')[0], empresa: '', operario: '' });
    setOpData({ operacion: '', cantidad: '', valorUnitario: '' });
    setListaOperaciones([]);
  };

  // Cálculo automático del gran total
  const granTotal = listaOperaciones.reduce((sum, item) => {
    return sum + (Number(item.cantidad) * Number(item.valorUnitario));
  }, 0);

  const handlePrint = () => {
    window.print();
  };


// Función para capturar el recibo y compartir por WhatsApp
  const compartirPorWhatsApp = async () => {
    if (!reciboRef.current) return;
    
    try {
      const el = reciboRef.current;
      const targetWidth = el.offsetWidth;

      // 1. Clonar temporalmente para medir la altura sin los botones
      const clone = el.cloneNode(true);
      
      // Remover botones para no contarlos en la altura
      const ignoredElements = clone.querySelectorAll('[data-html2canvas-ignore="true"]');
      ignoredElements.forEach(node => node.remove());
      
      // Usar el ancho actual del dispositivo
      clone.style.width = targetWidth + 'px';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.visibility = 'hidden';
      
      document.body.appendChild(clone);
      const targetHeight = clone.offsetHeight;
      document.body.removeChild(clone);

      // Filtramos los elementos que tienen el atributo de ignorar
      const filter = (node) => {
        return node.dataset?.html2canvasIgnore !== 'true';
      };

      // 2. Generamos la imagen con las medidas reales
      const blob = await toBlob(el, { 
        pixelRatio: 2, 
        filter: filter,
        backgroundColor: '#ffffff', // Asegura que el fondo sea blanco
        width: targetWidth,
        height: targetHeight,
        style: {
          width: targetWidth + 'px',
          margin: '0'
        }
      });
      
      if (!blob) return;
      
      const file = new File([blob], 'recibo-operaciones.png', { type: 'image/png' });
      
      // Intentamos usar la API nativa de compartir (Ideal para móviles)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Recibo EyJ Confecciones',
          files: [file]
        });
      } else {
        // Plan B (Para PCs): Descargamos la imagen automáticamente
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'recibo-operaciones.png';
        link.click();
        URL.revokeObjectURL(url);
        alert("El recibo se ha descargado como imagen. Ahora puedes enviarlo como archivo adjunto por WhatsApp Web.");
      }
    } catch (error) {
      console.error("Error al generar la imagen:", error);
      alert("Hubo un problema al intentar generar la imagen del recibo.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-200 flex items-start md:items-center justify-center p-2 md:p-4 print:bg-white print:p-0">
      
      {/* Contenedor principal (Se amplió max-w-sm a max-w-2xl para que quepa la tabla bien) */}
      <div ref={reciboRef} className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-300 print:shadow-none print:border-none print:m-0 print:p-2">
        
        {/* Encabezado / Logo */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-gray-800">EyJ Confecciones</h1>
          <p className="text-sm text-gray-500 uppercase mt-1">Recibo de Operaciones</p>
        </div>

        {/* === DATOS GENERALES DEL RECIBO === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Fecha</label>
            <input 
              type="date" 
              name="fecha"
              value={generalData.fecha}
              onChange={handleGeneralChange}
              className="w-full p-1 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800 print:border-none print:p-0"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Empresa</label>
            <input 
              type="text" 
              name="empresa"
              value={generalData.empresa}
              onChange={handleGeneralChange}
              placeholder="Nombre empresa"
              className="w-full p-1 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800 print:border-none print:p-0"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre del Operario</label>
            <input 
              list="lista-operarios"
              name="operario"
              value={generalData.operario}
              onChange={handleGeneralChange}
              placeholder="Seleccione o escriba el nombre..."
              className="w-full p-1 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500 text-gray-800 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* === FORMULARIO PARA AGREGAR OPERACIONES (Se oculta al imprimir) === */}
        <div data-html2canvas-ignore="true" className="bg-gray-50 p-3 md:p-4 rounded-md mb-6 border border-gray-200 print:hidden">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Agregar Nueva Operación</h3>
          <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap gap-3 items-start md:items-end">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">OPERACIÓN</label>
              <input 
                list="lista-operaciones"
                name="operacion"
                value={opData.operacion}
                onChange={handleOpChange}
                placeholder="Ej. Fileteado..."
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Contenedor interno para que Cantidad y Valor vayan en la misma línea en móviles */}
            <div className="flex w-full md:w-auto gap-3">
              <div className="flex-1 md:w-24">
                <label className="block text-xs font-bold text-gray-600 mb-1">CANTIDAD</label>
                <input 
                  type="number" 
                  name="cantidad"
                  value={opData.cantidad}
                  onChange={handleOpChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 md:w-32">
                <label className="block text-xs font-bold text-gray-600 mb-1">VALOR UN.</label>
                <input 
                  list="lista-valores"
                  type="number" 
                  name="valorUnitario"
                  value={opData.valorUnitario}
                  onChange={handleOpChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button 
              onClick={agregarOperacion}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* === LISTA DE OPERACIONES (Diseño Responsivo) === */}
        <div className="mb-4 min-h-[150px]">
          {/* Encabezados de tabla para desktop */}
          <div className="hidden sm:grid grid-cols-12 gap-2 border-b-2 border-gray-300 pb-2 mb-2">
            <div className="col-span-5 text-sm font-bold text-gray-600 uppercase">Operación</div>
            <div className="col-span-2 text-sm font-bold text-gray-600 uppercase text-center">Cant.</div>
            <div className="col-span-2 text-sm font-bold text-gray-600 uppercase text-right">V. Unit ($)</div>
            <div className="col-span-2 text-sm font-bold text-gray-600 uppercase text-right">Subtotal</div>
            <div data-html2canvas-ignore="true" className="col-span-1 print:hidden"></div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-0">
            {listaOperaciones.map((item, index) => (
              <div key={index} className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2 sm:items-center border-b border-gray-200 pb-3 pt-2 sm:py-2 hover:bg-gray-50 print:hover:bg-transparent text-gray-800">
                
                {/* Operación y botón eliminar (móvil) */}
                <div className="flex justify-between items-start sm:col-span-5">
                  <span className="font-bold sm:font-normal">{item.operacion}</span>
                  <button data-html2canvas-ignore="true" onClick={() => eliminarOperacion(index)} className="text-red-500 hover:text-red-700 font-bold px-2 sm:hidden">X</button>
                </div>

                {/* Detalles (Grid en móvil, elements sueltos en PC) */}
                <div className="grid grid-cols-2 gap-1 sm:contents text-sm sm:text-base text-gray-600 sm:text-gray-800 mt-1 sm:mt-0">
                  <div className="sm:col-span-2 sm:text-center">
                    <span className="sm:hidden font-semibold mr-1">Cant:</span>
                    {item.cantidad}
                  </div>
                  <div className="text-right sm:col-span-2">
                    <span className="sm:hidden font-semibold mr-1">V. Un:</span>
                    ${Number(item.valorUnitario).toLocaleString()}
                  </div>
                  <div className="col-span-2 sm:col-span-2 text-right font-medium text-gray-900 sm:text-gray-800 border-t border-gray-100 sm:border-0 pt-1 mt-1 sm:pt-0 sm:mt-0">
                    <span className="sm:hidden font-semibold mr-1 text-gray-600">Subtotal:</span>
                    ${(Number(item.cantidad) * Number(item.valorUnitario)).toLocaleString()}
                  </div>
                </div>

                {/* Botón eliminar (desktop) */}
                <div data-html2canvas-ignore="true" className="hidden sm:block col-span-1 text-center print:hidden">
                  <button onClick={() => eliminarOperacion(index)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                </div>
              </div>
            ))}
          </div>
          
          {listaOperaciones.length === 0 && (
            <p data-html2canvas-ignore="true" className="text-center text-gray-400 my-6 text-sm italic print:hidden">Aún no hay operaciones agregadas a este recibo.</p>
          )}
        </div>

        {/* === ZONA DE TOTALIZADOR === */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400 flex justify-end">
          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded print:bg-transparent print:p-0">
            <span className="text-sm font-bold text-gray-600 uppercase">Total a Pagar</span>
            <span className="text-2xl font-black text-gray-900">${granTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* === DATALISTS (Opciones sugeridas) === */}
        <datalist id="lista-operarios">
          {listas.operarios.map((op, index) => (
            <option key={index} value={op} />
          ))}
        </datalist>
        <datalist id="lista-operaciones">
          {listas.operaciones.map((op, index) => (
            <option key={index} value={op.nombre} />
          ))}
        </datalist>
        <datalist id="lista-valores">
          {listas.valoresSugeridos.map((val, index) => (
            <option key={index} value={val} />
          ))}
        </datalist>

        {/* === BOTONES DE ACCIÓN (Ocultos al imprimir) === */}
        <div data-html2canvas-ignore="true" className="mt-8 flex flex-col md:flex-row gap-3 md:gap-4 print:hidden">
          <button 
            onClick={limpiarRecibo}
            className="w-full md:w-1/4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-md transition-colors"
          >
            Limpiar
          </button>
          <button 
            onClick={handlePrint}
            className="w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
                        Imprimir
          </button>
          <button 
            onClick={compartirPorWhatsApp}
            className="w-full md:w-auto flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
           </svg>
           WhatsApp
          </button>
        </div>

      </div>
    </div>
  )
}

export default App
