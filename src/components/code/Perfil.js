import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Perfil.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ValidaTelefono } from './ValidacionesAlmacenar';
import { API_URL } from '../../config/config';

const Perfil = ({ idempleado, setPlataformaVisible }) => {
    const [selectedEmpleado, setSelectedEmpleado] = useState(null); // Estado para almacenar los datos del empleado
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingTel, setLoadingTel] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Cargar perfil del empleado cuando se recibe idempleado
    const fetchEmpleadoPerfil = async (idempleado) => {
        try {
            const response = await axios.get(`${API_URL}/empleado/${idempleado}`);
            console.log('Datos del empleado:', response.data.empleados);
            setSelectedEmpleado(response.data.empleados); // Guardar los datos del empleado en el estado
        } catch (error) {
            toast.error('Error al cargar el perfil del empleado');
        }
    };

    // useEffect para llamar a la función cuando cambie idempleado
    useEffect(() => {
        console.log('Idempleado recibido:', idempleado);
        if (idempleado) {
            fetchEmpleadoPerfil(idempleado); // Llamar a la función para obtener los datos
        }
    }, [idempleado]);

    // Manejar el cambio en los inputs
    const handleInputChange = (e) => {
        setSelectedEmpleado({
            ...selectedEmpleado,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

        if (!selectedEmpleado.telefono) {
            toast.error('El teléfono es obligatorios.');
            return false;
        }

        const resValidaTelefono = ValidaTelefono(selectedEmpleado.telefono)
        if (!resValidaTelefono.valido) {
            toast.error(resValidaTelefono.mensaje);
            return false;
        }

        if (!emailRegex.test(selectedEmpleado.email)) {
            toast.error('Debe ingresar un correo electrónico válido.');
            return false;
        }

        return true;
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const handleEditarTelefono = async () => {
        if (!validateForm()) return;
        setLoadingTel(true);
        try {
            if (selectedEmpleado && selectedEmpleado.idempleado) {
                await axios.put(`${API_URL}/telefono-empleados/${selectedEmpleado.idempleado}`, selectedEmpleado);
                toast.success('Empleado actualizado');
            } 
            fetchEmpleadoPerfil(idempleado);
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar el empleado.');
        } finally {
            setLoadingTel(false);
        }
    };

    const clearForm = () => {
        setSelectedEmpleado(null);
        setEditing(false);
    };

    const handleCambiarPassword = async () => {
        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }
    
        setLoadingSave(true);
        try {
            // Hacer la solicitud al backend con el idempleado
            const response = await axios.post(`${API_URL}/cambiarPassword`, {
                idempleado: selectedEmpleado.idempleado, // Enviar idempleado
                passwordActual: currentPassword,
                nuevaPassword: newPassword,
            });
            
            // Mostrar mensaje de éxito
            toast.success(response.data.message);
            
            // Limpiar campos de contraseña
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            // Manejar el error y mostrar el mensaje correspondiente
            const errorMessage = error.response?.data?.error || 'Error al cambiar la contraseña.';
            toast.error(errorMessage);
        } finally {
            setLoadingSave(false);
        }
    };
    
    

    return (
        <main className="perfil-container">
            <ToastContainer />
            <section className="perfil-section">
                <h1 className="perfil-title">Gestión de Empleados</h1>
                {/* Formulario de empleado */}
                <div className="perfil-data">
                    <div className="row">
                        <label className="perfil-label">Nombre:</label>
                        <input
                            className="perfil-input lock"
                            readOnly
                            type="text"
                            placeholder="Nombre del Empleado"
                            name="nombre"
                            value={selectedEmpleado ? selectedEmpleado.nombre : ''} // Mostrar el nombre si existe
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="perfil-label">Apellidos:</label>
                        <input
                            className="perfil-input lock"
                            readOnly
                            type="text"
                            placeholder="Apellidos del Empleado"
                            name="apellidos"
                            value={selectedEmpleado ? selectedEmpleado.apellidos : ''} // Mostrar los apellidos si existen
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="perfil-label">CUI:</label>
                        <input
                            className="perfil-input lock"
                            readOnly
                            type="text"
                            placeholder="CUI del Empleado"
                            name="cui"
                            value={selectedEmpleado ? selectedEmpleado.cui : ''} // Mostrar el CUI si existe
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="perfil-label">Correo:</label>
                        <input
                            className="perfil-input lock"
                            readOnly
                            type="email"
                            placeholder="Correo del Empleado"
                            name="email"
                            value={selectedEmpleado ? selectedEmpleado.email : ''} // Mostrar el email si existe
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row">
                        <label className="perfil-label">Teléfono:</label>
                        <input
                            className="perfil-input"
                            type="text"
                            placeholder="Teléfono del Empleado"
                            name="telefono"
                            value={selectedEmpleado ? selectedEmpleado.telefono : ''} // Mostrar el teléfono si existe
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="row-button">
                    <button onClick={handleEditarTelefono} disabled={loadingSave}>
                            {loadingTel ? 'Guardando...' : 'Cambiar teléfono'}
                        </button>
                    </div>
                </div>
            </section>
            <section className="perfil-section">
                <h1 className="perfil-title">Gestión de Contraseñas</h1>
                <div className="perfil-data-password">
                    <div className="row">
                        <label className="perfil-label-password">Contraseña actual:</label>
                        <div className="password-container">
                            <input
                                className="modal-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                name="password"
                                value={currentPassword} // Vincular al estado actual
                                onChange={(e) => setCurrentPassword(e.target.value)}
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
                        <label className="perfil-label-password">Cambiar contraseña:</label>
                        <div className="password-container">
                            <input
                                className="modal-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                name="password"
                                value={newPassword} // Vincular al estado de la nueva contraseña
                                onChange={(e) => setNewPassword(e.target.value)}
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
                    <label className="perfil-label-password">Confirmar contraseña:</label>
                    <div className="password-container">
                        <input
                            className="modal-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            name="password"
                            value={confirmPassword} // Vincular al estado de confirmación
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </span>
                    </div>
                </div>
                </div>
                <div className="perfil-buttons">
                <button onClick={handleCambiarPassword} disabled={loadingSave}>
                        {loadingSave ? 'Cambiando...' : 'Cambiar'}
                    </button>
                    <button onClick={clearForm}>Nuevo</button>
                </div>
            </section>
        </main>
    );
};

export default Perfil;
