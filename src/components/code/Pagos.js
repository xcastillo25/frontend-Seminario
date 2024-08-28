import React, { useState } from 'react';
import '../design/Pagos.css'; // Asegúrate de crear este archivo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Pagos = () => {
    const [selectedCliente, setSelectedCliente] = useState({
        nombre: '',
        año: new Date().getFullYear(),
        meses: [],
        cuota: 100,  // Ejemplo de cuota fija
        total: 0,
        monto_exceso: 0,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCliente({
            ...selectedCliente,
            [name]: value,
        });
    };

    const handleMonthChange = (e) => {
        const { value, checked } = e.target;
        let updatedMeses = selectedCliente.meses || [];

        if (checked) {
            updatedMeses.push(value);
        } else {
            updatedMeses = updatedMeses.filter(mes => mes !== value);
        }

        setSelectedCliente({
            ...selectedCliente,
            meses: updatedMeses,
        });
    };

    const handleSelectAllMonths = (e) => {
        if (e.target.checked) {
            const allMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
            setSelectedCliente(prevState => ({
                ...prevState,
                meses: allMonths,
                total: prevState.cuota * 11, // 12 meses por el precio de 11
            }));
            toast.success('Has seleccionado pagar todo el año con un mes gratis.');
        } else {
            setSelectedCliente(prevState => ({
                ...prevState,
                meses: [],
                total: 0,
            }));
        }
    };

    const calcularTotal = () => {
        const { meses, cuota, monto_exceso } = selectedCliente;
        let total = meses.length === 12 ? cuota * 11 : cuota * meses.length;

        if (monto_exceso) {
            total += parseFloat(monto_exceso);
        }

        setSelectedCliente(prevState => ({
            ...prevState,
            total: total.toFixed(2),
        }));
    };

    return (
        <main className="pagos-container">
            <ToastContainer />
            <section className="pagos-section">
                <h1 className="pagos-title">Gestión de Pagos</h1>
                <div className="pagos-busqueda">
                    <label>Buscar por:</label>
                    <select>
                        <option value="">Criterio de búsqueda</option>
                        <option>Nombre</option>
                        <option>Apellidos</option>
                        <option>CUI</option>
                        <option>NIT</option>
                        <option>Teléfono</option>
                    </select>
                    <input 
                        type="text"
                        placeholder="Buscar cliente"
                    />
                    <label>Servicio:</label>
                    <select></select>
                    <label>Año:</label>
                    <input 
                        className="pagos-input"
                        type="text"
                        placeholder="Año"
                        name="año"
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 1}
                        value={selectedCliente.año}
                        onChange={handleInputChange}
                        style={{width :'6rem'}}
                    />
                </div>
                <div className="pagos-mes">
                    <div>
                        <label>Meses a pagar:</label>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="select-all"
                            onChange={handleSelectAllMonths}
                        />
                        <label htmlFor="select-all">Seleccionar todos los meses (12 meses por el precio de 11)</label>
                    </div>
                    <div className="pagos-meses">
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes, index) => (
                            <div key={index} className="checkbox-mes">
                                <input
                                    type="checkbox"
                                    id={`mes-${index}`}
                                    value={(index + 1).toString().padStart(2, '0')}
                                    onChange={handleMonthChange}
                                    checked={selectedCliente.meses.includes((index + 1).toString().padStart(2, '0'))}
                                />
                                <label htmlFor={`mes-${index}`}>{mes}</label>
                            </div>
                        ))}   
                    </div>

                </div>
                <div className="pagos-data">
                    <div className="row">
                        <label>Cliente:</label>
                        <input 
                            className="pagos-input"
                            type="text"
                            placeholder="Nombre del Cliente"
                            name="nombre"
                            value={selectedCliente.nombre}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Año:</label>
                        <input 
                            className="pagos-input"
                            type="number"
                            placeholder="Año"
                            name="año"
                            min={new Date().getFullYear()}
                            max={new Date().getFullYear() + 1}
                            value={selectedCliente.año}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Fecha:</label>
                        <input 
                            className="pagos-input"
                            type="date"
                            placeholder="Fecha"
                            name="fecha"
                            value={selectedCliente.fecha || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Concepto:</label>
                        <input 
                            className="pagos-input"
                            type="text"
                            placeholder="Concepto del pago"
                            name="concepto"
                            value={selectedCliente.concepto || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Consumo:</label>
                        <input 
                            className="pagos-input"
                            type="number"
                            placeholder="Consumo"
                            name="consumo"
                            value={selectedCliente.consumo || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Mora:</label>
                        <input 
                            className="pagos-input"
                            type="number"
                            placeholder="Mora"
                            name="mora"
                            value={selectedCliente.mora || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Exceso:</label>
                        <input 
                            className="pagos-input"
                            type="number"
                            placeholder="Exceso"
                            name="exceso"
                            value={selectedCliente.exceso || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Monto Exceso:</label>
                        <input 
                            className="pagos-input"
                            type="number"
                            placeholder="Monto del Exceso"
                            name="monto_exceso"
                            value={selectedCliente.monto_exceso || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label>Total:</label>
                        <input 
                            className="pagos-input"
                            type="number"
                            placeholder="Total"
                            name="total"
                            value={selectedCliente.total || ''}
                            readOnly
                        />
                    </div>
                    <div className="row">
                        <button onClick={calcularTotal} className="calcular-btn">Calcular Total</button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Pagos;
