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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('ID configuracion');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [servicioToDelete, setServicioToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await axios.get(`${API_URL}/servicio`);
            setServicios(response.data.servicios);
        } catch (error) {
            handleError(error, 'Error al cargar servicios');
        }
    };

    const handleSelectServicio = (servicio) => {
        setSelectedServicio(servicio);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        setSelectedServicio({
            ...selectedServicio,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        const cuiRegex = /^[0-9]{13}$/;
        const phoneRegex = /^(\+502\s?)?(\d{8})$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        /*if (!selectedServicio || !selectedServicio.nombre || !selectedServicio.apellidos || !selectedServicio.cui || !selectedServicio.telefono || !selectedServicio.email) {
            toast.error('Todos los campos son obligatorios.');
            return false;
        }

        if (!cuiRegex.test(selectedServicio.cui)) {
            toast.error('El CUI debe contener exactamente 13 dígitos.');
            return false;
        }

        if (!phoneRegex.test(selectedServicio.telefono)) {
            toast.error('El número de teléfono debe tener un formato válido.');
            return false;
        }

        if (!emailRegex.test(selectedServicio.email)) {
            toast.error('Debe ingresar un correo electrónico válido.');
            return false;
        }*/

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true); 
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
        setLoadingToggle(false); 
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredServicios = servicios.filter((servicio) => {
        const value = servicio[filterColumn] !== undefined ? servicio[filterColumn].toString() : '';
        return value.toLowerCase().includes(searchTerm.toLowerCase());
    });
    

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentServicios = filteredServicios.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="servicios-container">
            <ToastContainer />
            <section className="servicios-section">
                <h1 className="servicios-title">Gestión de Servicios</h1>
                <div className="servicios-data">
                    <div className="row">
                        <label className="servicios-label">Configuracion:</label>
                        <input
                            className="servicios-input"
                            type="text"
                            placeholder="ID de la configuracion"
                            name="idconfiguracion"
                            value={selectedServicio ? selectedServicio.idconfiguracion: ''}
                            onChange={handleInputChange}
                        />
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
                        <option value="idconfiguracion">ID de configuracion</option>
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
                                <th>ID configuracion</th>
                                <th>No. Titulo</th>
                                <th>No. Contador</th>
                                <th>Estatus</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentServicios.map((servicio) => (
                                <tr key={servicio.idservicio} onClick={() => handleSelectServicio(servicio)}>
                                    <td>{servicio.idconfiguracion}</td>
                                    <td>{servicio.no_titulo}</td>
                                    <td>{servicio.no_contador}</td>
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
        </main>
    );
};

export default Servicios;