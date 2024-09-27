import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Servicios.css'; // Asegúrate de crear este archivo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTermLote, setSearchTermLote] = useState('');
    const [searchTermCliente, setSearchTermCliente] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('servicio');
    const [filterColumnLote, setFilterColumnLote] = useState('ubicacion');
    const [filterColumnCliente, setFilterColumnCliente] = useState('nombre');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPageClientes, setCurrentPageClientes] = useState(1);
    const [rowsPerPageClientes, setRowsPerPageClientes] = useState(5);
    const [currentPageLotes, setCurrentPageLotes] = useState(1);
    const [rowsPerPageLotes, setRowsPerPageLotes] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [showLotesModal, setShowLotesModal] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [showClientesModal, setShowClientesModal] = useState(false);
    const [servicioToDelete, setServicioToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [configuraciones, setConfiguraciones] =useState([]);
    const [lotes, setLotes] =useState([]);
    const [pagos, setPagos] =useState([]);
    const [clientes, setClientes] =useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const [isLoteSelected, setIsLoteSelected] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [isClienteSelected, setIsClienteSelected] = useState(false);
    const [currentPago, setCurrentPago] = useState(null)

    useEffect(() => {
        fetchServicios();
        fetchConfiguraciones();
        fetchLotes();
        fetchClientes();
        fetchPagos();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await axios.get(`${API_URL}/servicioalt`);
            setServicios(response.data.servicios);
        } catch (error) {
            handleError(error, 'Error al cargar servicios');
        }
    };

    const fetchConfiguraciones = async () => {
        try {
            const response = await axios.get(`${API_URL}/configuracion`);
            setConfiguraciones(response.data.configuraciones);
        } catch (error) {
            handleError(error, 'Error al cargar configuraciones');
        }
    };

    const fetchLotes = async () => {
        try {
            const response = await axios.get(`${API_URL}/lote`);
            setLotes(response.data.lotes);
        } catch (error) {
            handleError(error, 'Error al cargar lotes');
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await axios.get(`${API_URL}/clientes`);
            setClientes(response.data.clientes);
        } catch (error) {
            handleError(error, 'Error al cargar clientes');
        }
    };

    const fetchPagos = async () => {
        try {
            const response = await axios.get(`${API_URL}/pagoser`);
            setPagos(response.data.pagoservicios);
        } catch (error) {
            handleError(error, 'Error al cargar Pagos');
        }
    };


    const handleSelectServicio = (servicio) => {
        setSelectedServicio(servicio);
        setSelectedLote(null)
        setIsLoteSelected(false)
        setSelectedCliente(null)
        setIsClienteSelected(false)
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleSelectLote = (lote) => {
        setSelectedLote(lote);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleSelectCliente = (cliente) => {
        setSelectedCliente(cliente);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleSeleccionarLote = () => {
        if (selectedLote) {
            setIsLoteSelected(true);
            setShowLotesModal(false);
        } else {
            alert("Por favor, selecciona un lote antes de confirmar."); 
        }
    };

    const handleSeleccionarCliente = () => {
        if (selectedCliente) {
            setIsClienteSelected(true);
            setShowClientesModal(false);
        } else {
            alert("Por favor, selecciona un cliente antes de confirmar."); 
        }
    };

    const handleInputChange = (e) => {
        setSelectedServicio({
            ...selectedServicio,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const handleShowLotes = () => {
        setShowLotesModal(true);
    }

    const handleShowClientes = () => {
        setShowClientesModal(true);
    }

    const handleShowPagos = () =>{
        setShowPagoModal(true);
    }

    const validateForm = () => {
         if (!selectedServicio || !selectedServicio.no_titulo || !selectedServicio.no_contador || !selectedServicio.estatus_contador
            || !selectedServicio.idconfiguracion || !selectedServicio.ubicacion || !selectedServicio.nombre
        ) {
            toast.error('Todos los campos son obligatorios.');
            console.log(selectedServicio);
            return false;
        }
        
        

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true); 
        if(selectedCliente!=null){
            selectedServicio.idcliente=selectedCliente.idcliente;
        }
        if(selectedLote!=null){
            selectedServicio.idlote=selectedLote.idlote;
        }
        try {
            if (selectedServicio && selectedServicio.idservicio) {
                await axios.put(`${API_URL}/servicio/${selectedServicio.idservicio}`, selectedServicio);
                toast.success('Servicio actualizado');
            } else {
                await axios.post(`${API_URL}/servicio`, selectedServicio);
                toast.success('Servicio creado');
            }
            fetchServicios();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar el servicio.');
        } finally {
            setLoadingSave(false); 
        }
    };

    const handleDeleteClick = (idservicio) => {
        setServicioToDelete(idservicio);
        setShowModal(true);
    };
    
    
    const handlePayClick = (idpago) => {
        setCurrentPago(pagos.filter((pago) =>
            pago['idservicio'].toString().toLowerCase().includes(idpago)));
        setShowPagoModal(true);
    };

    const confirmDelete = async () => {
        setLoadingSave(true); 
        try {
            await axios.delete(`${API_URL}/servicio/${servicioToDelete}`);
            toast.success('Servicio eliminado');
            fetchServicios();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al eliminar el servicio.');
        } finally {
            setShowModal(false);
            setLoadingSave(false); 
        }
    };

    const cancelDelete = () => {
        setServicioToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idservicio) => {
        setLoadingToggle(true); 
        try {
            await axios.patch(`${API_URL}/servicio/${idservicio}/toggle`);
            toast.success('Estado cambiado');
            fetchServicios();
        } catch (error) {
            handleError(error, 'Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false); 
        }
    };

    const clearForm = () => {
        setSelectedServicio(null);
        setSelectedCliente(null);
        setSelectedLote(null);
        setLoadingToggle(false); 
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredServicios = servicios.filter((servicio) =>
        servicio[filterColumn].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLotes = lotes.filter((lote) =>
        lote[filterColumnLote].toString().toLowerCase().includes(searchTermLote.toLowerCase())
    );

    const filteredCliente = clientes.filter((cliente) =>
        cliente[filterColumnCliente].toString().toLowerCase().includes(searchTermCliente.toLowerCase())
        
    );

    
    

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const indexOfLastPostClientes = currentPageClientes * rowsPerPageClientes;
    const indexOfFirstPostClientes = indexOfLastPostClientes - rowsPerPageClientes;
    const indexOfLastPostLotes = currentPageLotes * rowsPerPageLotes;
    const indexOfFirstPostLotes = indexOfLastPostLotes - rowsPerPageLotes;
    const currentServicios = filteredServicios.slice(indexOfFirstPost, indexOfLastPost);
    const currentLote = filteredLotes.slice(indexOfFirstPostLotes, indexOfLastPostLotes);
    const currentCliente = filteredCliente.slice(indexOfFirstPostClientes, indexOfLastPostClientes);
    

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const paginateClientes = (pageNumber) => setCurrentPageClientes(pageNumber);
    const paginateLotes = (pageNumber) => setCurrentPageLotes(pageNumber);

    return (
        <main className="servicios-container">
            <ToastContainer />
            <section className="servicios-section">
                <h1 className="servicios-title">Gestión de Servicios</h1>
                <div className="servicios-data">
                    <div className="row">
                        <label className="servicios-label">Configuracion:</label>
                        <select
                            className='servicios-select'
                            name='idconfiguracion'
                            value={selectedServicio ? selectedServicio.idconfiguracion: ''}
                            onChange={handleInputChange}
                        >
                            <option value=''>Selecciona una configuracion</option>
                            {configuraciones.map((configuracion)=>(
                                <option key={configuracion.idconfiguracion} value={configuracion.idconfiguracion}>
                                    {configuracion.servicio}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                        <label className="servicios-label">Lote:</label>
                        <div className='input-container'>
                            <input
                                className="select-input"
                                type="text"
                                placeholder="Lote"
                                name="ubicacion"
                                value={isLoteSelected && selectedLote ? selectedLote.ubicacion : (selectedServicio ? selectedServicio.loteubicacion : '')}
                                onChange={handleInputChange}
                                readOnly
                            />
                            <input
                                type="hidden"
                                name="idlote"
                                value={isLoteSelected && selectedLote ? selectedLote.idlote : (selectedServicio ? selectedServicio.idlote : '')}
                                readOnly
                            />
                            <button 
                                className="btn-select" 
                                type="button"
                                onClick= {(e) => { e.stopPropagation(); handleShowLotes()}}
                            >
                                <i className="fas fa-mouse-pointer"></i> {}
                            </button>
                        </div>
                    </div>
                    <div className="row">
                        <label className="servicios-label">Cliente</label>
                        <div className='input-container'>
                            <input
                                className="select-input"
                                type="text"
                                placeholder="Cliente"
                                name="nombre"
                                value={isClienteSelected && selectedCliente ? selectedCliente.nombre+' '+selectedCliente.apellidos : (selectedServicio ? selectedServicio.nombrecliente : '')}
                                onChange={handleInputChange}
                                readOnly
                            />
                             <input
                                type='hidden'
                                name='idcliente'
                                value={isClienteSelected && selectedCliente ? selectedCliente.idcliente : (selectedServicio ? selectedServicio.idcliente : '')}
                                readOnly
                            />
                            <button
                                className='btn-select'
                                type='button'
                                onClick={(e) => { e.stopPropagation(); handleShowClientes()}}
                            >
                                <i className="fas fa-mouse-pointer"></i> {}
                            </button>
                        </div>
                    </div>
                    <div className="row">
                        <label className="servicios-label">No. Titulo:</label>
                        <input
                            className="servicios-input"
                            type="text"
                            placeholder="Numero de titulo"
                            name="no_titulo"
                            value={selectedServicio ? selectedServicio.no_titulo: ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="servicios-label">No. Contador:</label>
                        <input
                            className="servicios-input"
                            type="text"
                            placeholder="Numero de contador"
                            name="no_contador"
                            value={selectedServicio ? selectedServicio.no_contador : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="servicios-label">Estatus:</label>
                        <input
                            className="servicios-input"
                            type="text"
                            placeholder="Estado actual del servicio"
                            name="estatus_contador"
                            value={selectedServicio ? selectedServicio.estatus_contador : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="servicios-data-buttons">
                    <button className="servicios-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedServicio && selectedServicio.idservicio ? 'Actualizando...' : 'Agregando...') : (selectedServicio && selectedServicio.idservicio ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="servicios-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedServicio && !editing && (
                        <button className="servicios-button" onClick={() => {toggleActive(selectedServicio.idservicio); clearForm();}} disabled={loadingToggle}>
                            {loadingToggle ? (selectedServicio.activo ? 'Desactivando...' : 'Activando...') : (selectedServicio.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                </div>
            </section>
            <section className="servicios-section">
                <h1 className="servicios-title">Datos Existentes</h1>
                <div className="servicios-buscar">
                    <label className="servicios-label">Buscar:</label>
                    <select
                        className="servicios-select"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        <option value="servicio">Configuracion</option>
                        <option value="loteubicacion">Lote</option>
                        <option value="nombrecliente">Cliente</option>
                        <option value="no_titulo">No. Titulo</option>
                        <option value="no_contador">No. Contador</option>
                        <option value="estatus_contador">Estatus</option>
                    </select>
                    <input
                        type="text"
                        className="servicios-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="servicios-table">
                    <table className="servicios-data-table">
                        <thead>
                            <tr>
                                <th>Configuracion</th>
                                <th>Lote</th>
                                <th>Cliente</th>
                                <th>No. Titulo</th>
                                <th>No. Contador</th>
                                <th>Pago</th>
                                <th>Estatus</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentServicios.map((servicio) => (
                                <tr key={servicio.idservicio} onClick={() => handleSelectServicio(servicio)}>
                                    <td>{servicio.servicio}</td>
                                    <td>{servicio.loteubicacion}</td>
                                    <td>{servicio.nombrecliente}</td>
                                    <td>{servicio.no_titulo}</td>
                                    <td>{servicio.no_contador}</td>
                                    <td>
                                        <button className="status active" onClick={(e) => { e.stopPropagation(); handlePayClick(servicio.idservicio); }}>
                                            <span className="material-icons ">payments</span>
                                        </button>
                                    </td>
                                    <td>{servicio.estatus_contador}</td>
                                    <td>
                                        <span className={`status ${servicio.activo ? 'active' : 'inactive'}`}>
                                            {servicio.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="servicios-actions">
                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(servicio.idservicio); }} disabled={loadingSave || loadingToggle}>
                                            <span className="material-icons eliminar-icon">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button onClick={() => paginate(1)} disabled={currentPage === 1}>Inicio</button>
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                        {Array.from({ length: Math.ceil(filteredServicios.length / rowsPerPage) }, (_, index) => (
                            <button key={index + 1} onClick={() => paginate(index + 1)}>
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredServicios.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredServicios.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredServicios.length / rowsPerPage)}>Último</button>
                        <select className="rows-per-page" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} disabled={loadingSave || loadingToggle}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Modal de confirmación */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="material-icons modal-icon">warning</span>
                        <h3>¿Estás seguro que deseas eliminar este registro?</h3>
                        <div className="modal-buttons">
                            <button onClick={confirmDelete} className="confirm-button" disabled={loadingSave}>Eliminar</button>
                            <button onClick={cancelDelete} className="cancel-button" disabled={loadingSave}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {showLotesModal && (
                <div className='modal' style={{ zIndex: 1100}}>
                    <div className='modal-content-lotes'>
                        <h3>Asignacion de lote al servicio</h3>
                        <div className='modal-body'>
                            <div className='modal-section'>
                                <div className='servicios-buscar'>
                                    <label className='servicios-laberl'>Lote Seleccionado</label>
                                    <h3>{selectedLote?selectedLote.ubicacion:'Ninguno'}</h3>
                                </div>
                                <div className='servicios-buscar'>
                                    <label className='servicios-label'>Buscar</label>
                                    <select 
                                        className='servicios-select'
                                        value={filterColumnLote}
                                        onChange={(e)=> setFilterColumnLote(e.target.value)}
                                    >
                                        <option value='ubicacion'>Ubicacion</option>
                                        <option value='manzana'>Manzana</option>
                                        <option value='lote'>Lote</option>
                                    </select>
                                    <input
                                        type='text'
                                        className='servicios-input'
                                        placeholder='Buscar'
                                        value={searchTermLote}
                                        onChange={(e) => setSearchTermLote(e.target.value)}
                                    />
                                </div>
                                <div className='servicios-table'>
                                    <table className='servicios-data-table'>
                                        <thead>
                                            <tr>
                                                <th>Manzana</th>
                                                <th>Lote</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentLote.map((lote) => (
                                                <tr key={lote.idlote} onClick={() => handleSelectLote(lote)}>
                                                    <td>{lote.manzana}</td>
                                                    <td>{lote.lote}</td>
                                                    <td>
                                                        <span className={`status ${lote.activo ? 'active' : 'inactive'}`}>
                                                            {lote.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {Array.from({ length: rowsPerPageLotes - currentLote.length }, (_, index) => (
                                               <tr key={`empty-${index}`} className="empty-row">
                                                  <td colSpan="3">&nbsp;</td>
                                               </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="pagination">
                                        <button onClick={() => paginateLotes(1)} disabled={currentPageLotes === 1}>Inicio</button>
                                        <button onClick={() => paginateLotes(currentPageLotes - 1)} disabled={currentPageLotes === 1}>Anterior</button>
                                        {Array.from({ length: Math.ceil(filteredLotes.length / rowsPerPageLotes) }, (_, index) => (
                                            <button key={index + 1} onClick={() => paginateLotes(index + 1)}>
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button onClick={() => paginateLotes(currentPageLotes + 1)} disabled={currentPageLotes === Math.ceil(filteredLotes.length / rowsPerPageLotes)}>Siguiente</button>
                                        <button onClick={() => paginateLotes(Math.ceil(filteredLotes.length / rowsPerPageLotes))} disabled={currentPageLotes === Math.ceil(filteredLotes.length / rowsPerPageLotes)}>Último</button>
                                        <select className="rows-per-page" value={rowsPerPageLotes} onChange={(e) => setRowsPerPageLotes(Number(e.target.value))} disabled={loadingSave || loadingToggle}>
                                            <option value="5">5</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='pagination'>
                                    <button onClick={() => handleSeleccionarLote()} className='lote-confirm-buttonn'>Seleccionar</button>
                                    <button onClick={() => {setShowLotesModal(false); setSelectedLote(null)}} className='lote-cancel-button'>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showClientesModal && (
                <div className='servicio-modal'>
                    <div className='modal-content-usuarios'>
                        <h3>Asignación de cliente al servicio</h3>
                        <div className='modal-body'>
                            <div className='modal-section'>
                                <div className='servicios-buscar'>
                                    <label className='servicios-label'>Buscar</label>    
                                    <select 
                                        className='servicios-select'
                                        value={filterColumnCliente}
                                        onChange={(e) => setFilterColumnCliente(e.target.value)}
                                    >
                                        <option value='nombre'>Nombre</option>
                                        <option value='apellidos'>Apellidos</option>
                                        <option value='cui'>CUI</option>
                                        <option value='nit'>NIT</option>
                                        <option value='telefono'>Telefono</option>
                                        <option value='email'>Email</option>
                                    </select>
                                    <input
                                        type='text'
                                        className='servicios-input'
                                        placeholder='Buscar'
                                        value={searchTermCliente}
                                        onChange={(e) => setSearchTermCliente(e.target.value)}
                                    />
                                    <label className='servicios_label'>Cliente Seleccionado:</label>
                                    <h3 className='servicios_label'>{selectedCliente?selectedCliente.nombre+' '+selectedCliente.apellidos:'Ninguno'}</h3>
                                </div>
                                <div className='servicios-table'>
                                    <table className='servicios-data-table'>
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Apellidos</th>
                                                <th>CUI</th>
                                                <th>NIT</th>
                                                <th>Telefono</th>
                                                <th>Email</th>
                                                <th>Estatus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentCliente.map((cliente) => (
                                                <tr key={cliente.idcliente} onClick={() => handleSelectCliente(cliente)}>
                                                    <td>{cliente.nombre}</td>
                                                    <td>{cliente.apellidos}</td>
                                                    <td>{cliente.cui}</td>
                                                    <td>{cliente.nit}</td>
                                                    <td>{cliente.telefono}</td>
                                                    <td>{cliente.email}</td>
                                                    <td>
                                                        <span className={`status ${cliente.activo ? 'active' : 'inactive'}`}>
                                                            {cliente.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {Array.from({ length: rowsPerPageClientes - currentCliente.length }, (_, index) => (
                                               <tr key={`empty-${index}`} className="empty-row">
                                                  <td colSpan="7">&nbsp;</td>
                                               </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="pagination">
                                        <button onClick={() => paginateClientes(1)} disabled={currentPageClientes === 1}>Inicio</button>
                                        <button onClick={() => paginateClientes(currentPageClientes - 1)} disabled={currentPageClientes === 1}>Anterior</button>
                                        {Array.from({ length: Math.ceil(filteredCliente.length / rowsPerPageClientes) }, (_, index) => (
                                            <button key={index + 1} onClick={() => paginateClientes(index + 1)}>
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button onClick={() => paginateClientes(currentPageClientes + 1)} disabled={currentPageClientes === Math.ceil(filteredCliente.length / rowsPerPageClientes)}>Siguiente</button>
                                        <button onClick={() => paginateClientes(Math.ceil(filteredCliente.length / rowsPerPageClientes))} disabled={currentPageClientes === Math.ceil(filteredCliente.length / rowsPerPageClientes)}>Último</button>
                                        <select className="rows-per-page" value={rowsPerPageClientes} onChange={(e) => setRowsPerPageClientes(Number(e.target.value))} disabled={loadingSave || loadingToggle}>
                                            <option value="5">5</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='pagination'>
                                    <button onClick={() => handleSeleccionarCliente()} className='lote-confirm-buttonn'>Seleccionar</button>
                                    <button onClick={() => {setShowClientesModal(false); setSelectedCliente(null)}} className='lote-cancel-button'>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showPagoModal && (
                <div className='servicio-modal'>
                    <div className='modal-content-usuarios'>
                        <h3>Registro de Pago por Alta de Servicio</h3>
                        <div className='modal-body'>
                            <div className='modal-section'>
                                <div className='servicios-table'>
                                    <table className='servicios-data-table'>
                                        <thead>
                                            <tr>
                                                <th>Titulo</th>
                                                <th>Conexión</th>
                                                <th>Fecha</th>
                                                <th>Observaciones</th>
                                                <th>Activo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentPago.map((pago) => (
                                                <tr key={pago.idpago} onClick={() => handleSelectCliente(pago)}>
                                                    <td>{pago.cuota}</td>
                                                    <td>{pago.cuota_conexion}</td>
                                                    <td>{pago.fecha}</td>
                                                    <td>{pago.observaciones}</td>
                                                    <td>
                                                        <span className={`status ${pago.activo ? 'active' : 'inactive'}`}>
                                                            {pago.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {Array.from({ length: 4}, (_, index) => (
                                               <tr key={`empty-${index}`} className="empty-row">
                                                  <td colSpan="5">&nbsp;</td>
                                               </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className='pagination'>
                                    <button onClick={() => {setShowPagoModal(false)}} className='lote-cancel-button'>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Servicios;