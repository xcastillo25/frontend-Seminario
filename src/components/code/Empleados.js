import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../design/Empleados.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';
import MotorValidaciones from './MotorValidaciones';
import { validaDPI, ValidaTelefono } from './ValidacionesAlmacenar';


const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('nombre');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [empleadoToDelete, setEmpleadoToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [usuario, setUsuario] = useState({ username: '', password: '', confirmPassword: '', idrol: '', activo: true });
    const [usuarios, setUsuarios] = useState([]);
    const [showUsuarioModal, setShowUsuarioModal] = useState(false);
    const [roles, setRoles] = useState([]);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    const [showUsuarioDeleteModal, setShowUsuarioDeleteModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [deleting, setDeleting] = useState(false);

    //ReferenciasValidaciones
    const telefonoRef = useRef(null);
    const nombreRef = useRef(null);
    const apellidosRef = useRef(null);
    const correoRef = useRef(null);
    const cuiRef = useRef(null);

    useEffect(() => {
        fetchEmpleados();
        fetchRoles();

        //Validaciones
        MotorValidaciones.agregarEvento(telefonoRef.current, 'keypress', MotorValidaciones.validaSoloNumeros, 0);
        MotorValidaciones.agregarEvento(nombreRef.current, 'keypress', MotorValidaciones.validaSoloLetras);
        MotorValidaciones.agregarEvento(apellidosRef.current, 'keypress', MotorValidaciones.validaSoloLetras);
        MotorValidaciones.agregarEvento(correoRef.current, 'keypress', MotorValidaciones.validaCaracteresEmail);
        MotorValidaciones.agregarEvento(cuiRef.current, 'keypress', MotorValidaciones.validaSoloNumeros, 0);
        if (correoRef.current) {
            MotorValidaciones.agregarEvento(correoRef.current, 'blur', MotorValidaciones.validarEmailCompleto);
        }
        if (cuiRef.current) {
            MotorValidaciones.agregarEvento(cuiRef.current, 'blur', MotorValidaciones.validarDPI);
        }
        if (cuiRef.current) {
            MotorValidaciones.agregarEvento(cuiRef.current, 'blur', MotorValidaciones.validarDPI);
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

    const fetchEmpleados = async () => {
        try {
            const response = await axios.get(`${API_URL}/empleados`);
            setEmpleados(response.data.empleados);
        } catch (error) {
            handleError(error, 'Error al cargar empleados');
        }
    };

    const handleSelectEmpleado = (empleado) => {
        setSelectedEmpleado(empleado);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        setSelectedEmpleado({
            ...selectedEmpleado,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

        if (!selectedEmpleado || !selectedEmpleado.nombre || !selectedEmpleado.apellidos || !selectedEmpleado.cui || !selectedEmpleado.telefono || !selectedEmpleado.email) {
            toast.error('Todos los campos son obligatorios.');
            return false;
        }

        const resValidaTelefono = ValidaTelefono(selectedEmpleado.telefono)
        if (!resValidaTelefono.valido) {
            toast.error(resValidaTelefono.mensaje);
            return false;
        }


        const resValidaDPI = validaDPI(selectedEmpleado.cui);
        if (!resValidaDPI.valido) {
            toast.error(resValidaDPI.mensaje);
            return false;
        }

        if (!emailRegex.test(selectedEmpleado.email)) {
            toast.error('Debe ingresar un correo electrónico válido.');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true);
        try {
            if (selectedEmpleado && selectedEmpleado.idempleado) {
                await axios.put(`${API_URL}/empleados/${selectedEmpleado.idempleado}`, selectedEmpleado);
                toast.success('Empleado actualizado');
            } else {
                await axios.post(`${API_URL}/empleados`, selectedEmpleado);
                toast.success('Empleado creado');
            }
            fetchEmpleados();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar el empleado.');
        } finally {
            setLoadingSave(false);
        }
    };

    const handleDeleteClick = (idempleado) => {
        setEmpleadoToDelete(idempleado);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${API_URL}/empleados/${empleadoToDelete}`);
            toast.success('Empleado eliminado');
            fetchEmpleados();
            clearForm();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                // Si el servidor responde con un conflicto (status 409), significa que hay relaciones de claves foráneas
                toast.error('No se puede eliminar el empleado porque tiene registros relacionados.');
            } else {
                handleError(error, 'No se puede eliminar este Empleado.');
            }
        } finally {
            setShowModal(false);
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        setEmpleadoToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idempleado) => {
        setLoadingToggle(true);
        try {
            await axios.patch(`${API_URL}/empleados/${idempleado}/toggle`);
            toast.success('Estado cambiado');
            fetchEmpleados();
        } catch (error) {
            handleError(error, 'Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false);
        }
    };

    const clearForm = () => {
        setSelectedEmpleado(null);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredEmpleados = empleados.filter((empleado) =>
        empleado[filterColumn].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentEmpleados = filteredEmpleados.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${API_URL}/rol`);
            setRoles(response.data.roles || []);
        } catch (error) {
            handleError(error, 'Error al cargar roles');
            setRoles([]);
        }
    };

    const handleUsuarioClick = (empleado) => {
        setSelectedEmpleado(empleado);
        fetchUsuario(empleado.idempleado);
        setShowUsuarioModal(true);
    };

    const handleUsuarioInputChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value,
        });
    };

    const handleUsuarioSave = async () => {
        if (!usuario.usuario || !usuario.password || !usuario.confirmPassword || !usuario.idrol || !selectedEmpleado.email) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        if (usuario.password !== usuario.confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }

        setLoadingSave(true);
        try {
            const usuarioData = {
                idempleado: selectedEmpleado.idempleado,
                usuario: usuario.usuario,
                password: usuario.password,
                idrol: usuario.idrol,
                email: selectedEmpleado.email,  // Asegúrate de incluir el email aquí.
                activo: usuario.activo
            };

            await axios.post(`${API_URL}/usuarios`, usuarioData);
            toast.success('Usuario asignado exitosamente');
            fetchEmpleados();
        } catch (error) {
            const errorMessage = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Error al guardar el usuario.';

            toast.error(errorMessage);
            console.error('Error al guardar el usuario:', errorMessage, error);
        } finally {
            setLoadingSave(false);
        }
    };


    const handleUsuarioUpdate = async () => {
        // Validación de campos obligatorios
        if (!usuario.usuario || !usuario.password || !usuario.confirmPassword || !usuario.idrol || !selectedEmpleado.email) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        // Verificación de que las contraseñas coincidan
        if (usuario.password !== usuario.confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }

        setLoadingSave(true);
        try {
            // Preparar los datos a enviar al backend
            const usuarioData = {
                usuario: usuario.usuario,
                password: usuario.password,
                idrol: usuario.idrol,
                email: selectedEmpleado.email,  // Incluye el campo email aquí
                activo: usuario.activo
            };

            // Realiza la solicitud PUT para actualizar
            await axios.put(`${API_URL}/usuarios/${usuario.idusuario}`, usuarioData);
            toast.success('Usuario actualizado exitosamente');
            fetchEmpleados();
        } catch (error) {
            // Manejo de errores
            const errorMessage = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Error al actualizar el usuario.';

            toast.error(errorMessage);
            console.error('Error al actualizar el usuario:', errorMessage, error);
        } finally {
            // Restablecer el estado de carga
            setLoadingSave(false);
        }
    };


    const toggleUsuarioActive = async (idusuario) => {
        setLoadingToggle(true);
        try {
            await axios.patch(`${API_URL}/usuarios/${idusuario}/toggle`);
            toast.success('Estado de usuario cambiado');
            fetchUsuario(selectedEmpleado.idempleado);
        } catch (error) {
            handleError(error, 'Error al cambiar el estado del usuario.');
        } finally {
            setLoadingToggle(false);
        }
    };

    const handleUsuarioDeleteClick = (idusuario) => {
        setUsuarioToDelete(idusuario);
        setShowUsuarioDeleteModal(true);
    };

    const confirmUsuarioDelete = async () => {
        setLoadingSave(true);
        try {
            await axios.delete(`${API_URL}/usuarios/${usuarioToDelete}`);
            toast.success('Usuario eliminado');
            fetchUsuario(selectedEmpleado.idempleado);
            clearUsuarioForm();
        } catch (error) {
            handleError(error, 'Error al eliminar el usuario.');
        } finally {
            setShowUsuarioDeleteModal(false);
            setLoadingSave(false);
        }
    };

    const cancelUsuarioDelete = () => {
        setUsuarioToDelete(null);
        setShowUsuarioDeleteModal(false);
    };

    const clearUsuarioForm = () => {
        setUsuario({ usuario: '', password: '', confirmPassword: '', idrol: '', activo: true });
        setIsUpdating(false);
    };

    const handleResetPassword = async (idusuario) => {
        try {
            await axios.patch(`${API_URL}/usuarios/${idusuario}/reset`);
            toast.success('Contraseña reseteada exitosamente');
        } catch (error) {
            handleError(error, 'Error al resetear la contraseña.');
        }
    };

    const fetchUsuario = async (idEmpleado) => {
        try {
            const response = await axios.get(`${API_URL}/usuario-empleado/${idEmpleado}`);
            setUsuarios(response.data.usuarios || []);
            clearUsuarioForm();
        } catch (error) {
            handleError(error, 'Error al cargar los datos del usuario.');
        }
    };

    const handleSelectedUsuario = (usuario) => {
        setUsuario({
            idusuario: usuario.idusuario,
            usuario: usuario.usuario,
            password: '',
            confirmPassword: '',
            idrol: usuario.idrol,
            activo: usuario.activo
        });
        setIsUpdating(true);
    };

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

    const paginationRange = getPaginationRange(currentPage, Math.ceil(filteredEmpleados.length / rowsPerPage));

    return (
        <main className="empleados-container">
            <ToastContainer />
            <section className="empleados-section">
                <h1 className="empleados-title">Gestión de Empleados</h1>
                <div className="empleados-data">
                    <div className="row">
                        <label className="empleados-label">Nombre:</label>
                        <input
                            className="empleados-input"
                            type="text"
                            placeholder="Nombre del Empleado"
                            name="nombre"
                            value={selectedEmpleado ? selectedEmpleado.nombre : ''}
                            onChange={handleInputChange}
                            ref={nombreRef}
                        />
                    </div>
                    <div className="row">
                        <label className="empleados-label">Apellidos:</label>
                        <input
                            className="empleados-input"
                            type="text"
                            placeholder="Apellidos del Empleado"
                            name="apellidos"
                            value={selectedEmpleado ? selectedEmpleado.apellidos : ''}
                            onChange={handleInputChange}
                            ref={apellidosRef}
                        />
                    </div>
                    <div className="row">
                        <label className="empleados-label">CUI:</label>
                        <input
                            className="empleados-input"
                            type="text"
                            placeholder="CUI del Empleado"
                            name="cui"
                            value={selectedEmpleado ? selectedEmpleado.cui : ''}
                            onChange={handleInputChange}
                            ref={cuiRef}
                        />
                    </div>
                    <div className="row">
                        <label className="empleados-label">Teléfono:</label>
                        <input
                            className="empleados-input"
                            type="text"
                            placeholder="Teléfono del Empleado"
                            name="telefono"
                            value={selectedEmpleado ? selectedEmpleado.telefono : ''}
                            onChange={handleInputChange}
                            ref={telefonoRef}
                        />
                    </div>
                    <div className="row">
                        <label className="empleados-label">Correo:</label>
                        <input
                            className="empleados-input"
                            type="email"
                            placeholder="Correo del Empleado"
                            name="email"
                            value={selectedEmpleado ? selectedEmpleado.email : ''}
                            onChange={handleInputChange}
                            ref={correoRef}
                        />
                    </div>
                </div>
                <div className="empleados-data-buttons">
                    <button className="empleados-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedEmpleado && selectedEmpleado.idempleado ? 'Actualizando...' : 'Agregando...') : (selectedEmpleado && selectedEmpleado.idempleado ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="empleados-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedEmpleado && !editing && (
                        <button className="empleados-button" onClick={() => { toggleActive(selectedEmpleado.idempleado); clearForm(); }} disabled={loadingToggle}>
                            {loadingToggle ? (selectedEmpleado.activo ? 'Desactivando...' : 'Activando...') : (selectedEmpleado.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                </div>
            </section>
            <section className="empleados-section">
                <h1 className="empleados-title">Datos Existentes</h1>
                <div className="empleados-buscar">
                    <label className="empleados-label">Buscar:</label>
                    <select
                        className="empleados-select"
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
                        className="empleados-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="empleados-table">
                    <table className="empleados-data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>CUI</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Estado</th>
                                <th>Usuario</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmpleados.map((empleado) => (
                                <tr key={empleado.idempleado} onClick={() => handleSelectEmpleado(empleado)}>
                                    <td>{empleado.nombre}</td>
                                    <td>{empleado.apellidos}</td>
                                    <td>{empleado.cui}</td>
                                    <td>{empleado.telefono}</td>
                                    <td>{empleado.email}</td>
                                    <td>
                                        <span className={`status ${empleado.activo ? 'active' : 'inactive'}`}>
                                            {empleado.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="empleados-actions">
                                        <button className="usuario-icon-button" onClick={(e) => { e.stopPropagation(); handleUsuarioClick(empleado); }}>
                                            <span className="material-icons usuario-icon">person</span>
                                        </button>
                                    </td>
                                    <td>
                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(empleado.idempleado); }} disabled={loadingSave || loadingToggle}>
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

                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredEmpleados.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredEmpleados.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredEmpleados.length / rowsPerPage)}>Último</button>

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
                            <button onClick={cancelDelete} className="cancel-button" disabled={loadingSave}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            {showUsuarioDeleteModal && (
                <div className="modal" style={{ zIndex: 1100 }}>
                    <div className="modal-content">
                        <span className="material-icons modal-icon">warning</span>
                        <h3>¿Estás seguro que deseas eliminar este usuario?</h3>
                        <div className="modal-buttons">
                            <button onClick={confirmUsuarioDelete} className="confirm-button" disabled={loadingSave}>Eliminar</button>
                            <button onClick={cancelUsuarioDelete} className="cancel-button" disabled={loadingSave}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {showUsuarioModal && (
                <div className="usuario-modal">
                    <div className="modal-content">
                        <h3>Asignar Usuario para {selectedEmpleado.nombre} {selectedEmpleado.apellidos}</h3>
                        <div className="modal-body">
                            <div className="modal-section">
                                <div className="usuario-modal-data">
                                    <div className="row">
                                        <label className="modal-label">Usuario:</label>
                                        <input
                                            className="modal-input"
                                            type="text"
                                            placeholder="Nombre de usuario"
                                            name="usuario"
                                            value={usuario.usuario}
                                            onChange={handleUsuarioInputChange}
                                        />
                                    </div>
                                    <div className="row">
                                        <label className="modal-label">Rol:</label>
                                        <select
                                            className="modal-input"
                                            name="idrol"
                                            value={usuario.idrol}
                                            onChange={handleUsuarioInputChange}
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
                                        <label className="modal-label">Contraseña:</label>
                                        <div className="password-container">
                                            <input
                                                className="modal-input"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Contraseña"
                                                name="password"
                                                value={usuario.password}
                                                onChange={handleUsuarioInputChange}
                                            />
                                            <span
                                                className="password-toggle-icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <label className="modal-label">Confirmar Contraseña:</label>
                                        <div className="password-container">
                                            <input
                                                className="modal-input"
                                                type={showConfirmPassword ? "text" : "password"} // Cambia el tipo de input según el estado
                                                placeholder="Confirmar Contraseña"
                                                name="confirmPassword"
                                                value={usuario.confirmPassword}
                                                onChange={handleUsuarioInputChange}
                                            />
                                            <span
                                                className="password-toggle-icon"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </span>
                                        </div>
                                    </div>

                                </div>
                                <div className="modal-buttons">
                                    {!isUpdating && (
                                        <button onClick={handleUsuarioSave} className="usuario-confirm-button" disabled={loadingSave}>
                                            {loadingSave ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    )}
                                    {isUpdating && (
                                        <>
                                            <button onClick={handleUsuarioUpdate} className="usuario-confirm-button" disabled={loadingSave}>
                                                {loadingSave ? 'Actualizando...' : 'Actualizar'}
                                            </button>
                                            <button
                                                className="usuario-confirm-button"
                                                onClick={() => toggleUsuarioActive(usuario.idusuario)}
                                                disabled={loadingToggle} // Activar siempre que se esté actualizando
                                            >
                                                {loadingToggle ? (usuario.activo ? 'Desactivando...' : 'Activando...') : (usuario.activo ? 'Desactivar' : 'Activar')}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="usuario-confirm-button"
                                        onClick={() => {
                                            clearUsuarioForm();
                                            setIsUpdating(false);
                                        }}
                                    >
                                        Nuevo
                                    </button>
                                    <button onClick={() => setShowUsuarioModal(false)} className="cancel-button">Cancelar</button>
                                </div>
                            </div>
                            <div className="modal-section">
                                <h4>Usuarios Asignados</h4>
                                <table className="modal-data-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Reset Contraseña</th>
                                            <th>Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.length > 0 ? (
                                            usuarios.map((user) => (
                                                <tr key={user.idusuario} onClick={() => handleSelectedUsuario(user)}>
                                                    <td>{user.usuario}</td>
                                                    <td>{user.roles?.rol || 'Sin rol'}</td>
                                                    <td>
                                                        <span className={`status ${user.activo ? 'active' : 'inactive'}`}>
                                                            {user.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="reset-password-button" onClick={(e) => { e.stopPropagation(); handleResetPassword(user.idusuario); }}>
                                                            Resetear
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleUsuarioDeleteClick(user.idusuario); }} disabled={loadingSave || loadingToggle}>
                                                            <span className="material-icons eliminar-icon">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5">No se encontraron usuarios asignados.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
};

export default Empleados;
