import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Roles.css'; // Asegúrate de crear este archivo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [selectedRol, setSelectedRol] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('rol');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [rolToDelete, setRolToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${API_URL}/rol`);
            setRoles(response.data.roles);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Error al cargar roles');
        }
    };

    const handleSelectRol = (rol) => {
        setSelectedRol(rol);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        setSelectedRol({
            ...selectedRol,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        if (!selectedRol || !selectedRol.rol) {
            toast.error('El campo "Rol" es obligatorio.');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true); 
        try {
            if (selectedRol && selectedRol.idrol) {
                await axios.put(`${API_URL}/rol/${selectedRol.idrol}`, selectedRol);
                toast.success('Rol actualizado');
            } else {
                await axios.post(`${API_URL}/rol`, selectedRol);
                toast.success('Rol creado');
            }
            fetchRoles();
            clearForm();
        } catch (error) {
            console.error('Error saving rol:', error);
            toast.error('Error al guardar el rol.');
        } finally {
            setLoadingSave(false); 
        }
    };

    const handleDeleteClick = (idrol) => {
        setRolToDelete(idrol);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setLoadingSave(true); 
        try {
            await axios.delete(`${API_URL}/rol/${rolToDelete}`);
            toast.success('Rol eliminado');
            fetchRoles();
            clearForm();
        } catch (error) {
            console.error('Error deleting rol:', error);
            toast.error('Error al eliminar el rol.');
        } finally {
            setShowModal(false);
            setLoadingSave(false); 
        }
    };

    const cancelDelete = () => {
        setRolToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idrol) => {
        setLoadingToggle(true); 
        try {
            await axios.patch(`${API_URL}/rol/${idrol}/toggle`);
            toast.success('Estado cambiado');
            fetchRoles();
        } catch (error) {
            console.error('Error toggling estado:', error);
            toast.error('Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false); 
        }
    };

    const clearForm = () => {
        setSelectedRol(null);
        setLoadingToggle(false); 
        setEditing(false);
    };

    const filteredRoles = roles.filter((rol) =>
        rol[filterColumn].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentRoles = filteredRoles.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="roles-container">
            <ToastContainer />
            <section className="roles-section">
                <h1 className="roles-title">Gestión de Roles</h1>
                <div className="roles-data">
                    <div className="row">
                        <label className="roles-label">Rol:</label>
                        <input
                            className="roles-input"
                            type="text"
                            placeholder="Nombre del Rol"
                            name="rol"
                            value={selectedRol ? selectedRol.rol : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="roles-data-buttons">
                    <button className="roles-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedRol && selectedRol.idrol ? 'Actualizando...' : 'Agregando...') : (selectedRol && selectedRol.idrol ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="roles-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedRol && !editing && (
                        <button className="roles-button" onClick={() => {toggleActive(selectedRol.idrol); clearForm();}} disabled={loadingToggle}>
                            {loadingToggle ? (selectedRol.activo ? 'Desactivando...' : 'Activando...') : (selectedRol.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                </div>
            </section>
            <section className="roles-section">
                <h1 className="roles-title">Datos Existentes</h1>
                <div className="roles-buscar">
                    <label className="roles-label">Buscar:</label>
                    <select
                        className="roles-select"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        <option value="rol">Rol</option>
                    </select>
                    <input
                        type="text"
                        className="roles-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="roles-table">
                    <table className="roles-data-table">
                        <thead>
                            <tr>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRoles.map((rol) => (
                                <tr key={rol.idrol} onClick={() => handleSelectRol(rol)}>
                                    <td>{rol.rol}</td>
                                    <td>
                                        <span className={`status ${rol.activo ? 'active' : 'inactive'}`}>
                                            {rol.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="roles-actions">
                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(rol.idrol); }} disabled={loadingSave || loadingToggle}>
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
                        {Array.from({ length: Math.ceil(filteredRoles.length / rowsPerPage) }, (_, index) => (
                            <button key={index + 1} onClick={() => paginate(index + 1)}>
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredRoles.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredRoles.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredRoles.length / rowsPerPage)}>Último</button>
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

export default Roles;
