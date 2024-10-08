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
    const [filteredServicio, setFilteredServicio] = useState(null);
    const [lecturas, setLecturas] = useState([]); // Inicializamos lecturas como un array vacío
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
    const [loadingLecturas, setLoadingLecturas] = useState(false);
    const [valorRecibido, setValorRecibido] = useState(0);
    const [conceptoPago, setConceptoPago] = useState('');
    const [cambio, setCambio] = useState('0.00');
    const [montoPagar, setMontoPagar] = useState(0);
    const [showPagoParcialModal, setShowPagoParcialModal] = useState(false);
    const [pagos, setPagos] = useState([]);
    const [totalPago, setTotalPago] = useState(0);

    useEffect(() => {
        fetchServicios();
        generateYears();
    }, []);

    useEffect(() => {
        // Inicializar los pagos con los datos de lecturas
        setPagos(
            lecturas.map((lectura) => ({
                idlectura: lectura.idlectura,
                cuotaPago: 0,
                moraPago: 0,
                excesoPago: 0,
            }))
        );
    }, [lecturas]);

    useEffect(() => {
        // Recalcular el total cada vez que los pagos cambien
        const total = pagos.reduce((acc, pago) => {
            const cuota = parseFloat(pago.cuotaPago) || 0;
            const mora = parseFloat(pago.moraPago) || 0;
            const exceso = parseFloat(pago.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);
        setTotalPago(total);
    }, [pagos]);

    const handleInputValidation = (e, max, idlectura, field) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar números y punto decimal
        if (regex.test(value) && parseFloat(value) <= max) {
            setPagos((prevPagos) =>
                prevPagos.map((pago) =>
                    pago.idlectura === idlectura
                        ? { ...pago, [field]: value }
                        : pago
                )
            );
        }
    };

    const getPagoForLectura = (idlectura, field) => {
        const pago = pagos.find((p) => p.idlectura === idlectura); // Buscamos el pago correspondiente
        return pago ? pago[field] || '' : ''; // Si existe el pago, devolvemos el valor del campo
    };
    

    // Función para actualizar la lectura con el pago ingresado
    const updateLecturaPago = (lecturaId, field, value) => {
        setLecturas((prevLecturas) => {
            return prevLecturas.map((lectura) => {
                if (lectura.idlectura === lecturaId) {
                    return { ...lectura, [field]: value };
                }
                return lectura;
            });
        });
    };
    

    // Efecto para recalcular el total cada vez que los valores de pago cambien
    useEffect(() => {
        const total = lecturas.reduce((acc, lectura) => {
            const cuota = parseFloat(lectura.cuotaPago) || 0;
            const mora = parseFloat(lectura.moraPago) || 0;
            const exceso = parseFloat(lectura.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);
        setTotalPago(total);
    }, [lecturas]); // Actualiza el total cada vez que las lecturas cambien


    useEffect(() => {
        filterServicios();
    }, [searchTerm, filterColumn, servicios]);

    const fetchLecturas = async (idservicio) => {
        try {
            setLoadingLecturas(true);
            const response = await axios.get(`${API_URL}/lecturas-idservicio/${idservicio}`);
            setLecturas(response.data.lecturas || []);  // Aseguramos que lecturas sea siempre un array
        } catch (error) {
            handleError(error, 'Error al cargar lecturas');
        } finally {
            setLoadingLecturas(false);
        }
    };

    const filterServicio = () => {
        const filtered = servicios.find(servicio => {
            const valueToFilter = filterColumn.includes('clientes.')
                ? servicio.clientes[filterColumn.split('.')[1]]
                : servicio.lotes[filterColumn.split('.')[1]];

            return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (filtered) {
            setFilteredServicio(filtered);
            fetchLecturas(filtered.idservicio); // Cargar lecturas del servicio filtrado
        } else {
            setFilteredServicio(null);
            setLecturas([]); // Limpiar lecturas si no hay servicio seleccionado
        }
    };

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

    const handleSearchClick = () => {
        if (!searchTerm.trim()) {
            // Si el campo de búsqueda está vacío, muestra un error con toast
            toast.error("No se ha ingresado ningún dato en el campo de búsqueda");
            return;
        }
        // Si hay datos en el campo de búsqueda, aplica el filtro
        filterServicio();
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

    const handleReset = () => {
        setFilteredServicio(null);  // Restablece el resultado mostrado a null
        setSearchTerm('');          // Limpia el campo de búsqueda
    };

    const handlePagarTodoClick = () => {
        if (lecturas.length === 0) {
            toast.error("No hay registros para realizar el pago");
            return;
        }
        const total = lecturas.reduce((acc, lectura) => acc + parseFloat(lectura.suma_total || 0), 0);
        setMontoPagar(total); // Establece el monto total a pagar para el pago completo
        setShowModal(true);
    };

    const handlePagoParcialPagarClick = () => {
        const totalParcial = pagos.reduce((acc, pago) => {
            const cuota = parseFloat(pago.cuotaPago) || 0;
            const mora = parseFloat(pago.moraPago) || 0;
            const exceso = parseFloat(pago.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);

        setMontoPagar(totalParcial); // Establece el monto a pagar para el Pago Parcial
        setShowPagoParcialModal(false); // Cierra el modal de Pago Parcial
        setShowModal(true); // Abre el modal de pagos
    };

    
    

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleValorRecibidoChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar solo números y punto decimal
        if (regex.test(value)) {
            setValorRecibido(value);
            setCambio((parseFloat(value || 0) - montoPagar).toFixed(2));
        }
    };

    const handleConceptoPagoChange = (e) => {
        setConceptoPago(e.target.value);
    };

    const handleModalPagarClick = () => {
        // Aquí podrías implementar la lógica para realizar el pago
        toast.success("Pago realizado con éxito");
        setShowModal(false);
    };

    useEffect(() => {
        if (showModal) {
            // Inicializa el valor recibido como vacío cuando se abre el modal
            setValorRecibido('');
        }
    }, [showModal]);

    // Asegúrate de que lecturas sea un array antes de usar .slice()
    const indexOfLastLectura = currentPage * rowsPerPage;
    const indexOfFirstLectura = indexOfLastLectura - rowsPerPage;
    const currentLecturas = Array.isArray(lecturas) ? lecturas.slice(indexOfFirstLectura, indexOfLastLectura) : [];

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePagoParcialClick = () => {
        if (lecturas.length === 0) {
            toast.error("No hay registros para realizar un pago parcial");
            return;
        }
        setShowPagoParcialModal(true);
    };
    
    const handlePagoParcialModalClose = () => {
        setShowPagoParcialModal(false);
    };
    

    return (
        <main>
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
                    <button onClick={handleSearchClick}>Buscar</button>
                    <button onClick={handleReset}>Nuevo</button>
                </div>
                
                <div className="pagos-resultados">
                    {filteredServicio ? (
                        <div className="resultado-item">
                            <div className="row">
                                <label>Nombre del Cliente:</label>
                                <h3>{filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</h3>
                            </div>
                            <div className="row">
                                <label>NIT:</label> 
                                <h3>{filteredServicio.clientes.nit}</h3>
                            </div>
                            <div className="row">
                                <label>Título:</label>
                                <h3>{filteredServicio.no_titulo}</h3>
                            </div>
                            <div className="row">
                                <label>No. Contador:</label>
                                <h3>{filteredServicio.no_contador}</h3>
                            </div>
                            <div className="row">
                                <label>Estado:</label>
                                <h3>{filteredServicio.estatus_contador}</h3>
                            </div>
                            <div className="row">
                                <label>Lote:</label>
                                <h3>{filteredServicio.lotes.ubicacion}</h3>
                            </div>
                        </div>
                    ) : (
                        <p>No se ha seleccionado ningún servicio.</p>  // Texto inicial si no hay selección
                    )}
                </div>
                
                {filteredServicio ? (
                    <div>
                        <div className="pagos-titulo-tabla">
                            <h2>Lecturas del servicio: {filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</h2>
                            <h2>Lote: {filteredServicio.lotes.ubicacion}</h2>
                        </div>
                        <div className="pagos-lectura-buttons">
                            <button onClick={handlePagarTodoClick}>Pagar Todo</button>
                            <button onClick={handlePagoParcialClick}>Pago Parcial</button>
                            <button>Pagos Adelantados</button>
                            <button>Pagar</button>
                        </div>
                        {/* Mostrar lecturas en una tabla */}
                        <div className="lecturas-table">
                            <table className="lecturas-data-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Mes</th>
                                        <th>Lectura</th>
                                        <th>Cuota</th>
                                        <th>% Mora</th>
                                        <th>Monto Mora</th>
                                        <th>Total Mensual</th>
                                        <th>Monto Acumulado</th>
                                        <th>Exceso</th>
                                        <th>Monto Exceso</th>
                                        <th>Total Excesos</th>
                                        <th>Suma Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingLecturas ? (
                                        <tr>
                                            <td colSpan="12">Cargando lecturas...</td>
                                        </tr>
                                    ) : currentLecturas.length > 0 ? (
                                        currentLecturas.map((lectura) => {
                                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                            const mesNombre = meses[lectura.mes - 1];
                                            const porcentajeMora = `${(lectura.porcentaje_acumulado * 100).toFixed(0)}%`;
                                            return (
                                                <tr key={lectura.idlectura}>
                                                    <td>{lectura.año}</td>
                                                    <td>{mesNombre}</td>
                                                    <td>{lectura.lectura}</td>
                                                    <td>{lectura.cuota}</td>
                                                    <td>{porcentajeMora}</td>
                                                    <td>{lectura.monto_mora}</td>
                                                    <td>{lectura.cuota_mensual}</td>
                                                    <td>{lectura.monto_acumulado}</td>
                                                    <td>{lectura.exceso}</td>
                                                    <td>{lectura.monto_exceso}</td>
                                                    <td>{lectura.total}</td>
                                                    <td>{lectura.suma_total}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="12">No se encontraron lecturas para este servicio.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            <div className="pagination">
                                <button onClick={() => paginate(1)} disabled={currentPage === 1}>Inicio</button>
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                                {Array.from({ length: Math.ceil(lecturas.length / rowsPerPage) }, (_, index) => (
                                    <button key={index + 1} onClick={() => paginate(index + 1)}>
                                        {index + 1}
                                    </button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(lecturas.length / rowsPerPage)}>Siguiente</button>
                                <button onClick={() => paginate(Math.ceil(lecturas.length / rowsPerPage))} disabled={currentPage === Math.ceil(lecturas.length / rowsPerPage)}>Último</button>
                                <select className="rows-per-page" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>

                    </div>
                )                  
                : (
                    <p></p>
                )
                }
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

            {/* Modal para Pagar Todo */}
            
            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <h2>Pagos</h2>
                            <label>Monto a Pagar:</label>
                            <p>Q.{montoPagar.toFixed(2)}</p>

                            <label>Valor Recibido:</label>
                            <input
                                type="text"
                                value={valorRecibido}
                                onChange={handleValorRecibidoChange}
                                placeholder="Q.0.00"
                                className="valor"
                                inputMode="decimal"
                            />

                            <label>Cambio:</label>
                            <p className="cambio">Q.{cambio}</p>

                            <label>Concepto del Pago:</label>
                            <input
                                type="text"
                                value={conceptoPago}
                                onChange={handleConceptoPagoChange}
                                placeholder="Ingrese el concepto del pago"
                                className="concepto"
                            />

                            <div className="modal-buttons">
                                <button onClick={handleModalPagarClick}>Pagar</button>
                                <button onClick={handleModalClose}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showPagoParcialModal && (
                <div className="modal-overlay pago-parcial-modal" onClick={handlePagoParcialModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Pago Parcial</h2>
                        {filteredServicio && (
                            <div className="cliente-info">
                                <p><strong>Cliente:</strong> {filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</p>
                                <p><strong>Lote:</strong> {filteredServicio.lotes.ubicacion}</p>
                                <p className="total"><strong>Total: Q. {totalPago.toFixed(2)}</strong></p>
                            </div>
                        )}

                        {lecturas.length === 0 ? (
                            <p>No se encontraron registros para realizar un pago parcial.</p>
                        ) : (
                            <div className="pagoparcial-lecturas-table">
                                <table className="lecturas-data-table">
                                    <thead>
                                        <tr>
                                            <th>Año</th>
                                            <th>Mes</th>
                                            <th>Lectura</th>
                                            <th>Exceso</th>
                                            <th>Cuota</th>
                                            <th>Monto Mora</th>
                                            <th>Monto Exceso</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lecturas.map((lectura) => {
                                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                            const mesNombre = meses[lectura.mes - 1];

                                            const cuotaPago = parseFloat(getPagoForLectura(lectura.idlectura, 'cuotaPago')) || 0;
                                            const moraPago = parseFloat(getPagoForLectura(lectura.idlectura, 'moraPago')) || 0;
                                            const excesoPago = parseFloat(getPagoForLectura(lectura.idlectura, 'excesoPago')) || 0;
                                            const totalFila = cuotaPago + moraPago + excesoPago;

                                            return (
                                                <tr key={lectura.idlectura}>
                                                    <td>{lectura.año}</td>
                                                    <td>{mesNombre}</td>
                                                    <td>{lectura.lectura}</td>
                                                    <td>{lectura.exceso}</td>

                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.cuota}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Cuota"
                                                                value={getPagoForLectura(lectura.idlectura, 'cuotaPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.cuota, lectura.idlectura, 'cuotaPago')}
                                                                readOnly={lectura.cuota === 0}
                                                                style={{ backgroundColor: lectura.cuota === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.monto_mora}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Mora"
                                                                value={getPagoForLectura(lectura.idlectura, 'moraPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.monto_mora, lectura.idlectura, 'moraPago')}
                                                                readOnly={lectura.monto_mora === 0}
                                                                style={{ backgroundColor: lectura.monto_mora === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.monto_exceso}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Exceso"
                                                                value={getPagoForLectura(lectura.idlectura, 'excesoPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.monto_exceso, lectura.idlectura, 'excesoPago')}
                                                                readOnly={lectura.monto_exceso === 0}
                                                                style={{ backgroundColor: lectura.monto_exceso === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>{totalFila.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button onClick={handlePagoParcialPagarClick}>Pagar</button>
                            <button onClick={handlePagoParcialModalClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}




        </main>
    );
};

export default Pagos;