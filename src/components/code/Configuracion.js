import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Configuracion.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Configuracion = () => {
    const [configuraciones, setConfiguraciones] = useState([]);
    const [selectedConfiguracion, setSelectedConfiguracion] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('servicio');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [configuracionToDelete, setConfiguracionToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    useEffect(() => {
        fetchConfiguraciones();
    }, []);

    const fetchConfiguraciones = async () => {
        try {
            const response = await axios.get(`${API_URL}/configuracion`);
            setConfiguraciones(response.data.configuraciones);
        } catch (error) {
            handleError(error, 'Error al cargar configuraciones');
        }
    };

    const handleSelectConfiguracion = (configuracion) => {
        setSelectedConfiguracion(configuracion);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        setSelectedConfiguracion({
            ...selectedConfiguracion,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        if (!selectedConfiguracion) {
            toast.error('La configuración seleccionada es inválida.');
            return false;
        }
    
        if (!selectedConfiguracion.servicio) {
            toast.error('El campo "Servicio" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.cuota) {
            toast.error('El campo "Cuota" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.porcentaje_mora) {
            toast.error('El campo "Mora" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.empresa) {
            toast.error('El campo "Empresa" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.direccion) {
            toast.error('El campo "Dirección" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.porcentaje_exceso) {
            toast.error('El campo "Porcentaje Exceso" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.limite) {
            toast.error('El campo "Límite" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.cuota_instalacion) {
            toast.error('El campo "Cuota de Instalación" es obligatorio.');
            return false;
        }
    
        if (!selectedConfiguracion.cuota_conexion) {
            toast.error('El campo "Cuota de Conexión" es obligatorio.');
            return false;
        }
    
        return true;
    };
    

    const handleSave = async () => {
        if (!validateForm()) return;
    
        setLoadingSave(true);
        try {
            if (selectedConfiguracion && selectedConfiguracion.idconfiguracion) {
                await axios.put(`${API_URL}/configuracion/${selectedConfiguracion.idconfiguracion}`, selectedConfiguracion);
                toast.success('Configuración actualizada');
            } else {
                await axios.post(`${API_URL}/configuracion`, selectedConfiguracion);
                toast.success('Configuración creada');
            }
            fetchConfiguraciones();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar la configuración.');
        } finally {
            setLoadingSave(false);
        }
    };
    

    const handleDeleteClick = (idconfiguracion) => {
        setConfiguracionToDelete(idconfiguracion);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setLoadingSave(true);
        try {
            await axios.delete(`${API_URL}/configuracion/${configuracionToDelete}`);
            toast.success('Configuración eliminada');
            fetchConfiguraciones();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al eliminar la configuración.');
        } finally {
            setShowModal(false);
            setLoadingSave(false);
        }
    };

    const cancelDelete = () => {
        setConfiguracionToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idconfiguracion) => {
        setLoadingToggle(true);
        try {
            await axios.patch(`${API_URL}/configuracion/${idconfiguracion}/toggle`);
            toast.success('Estado cambiado');
            fetchConfiguraciones();
        } catch (error) {
            handleError(error, 'Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false);
        }
    };

    const clearForm = () => {
        setSelectedConfiguracion(null);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredConfiguraciones = configuraciones.filter((configuracion) =>
        configuracion[filterColumn].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentConfiguraciones = filteredConfiguraciones.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="configuracion-container">
            <ToastContainer />
            <section className="configuracion-section">
                <h1 className="configuracion-title">Gestión de Configuraciones</h1>
                <div className="configuracion-data">
                    <div className="row">
                        <label className="configuracion-label">Servicio:</label>
                        <input
                            className="configuracion-input"
                            type="text"
                            placeholder="Nombre del Servicio"
                            name="servicio"
                            value={selectedConfiguracion ? selectedConfiguracion.servicio : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Cuota:</label>
                        <input
                            className="configuracion-input"
                            type="number"
                            placeholder="Cuota"
                            name="cuota"
                            value={selectedConfiguracion ? selectedConfiguracion.cuota : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Mora:</label>
                        <input
                            className="configuracion-input"
                            type="number"
                            placeholder="Mora"
                            name="porcentaje_mora"
                            value={selectedConfiguracion ? selectedConfiguracion.porcentaje_mora : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Empresa:</label>
                        <input
                            className="configuracion-input"
                            type="text"
                            placeholder="Nombre de la Empresa"
                            name="empresa"
                            value={selectedConfiguracion ? selectedConfiguracion.empresa : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Dirección:</label>
                        <input
                            className="configuracion-input"
                            type="text"
                            placeholder="Dirección"
                            name="direccion"
                            value={selectedConfiguracion ? selectedConfiguracion.direccion : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Porcentaje Exceso:</label>
                        <input
                            className="configuracion-input"
                            type="number"
                            placeholder="Porcentaje de Exceso"
                            name="porcentaje_exceso"
                            value={selectedConfiguracion ? selectedConfiguracion.porcentaje_exceso : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Límite:</label>
                        <input
                            className="configuracion-input"
                            type="number"
                            placeholder="Límite"
                            name="limite"
                            value={selectedConfiguracion ? selectedConfiguracion.limite : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Cuota de Instalación:</label>
                        <input
                            className="configuracion-input"
                            type="number"
                            placeholder="Cuota de Instalación"
                            name="cuota_instalacion"
                            value={selectedConfiguracion ? selectedConfiguracion.cuota_instalacion : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="configuracion-label">Cuota de Conexión:</label>
                        <input
                            className="configuracion-input"
                            type="number"
                            placeholder="Cuota de Reconexión"
                            name="cuota_conexion"
                            value={selectedConfiguracion ? selectedConfiguracion.cuota_conexion : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="configuracion-data-buttons">
                    <button className="configuracion-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedConfiguracion && selectedConfiguracion.idconfiguracion ? 'Actualizando...' : 'Agregando...') : (selectedConfiguracion && selectedConfiguracion.idconfiguracion ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="configuracion-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedConfiguracion && !editing && (
                        <button className="configuracion-button" onClick={() => {toggleActive(selectedConfiguracion.idconfiguracion); clearForm();}} disabled={loadingToggle}>
                            {loadingToggle ? (selectedConfiguracion.activo ? 'Desactivando...' : 'Activando...') : (selectedConfiguracion.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                </div>
            </section>
            <section className="configuracion-section">
                <h1 className="configuracion-title">Datos Existentes</h1>
                <div className="configuracion-buscar">
                    <label className="configuracion-label">Buscar:</label>
                    <select
                        className="configuracion-select"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        <option value="servicio">Servicio</option>
                        <option value="empresa">Empresa</option>
                        <option value="direccion">Dirección</option>
                    </select>
                    <input
                        type="text"
                        className="configuracion-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="configuracion-table">
                    <table className="configuracion-data-table">
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th>Empresa</th>
                                <th>Dirección</th>
                                <th>Cuota</th>
                                <th>Mora</th>
                                <th>Exceso</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentConfiguraciones.map((configuracion) => {
                                const porcentajeMora = `${(configuracion.porcentaje_mora * 100).toFixed(0)}%`;
                                const porcentajeExceso = `${(configuracion.porcentaje_exceso * 100).toFixed(0)}%`;
                                return (
                                    <tr key={configuracion.idconfiguracion} onClick={() => handleSelectConfiguracion(configuracion)}>
                                        <td>{configuracion.servicio}</td>
                                        <td>{configuracion.empresa}</td>
                                        <td>{configuracion.direccion}</td>
                                        <td>{configuracion.cuota}</td>
                                        <td>{porcentajeMora}</td>
                                        <td>{porcentajeExceso}</td>
                                        <td>
                                            <span className={`status ${configuracion.activo ? 'active' : 'inactive'}`}>
                                                {configuracion.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="configuracion-actions">
                                            <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(configuracion.idconfiguracion); }} disabled={loadingSave || loadingToggle}>
                                                <span className="material-icons eliminar-icon">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button onClick={() => paginate(1)} disabled={currentPage === 1}>Inicio</button>
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                        {Array.from({ length: Math.ceil(filteredConfiguraciones.length / rowsPerPage) }, (_, index) => (
                            <button key={index + 1} onClick={() => paginate(index + 1)}>
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredConfiguraciones.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredConfiguraciones.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredConfiguraciones.length / rowsPerPage)}>Último</button>
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
                        <h3>¿Estás seguro que deseas eliminar esta configuración?</h3>
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

export default Configuracion;
