import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../design/Clientes.css'; // Asegúrate de crear este archivo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';
import MotorValidaciones from './MotorValidaciones';
import {validaDPI, validaNIT, ValidaTelefono} from './ValidacionesAlmacenar';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('nombre');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [deleting, setDeleting] = useState(false);

    //ReferenciasValidaciones
    const telefonoRef = useRef(null);
    const nombreRef = useRef(null);
    const apellidosRef = useRef(null);
    const correoRef = useRef(null);    
    const cuiRef = useRef(null);
    const nitRef = useRef(null);

    useEffect(() => {
        fetchClientes();

        //Validaciones
        MotorValidaciones.agregarEvento(telefonoRef.current, 'keypress', MotorValidaciones.validaSoloNumeros, 0);
        MotorValidaciones.agregarEvento(nombreRef.current, 'keypress', MotorValidaciones.validaSoloLetras);
        MotorValidaciones.agregarEvento(apellidosRef.current, 'keypress', MotorValidaciones.validaSoloLetras);
        MotorValidaciones.agregarEvento(correoRef.current, 'keypress', MotorValidaciones.validaCaracteresEmail);
        MotorValidaciones.agregarEvento(cuiRef.current, 'keypress', MotorValidaciones.validaSoloNumeros, 0);
        MotorValidaciones.agregarEvento(nitRef.current, 'keypress', MotorValidaciones.validarNITKeyPress, 0);
        if (correoRef.current) {
            MotorValidaciones.agregarEvento(correoRef.current, 'blur', MotorValidaciones.validarEmailCompleto);
        }
        if (cuiRef.current) {
            MotorValidaciones.agregarEvento(cuiRef.current, 'blur', MotorValidaciones.validarDPI);
        }
        if (nitRef.current) {
            MotorValidaciones.agregarEvento(nitRef.current, 'blur', MotorValidaciones.validarNIT);
        }
        if (telefonoRef.current) {
            MotorValidaciones.agregarEvento(telefonoRef.current, 'blur', MotorValidaciones.validaSoloNumerosCompleto);
        }
        if (nombreRef.current) {
            MotorValidaciones.agregarEvento(nombreRef.current, 'blur', MotorValidaciones.validaSoloLetrasCompleto);
        }
        if (apellidosRef.current) {
            MotorValidaciones.agregarEvento(apellidosRef.current, 'blur', MotorValidaciones.validaSoloLetrasCompleto);
        }

    }, []);

    const fetchClientes = async () => {
        try {
            const response = await axios.get(`${API_URL}/clientes`);
            setClientes(response.data.clientes);
        } catch (error) {
            handleError(error, 'Error al cargar clientes');
        }
    };
    
    const handleSelectCliente = (cliente) => {
        setSelectedCliente(cliente);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        setSelectedCliente({
            ...selectedCliente,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

        if (!selectedCliente || !selectedCliente.nombre || !selectedCliente.apellidos || !selectedCliente.cui || !selectedCliente.telefono || !selectedCliente.email) {
            toast.error('Todos los campos son obligatorios.');
            return false;
        }

        const resValidaTelefono = ValidaTelefono(selectedCliente.telefono)
        if (!resValidaTelefono.valido) {
            toast.error(resValidaTelefono.mensaje);
            return false;
        }

        if (!emailRegex.test(selectedCliente.email)) {
            toast.error('Debe ingresar un correo electrónico válido.');
            return false;
        }

        const resValidaDPI = validaDPI(selectedCliente.cui);
        if (!resValidaDPI.valido) {
            toast.error(resValidaDPI.mensaje);
            return false;
        }

        const ResValidaNIT = validaNIT(selectedCliente.nit);
        if(!ResValidaNIT.valido){
            toast.error(ResValidaNIT.mensaje);
            return false;
        }

        

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true); 
        try {
            if (selectedCliente && selectedCliente.idcliente) {
                await axios.put(`${API_URL}/clientes/${selectedCliente.idcliente}`, selectedCliente);
                toast.success('Cliente actualizado');
            } else {
                await axios.post(`${API_URL}/clientes`, selectedCliente);
                toast.success('Cliente creado');
            }
            fetchClientes();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar el cliente.');
        } finally {
            setLoadingSave(false); 
        }
    };

    const handleDeleteClick = (idcliente) => {
        setClienteToDelete(idcliente);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${API_URL}/clientes/${clienteToDelete}`);
            toast.success('Cliente eliminado');
            fetchClientes();
            clearForm();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                // Si el servidor responde con un conflicto (status 409), significa que hay relaciones de claves foráneas
                toast.error('No se puede eliminar el cliente porque tiene registros relacionados.');
            } else {
                handleError(error, 'No se puede eliminar este Cliente.');
            }
        } finally {
            setShowModal(false);
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        setClienteToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idcliente) => {
        setLoadingToggle(true); 
        try {
            await axios.patch(`${API_URL}/clientes/${idcliente}/toggle`);
            toast.success('Estado cambiado');
            fetchClientes();
        } catch (error) {
            handleError(error, 'Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false); 
        }
    };

    const clearForm = () => {
        setSelectedCliente(null);
        setLoadingToggle(false); 
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredClientes = clientes.filter((cliente) =>
        cliente[filterColumn].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentClientes = filteredClientes.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getPaginationRange = (currentPage, totalPages) => {
        const totalNumbersToShow = 3; // Total de números de páginas a mostrar en el centro
        const totalButtons = 5; // Total de botones de paginación (páginas + ...)
        let pages = [];
    
        if (totalPages <= totalButtons) {
            // Mostrar todas las páginas si el total es menor o igual al número permitido de botones
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Mostrar siempre la primera página
            pages.push(1);
    
            // Si la página actual es mayor a 4, mostrar el '...'
            if (currentPage > 4) {
                pages.push('...');
            }
    
            // Definir las páginas centrales, dependiendo de si estamos al principio o al final
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
    
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
    
            // Si estamos a más de 2 páginas del final, mostrar el '...'
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
    
            // Mostrar siempre la última página
            if (endPage < totalPages) {
                pages.push(totalPages);
            }
        }
    
        return pages;
    };

    const paginationRange = getPaginationRange(currentPage, Math.ceil(filteredClientes.length / rowsPerPage));

    return (
        <main className="clientes-container">
            <ToastContainer />
            <section className="clientes-section">
                <h1 className="clientes-title">Gestión de Clientes</h1>
                <div className="clientes-data">
                    <div className="row">
                        <label className="clientes-label">Nombre:</label>
                        <input
                            className="clientes-input"
                            type="text"
                            placeholder="Nombre del Cliente"
                            name="nombre"
                            value={selectedCliente ? selectedCliente.nombre : ''}
                            onChange={handleInputChange}
                            ref={nombreRef}
                        />
                    </div>
                    <div className="row">
                        <label className="clientes-label">Apellidos:</label>
                        <input
                            className="clientes-input"
                            type="text"
                            placeholder="Apellidos del Cliente"
                            name="apellidos"
                            value={selectedCliente ? selectedCliente.apellidos : ''}
                            onChange={handleInputChange}
                            ref={apellidosRef}
                        />
                    </div>
                    <div className="row">
                        <label className="clientes-label">CUI:</label>
                        <input
                            className="clientes-input"  
                            type="text"
                            placeholder="CUI del Cliente"
                            name="cui"
                            value={selectedCliente ? selectedCliente.cui : ''}
                            onChange={handleInputChange}
                            ref = {cuiRef}
                        />
                    </div>
                    <div className="row">
                        <label className="clientes-label">NIT:</label>
                        <input
                            className="clientes-input"
                            type="text"
                            placeholder="NIT del Cliente"
                            name="nit"
                            value={selectedCliente ? selectedCliente.nit : ''}
                            onChange={handleInputChange}
                            ref = {nitRef}
                        />
                    </div>
                    <div className="row">
                        <label className="clientes-label">Teléfono:</label>
                        <input
                            className="clientes-input"
                            type="text"
                            placeholder="Teléfono del Cliente"
                            name="telefono"
                            value={selectedCliente ? selectedCliente.telefono : ''}
                            onChange={handleInputChange}
                            ref={telefonoRef}
                        />
                    </div>
                    <div className="row">
                        <label className="clientes-label">Correo:</label>
                        <input
                            className="clientes-input"
                            type="email"
                            placeholder="Correo del Cliente"
                            name="email"
                            value={selectedCliente ? selectedCliente.email : ''}
                            onChange={handleInputChange}
                            ref={correoRef}
                        />
                    </div>
                </div>
                <div className="clientes-data-buttons">
                    <button className="clientes-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedCliente && selectedCliente.idcliente ? 'Actualizando...' : 'Agregando...') : (selectedCliente && selectedCliente.idcliente ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="clientes-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedCliente && !editing && (
                        <button className="clientes-button" onClick={() => {toggleActive(selectedCliente.idcliente); clearForm();}} disabled={loadingToggle}>
                            {loadingToggle ? (selectedCliente.activo ? 'Desactivando...' : 'Activando...') : (selectedCliente.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                </div>
            </section>
            <section className="clientes-section">
                <h1 className="clientes-title">Datos Existentes</h1>
                <div className="clientes-buscar">
                    <label className="clientes-label">Buscar:</label>
                    <select
                        className="clientes-select"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        <option value="nombre">Nombre</option>
                        <option value="apellidos">Apellidos</option>
                        <option value="cui">CUI</option>
                        <option value="telefono">Teléfono</option>
                    </select>
                    <input
                        type="text"
                        className="clientes-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="clientes-table">
                    <table className="clientes-data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>CUI</th>
                                <th>NIT</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentClientes.map((cliente) => (
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
                                    <td className="clientes-actions">
                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(cliente.idcliente); }} disabled={loadingSave || loadingToggle}>
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

                        {paginationRange.map((page, index) =>
                            page === '...' ? (
                                <span key={index} className="pagination-dots">...</span>
                            ) : (
                                <button
                                    key={index}
                                    onClick={() => paginate(page)}
                                    className={currentPage === page ? 'active' : ''}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredClientes.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredClientes.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredClientes.length / rowsPerPage)}>Último</button>

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
                            <button 
                                onClick={confirmDelete} 
                                className="confirm-button" 
                                disabled={deleting}  // Deshabilitar el botón mientras se está eliminando
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                            <button onClick={cancelDelete} className="cancel-button" disabled={deleting}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Clientes;
