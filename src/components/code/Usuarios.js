import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Usuarios.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);  // No hay usuario seleccionado al inicio
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('usuario');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [resetingToggle, setResetingToggle] = useState(false);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchUsuarios();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${API_URL}/rol`);
            setRoles(response.data.roles || []);
        } catch (error) {
            handleError(error, 'Error al cargar roles');
            setRoles([]);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get(`${API_URL}/usuario`);
            setUsuarios(response.data.Usuarios); 
        } catch (error) {
            handleError(error, 'Error al cargar usuarios');
        }
    };

    const handleSelectUsuario = (usuario) => {
        setSelectedUsuario(usuario);  // Selecciona un usuario y habilita el botón Actualizar
        setLoadingToggle(false);
    };

    const handleInputChange = (e) => {
        setSelectedUsuario({
            ...selectedUsuario,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!selectedUsuario || !selectedUsuario.usuario || !selectedUsuario.idrol || !selectedUsuario.idempleado) {
            toast.error('Todos los campos son obligatorios.');
            return false;
        }
        return true;
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;
        setLoadingSave(true);
        try {
            await axios.put(`${API_URL}/usuarios-sin-pass/${selectedUsuario.idusuario}`, selectedUsuario);
            toast.success('Usuario actualizado');
            fetchUsuarios();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al actualizar el usuario.');
        } finally {
            setLoadingSave(false);
        }
    };

    const handleDeleteClick = (idusuario) => {
        setUsuarioToDelete(idusuario);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setLoadingSave(true);
        try {
            await axios.delete(`${API_URL}/usuarios/${usuarioToDelete}`);
            toast.success('Usuario eliminado');
            fetchUsuarios();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al eliminar el usuario.');
        } finally {
            setShowModal(false);
            setLoadingSave(false);
        }
    };

    const cancelDelete = () => {
        setUsuarioToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idusuario) => {
        setLoadingToggle(true);
        try {
            await axios.patch(`${API_URL}/usuarios/${idusuario}/toggle`);
            toast.success('Estado cambiado');
            fetchUsuarios();
        } catch (error) {
            handleError(error, 'Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false);
        }
    };

    const clearForm = () => {
        setSelectedUsuario(null);  // Limpia el usuario seleccionado y oculta el botón Actualizar
        setLoadingToggle(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredUsuarios = usuarios && usuarios.length > 0 
    ? usuarios.filter((usuario) => {
        let valueToFilter;

        if (filterColumn === 'nombrerol') {
            valueToFilter = usuario.roles.rol;
        } else if (filterColumn === 'nombre') {
            valueToFilter = usuario.empleados.nombre;
        } else if (filterColumn === 'apellidos') {
            valueToFilter = usuario.empleados.apellidos;
        } else {
            valueToFilter = usuario[filterColumn];
        }

        return valueToFilter.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
    : [];

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentUsuarios = filteredUsuarios.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const resetPassword = async (idusuario) => {
        setResetingToggle(true); // Muestra el estado de carga en el botón
        try {
            const response = await axios.put(`${API_URL}/reset-password-idusuario`, { idusuario });
            toast.success(response.data.message); // Muestra el mensaje de éxito
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña';
            toast.error(errorMessage); // Muestra el mensaje de error
        } finally {
            setResetingToggle(false); // Oculta el estado de carga
        }
    };
    

    return (
        <main className="usuarios-container">
            <ToastContainer />
            <section className="usuarios-section">
                <h1 className="usuarios-title">Gestión de Usuarios</h1>
                <div className="usuarios-data">
                    {/* Inputs para editar datos del usuario */}
                    <div className="row">
                        <label className="usuarios-label">Usuario:</label>
                        <input
                            className="usuarios-input"
                            type="text"
                            placeholder="Nombre del Usuario"
                            name="usuario"
                            value={selectedUsuario ? selectedUsuario.usuario : ''}
                            onChange={handleInputChange}
                            disabled={!selectedUsuario}  // Deshabilitado si no hay usuario seleccionado
                        />
                    </div>
                    <div className="row">
                        <label className="usuarios-label">Rol:</label>
                        <select
                            className="usuarios-select"
                            name="idrol"
                            value={selectedUsuario ? selectedUsuario.idrol || '' : ''}
                            onChange={handleInputChange}
                            disabled={!selectedUsuario}  // Deshabilitado si no hay usuario seleccionado
                        >
                            <option value="">Selecciona un rol</option>
                            {roles.map((rol) => (
                                <option key={rol.idrol} value={rol.idrol}>
                                    {rol.rol}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                        <label className="usuarios-label">Nombre:</label>
                        <input
                            className="usuarios-input lock"
                            type="text"
                            placeholder="Nombre del empleado"
                            name="nombre"
                            value={selectedUsuario ? selectedUsuario.empleados?.nombre || '' : ''}
                            onChange={handleInputChange}
                            disabled={!selectedUsuario}  // Deshabilitado si no hay usuario seleccionado
                        />
                    </div>
                    <div className="row">
                        <label className="usuarios-label">Apellidos:</label>
                        <input
                            className="usuarios-input lock"
                            type="text"
                            placeholder="Apellidos del empleado"
                            name="apellidos"
                            value={selectedUsuario ? selectedUsuario.empleados?.apellidos || '' : ''}
                            onChange={handleInputChange}
                            disabled={!selectedUsuario}  // Deshabilitado si no hay usuario seleccionado
                        />
                    </div>             
                </div>
                <div className="usuarios-data-buttons">
                    {/* Mostrar el botón "Actualizar" solo cuando hay un usuario seleccionado */}
                    {selectedUsuario && (
                        <button className="usuarios-button" onClick={handleUpdate} disabled={loadingSave}>
                            {loadingSave ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    )}
                    <button className="usuarios-button" onClick={clearForm} disabled={loadingSave}>
                        Nuevo
                    </button>
                    {selectedUsuario && (
                        <button
                            className="usuarios-button"
                            onClick={() => {
                                toggleActive(selectedUsuario.idusuario);
                                clearForm();
                            }}
                            disabled={loadingToggle}
                        >
                            {loadingToggle
                                ? (selectedUsuario.activo ? 'Desactivando...' : 'Activando...')
                                : (selectedUsuario.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                    {selectedUsuario && (
                        <button
                            className="usuarios-button-reset"
                            onClick={() => resetPassword(selectedUsuario.idusuario)}
                            disabled={resetingToggle}
                        >
                            {resetingToggle ? 'Reseteando...' : 'Resetear Contraseña'}
                        </button>
                    )}
                </div>
            </section>

            <section className="usuarios-section">
                <h1 className="usuarios-title">Datos Existentes</h1>
                <div className="usuarios-buscar">
                    <label className="usuarios-label">Buscar:</label>
                    <select
                        className="usuarios-select"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        <option value="usuario">Usuario</option>
                        <option value="nombrerol">Rol</option>
                        <option value="nombre">Nombre</option>
                        <option value="apellidos">Apellidos</option>
                    </select>
                    <input
                        type="text"
                        className="usuarios-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="usuarios-table">
                    <table className="usuarios-data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Rol</th>
                                <th>Empleado</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsuarios.map((usuario) => (
                                <tr key={usuario.idusuario} onClick={() => handleSelectUsuario(usuario)}>
                                    <td>{usuario.usuario}</td>
                                    <td>{usuario.roles.rol}</td>
                                    <td>{usuario.empleados.nombre} {usuario.empleados.apellidos}</td>
                                    <td>
                                        <span className={`status ${usuario.activo ? 'active' : 'inactive'}`}>
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="usuarios-actions">
                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(usuario.idusuario); }} disabled={loadingSave || loadingToggle}>
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
                        {Array.from({ length: Math.ceil(filteredUsuarios.length / rowsPerPage) }, (_, index) => (
                            <button key={index + 1} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredUsuarios.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredUsuarios.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredUsuarios.length / rowsPerPage)}>Último</button>
                        <select className="rows-per-page" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} disabled={loadingSave || loadingToggle}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>                                   
                    </div>
                </div>
            </section>

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

export default Usuarios;
