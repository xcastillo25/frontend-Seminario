import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Pagos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Pagos = () => {
    const [lotes, setLotes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState({});
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('nombre');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    useEffect(() => {
        fetchClientes();
        fetchLotes();
    }, []);

    useEffect(() => {
        const filterClientes = () => {
            let filtered = clientes;

            if (searchTerm) {
                filtered = clientes.filter(cliente => 
                    cliente[filterColumn]?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setFilteredClientes(filtered);
        };

        filterClientes();
    }, [searchTerm, filterColumn, clientes]);

    const fetchClientes = async () => {
        try {
            const response = await axios.get(`${API_URL}/clientes`);
            setClientes(response.data.clientes);
            setFilteredClientes(response.data.clientes); // Inicializa con todos los clientes
        } catch (error) {
            handleError(error, 'Error al cargar clientes');
        }
    };

    const fetchLotes = async () => {
        try {
            const response = await axios.get(`${API_URL}/lote`);
            setLotes(response.data.clientes);
        } catch (error) {
            handleError(error, 'Error al cargar lotes');
        }
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCliente({
            ...selectedCliente,
            [name]: value,
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterColumn(e.target.value);
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
                    <select value={filterColumn} onChange={handleFilterChange}>
                        <option value="nombre">Nombre</option>
                        <option value="apellidos">Apellidos</option>
                        <option value="cui">CUI</option>
                        <option value="nit">NIT</option>
                        <option value="telefono">Teléfono</option>
                    </select>
                    <input 
                        type="text"
                        placeholder="Buscar cliente"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <label>Cliente:</label>
                    <select 
                        className="pagos-cliente" 
                        name="cliente" 
                        value={selectedCliente ? selectedCliente.idcliente : ''}
                        onChange={(e) => setSelectedCliente({ ...selectedCliente, idcliente: e.target.value })}
                    >
                        {filteredClientes.map(cliente => (
                            <option key={cliente.idcliente} value={cliente.idcliente}>
                                {`${cliente.nombre} ${cliente.apellidos}`}
                            </option>
                        ))}
                    </select>
                    <label>Servicio:</label>
                    <select className="pagos-servicio"></select>
                </div>
                <div className="pagos-busqueda">
                    <label>Año:</label>
                    <input 
                        className="pagos-input"
                        type="text"
                        placeholder="Año"
                        name="año"
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 1}
                        value={selectedCliente ? selectedCliente.año : ''}
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
                                />
                                <label htmlFor={`mes-${index}`}>{mes}</label>
                            </div>
                        ))}   
                    </div>

                </div>
                <div className="pagos-data">
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
