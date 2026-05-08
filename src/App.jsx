import { useState, useEffect } from 'react'
import './App.css'
import listas from './data/listas.json'

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

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 print:bg-white print:p-0">
      
      {/* Contenedor principal (Se amplió max-w-sm a max-w-2xl para que quepa la tabla bien) */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-300 print:shadow-none print:border-none print:m-0 print:p-2">
        
        {/* Encabezado / Logo */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800">EyJ Confecciones</h1>
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
        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 print:hidden">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Agregar Nueva Operación</h3>
          <div className="flex flex-wrap md:flex-nowrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
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
            <div className="w-24">
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
            <div className="w-32">
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
            <button 
              onClick={agregarOperacion}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* === TABLA DE OPERACIONES === */}
        <div className="mb-4 min-h-[150px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 text-sm font-bold text-gray-600 uppercase">Operación</th>
                <th className="py-2 text-sm font-bold text-gray-600 uppercase text-center">Cant.</th>
                <th className="py-2 text-sm font-bold text-gray-600 uppercase text-right">V. Unit ($)</th>
                <th className="py-2 text-sm font-bold text-gray-600 uppercase text-right">Subtotal</th>
                <th className="py-2 text-sm font-bold text-gray-600 uppercase text-center print:hidden w-10"></th>
              </tr>
            </thead>
            <tbody>
              {listaOperaciones.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 print:hover:bg-transparent text-gray-800">
                  <td className="py-2 print:py-1">{item.operacion}</td>
                  <td className="py-2 print:py-1 text-center">{item.cantidad}</td>
                  <td className="py-2 print:py-1 text-right">${Number(item.valorUnitario).toLocaleString()}</td>
                  <td className="py-2 print:py-1 text-right font-medium">${(Number(item.cantidad) * Number(item.valorUnitario)).toLocaleString()}</td>
                  <td className="py-2 text-center print:hidden">
                    <button onClick={() => eliminarOperacion(index)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listaOperaciones.length === 0 && (
            <p className="text-center text-gray-400 my-6 text-sm italic print:hidden">Aún no hay operaciones agregadas a este recibo.</p>
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
        <div className="mt-8 flex gap-4 print:hidden">
          <button 
            onClick={limpiarRecibo}
            className="w-1/3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-md transition-colors"
          >
            Limpiar Todo
          </button>
          <button 
            onClick={handlePrint}
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Recibo
          </button>
        </div>

      </div>
    </div>
  )
}

export default App
