import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Usuarios.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('usuario');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get(`${API_URL}/usuarios/`);
            setUsuarios(response.data.usuarios || []); // Asegurarse de que siempre sea un array
        } catch (error) {
            handleError(error, 'Error al cargar usuarios');
        }
    };

    const handleSelectUsuario = (usuario) => {
        setSelectedUsuario(usuario);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        setSelectedUsuario({
            ...selectedUsuario,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        if (!selectedUsuario || !selectedUsuario.usuario || !selectedUsuario.password || !selectedUsuario.idrol || !selectedUsuario.idpersona) {
            toast.error('Todos los campos son obligatorios.');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true);
        try {
            if (selectedUsuario && selectedUsuario.idusuario) {
                await axios.put(`${API_URL}/usuarios/${selectedUsuario.idusuario}`, selectedUsuario);
                toast.success('Usuario actualizado');
            } else {
                await axios.post(`${API_URL}/usuarios`, selectedUsuario);
                toast.success('Usuario creado');
            }
            fetchUsuarios();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar el usuario.');
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
        setSelectedUsuario(null);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredUsuarios = (usuarios || []).filter((usuario) =>
        usuario[filterColumn]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentUsuarios = filteredUsuarios.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="usuarios-container">
            <ToastContainer />
            <section className="usuarios-section">
                <h1 className="usuarios-title">Gestión de Usuarios</h1>
                <div className="usuarios-data">
                    <div className="row">
                        <label className="usuarios-label">Usuario:</label>
                        <input
                            className="usuarios-input"
                            type="text"
                            placeholder="Nombre del Usuario"
                            name="usuario"
                            value={selectedUsuario ? selectedUsuario.usuario : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="usuarios-label">Password:</label>
                        <input
                            className="usuarios-input"
                            type="text"
                            placeholder="Password"
                            name="password"
                            value={selectedUsuario ? selectedUsuario.password : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="usuarios-label">Idrol:</label>
                        <input
                            className="usuarios-input"
                            type="text"
                            placeholder="Idrol del usuario"
                            name="idrol"
                            value={selectedUsuario ? selectedUsuario.idrol : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="usuarios-label">IdPersona:</label>
                        <input
                            className="usuarios-input"
                            type="text"
                            placeholder="Id Persona"
                            name="idpersona"
                            value={selectedUsuario ? selectedUsuario.idpersona : ''}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="usuarios-data-buttons">
                    <button className="usuarios-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedUsuario && selectedUsuario.idusuario ? 'Actualizando...' : 'Agregando...') : (selectedUsuario && selectedUsuario.idusuario ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="usuarios-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedUsuario && !editing && (
                        <button className="usuarios-button" onClick={() => { toggleActive(selectedUsuario.idusuario); clearForm(); }} disabled={loadingToggle}>
                            {loadingToggle ? (selectedUsuario.activo ? 'Desactivando...' : 'Activando...') : (selectedUsuario.activo ? 'Desactivar' : 'Activar')}
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
                        <option value="password">Password</option>
                        <option value="idrol">Idrol</option>
                        <option value="idpersona">IdPersona</option>
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
                                <th>Password</th>
                                <th>Idrol</th>
                                <th>IdPersona</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsuarios.map((usuario) => (
                                <tr key={usuario.idusuario} onClick={() => handleSelectUsuario(usuario)}>
                                    <td>{usuario.usuario}</td>
                                    <td>{usuario.password}</td>
                                    <td>{usuario.idrol}</td>
                                    <td>{usuario.idpersona}</td>
                                    <td className="usuario-actions">
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
                        <button onClick={() => paginate(Math.ceil(filteredUsuarios.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredUsuarios.length / rowsPerPage)}>Final</button>
                    </div>
                </div>
            </section>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
                        <div className="modal-buttons">
                            <button className="modal-button" onClick={confirmDelete} disabled={loadingSave}>Eliminar</button>
                            <button className="modal-button" onClick={cancelDelete}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Usuarios;