import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Pagos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Pagos = () => {
    const [servicios, setServicios] = useState([]);
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('clientes.nombre');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [selectedYear1, setSelectedYear1] = useState(new Date().getFullYear());
    const [selectedYear2, setSelectedYear2] = useState(new Date().getFullYear() + 1);
    const [years, setYears] = useState([]);

    useEffect(() => {
        fetchServicios();
        generateYears();
    }, []);

    useEffect(() => {
        filterServicios();
    }, [searchTerm, filterColumn, servicios]);

    const generateYears = () => {
        const startYear = 2020;
        const endYear = 2035;
        const yearsArray = [];
        for (let year = startYear; year <= endYear; year++) {
            yearsArray.push(year);
        }
        setYears(yearsArray);
    };

    const fetchServicios = async () => {
        try {
            const response = await axios.get(`${API_URL}/servicio-pago`);
            console.log('Servicios recibidos:', response.data.servicios);  // Log de los servicios recibidos
            setServicios(response.data.servicios);
            setFilteredServicios(response.data.servicios); // Inicializa con todos los servicios
        } catch (error) {
            handleError(error, 'Error al cargar servicios');
        }
    };

    const filterServicios = () => {
        let filtered = servicios;

        if (searchTerm) {
            filtered = servicios.filter(servicio => {
                const valueToFilter = filterColumn.includes('clientes.')
                    ? servicio.clientes[filterColumn.split('.')[1]] // Si el filtro es por cliente
                    : servicio.lotes[filterColumn.split('.')[1]]; // Si el filtro es por lote

                return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        console.log('Servicios filtrados:', filtered);  // Log de los servicios filtrados
        setFilteredServicios(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterColumn(e.target.value);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const handleSelectCliente = (e) => {
        const selectedServicioId = parseInt(e.target.value);
        const selectedServicio = servicios.find(serv => serv.idservicio === selectedServicioId);
        setSelectedServicio(selectedServicio);
    };

    return (
        <main className="pagos-container">
            <ToastContainer />
            <section className="pagos-section">
                <h1 className="pagos-title">Gestión de Pagos</h1>
                <div className="pagos-busqueda">
                    <label>Buscar:</label>
                    <select value={filterColumn} onChange={handleFilterChange}>
                        <option value="lotes.ubicacion">Lote</option>
                        <option value="clientes.nombre">Nombre</option>
                        <option value="clientes.apellidos">Apellidos</option>
                        <option value="clientes.cui">CUI</option>
                        <option value="clientes.nit">NIT</option>
                        <option value="clientes.telefono">Teléfono</option>
                    </select>
                    <input 
                        type="text"
                        placeholder="Buscar datos"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <label>Cliente:</label>
                    <select 
                        className="pagos-cliente" 
                        name="cliente" 
                        value={selectedServicio.idservicio || ''}
                        onChange={handleSelectCliente}
                    >
                        {filteredServicios.map(servicio => (
                            <option key={servicio.idservicio} value={servicio.idservicio}>
                                {`${servicio.clientes.nombre} ${servicio.clientes.apellidos}, Lote: ${servicio.lotes.ubicacion}`}
                            </option>
                        ))}
                    </select>
                    <button>Buscar</button>
                </div>
                <h1 className="pagos-title">Selecciona los meses de pago</h1>
                <div className="pagos-mes">
                    <div className="meses">
                        <h1>Año Anterior</h1>
                        <select value={selectedYear1} onChange={(e) => setSelectedYear1(e.target.value)}>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <div className="pagos-meses">
                            <div className="checkbox-mes">
                                <p>Enero</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Febrero</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Marzo</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Abril</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Mayo</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Junio</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Julio</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Agosto</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Septiembre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Octubre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Noviembre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Diciembre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>

                        </div>
                        
                    </div>
                    <div className="meses">
                        <h1>Año Siguiente</h1>
                        <select value={selectedYear2} onChange={(e) => setSelectedYear2(e.target.value)}>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <div className="pagos-meses">
                            <div className="checkbox-mes">
                                <p>Enero</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Febrero</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Marzo</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Abril</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Mayo</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Junio</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Julio</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Agosto</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Septiembre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Octubre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Noviembre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>
                            <div className="checkbox-mes">
                                <p>Diciembre</p>
                                <input
                                    type="checkbox"
                                />
                            </div>

                        </div>
                        
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Pagos;
