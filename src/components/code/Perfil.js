import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Perfil.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Perfil = ({ idempleado, setPlataformaVisible }) => {
    const [selectedEmpleado, setSelectedEmpleado] = useState(null); // Estado para almacenar los datos del empleado
    const [loadingSave, setLoadingSave] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Cargar perfil del empleado cuando se recibe idempleado
    useEffect(() => {
        console.log('Idempleado recibido:', idempleado);
        if (idempleado) {
            const fetchEmpleadoPerfil = async () => {
                try {
                    const response = await axios.get(`${API_URL}/empleado/${idempleado}`);
                    console.log('Datos del empleado:', response.data.empleados);
                    setSelectedEmpleado(response.data.empleados); // Guardar los datos del empleado en el estado
                } catch (error) {
                    toast.error('Error al cargar el perfil del empleado');
                }
            };
            fetchEmpleadoPerfil(); // Llamar a la función para obtener los datos
        }
    }, [idempleado]); // Ejecutar el efecto cuando cambie el idempleado

    // Manejar el cambio en los inputs
    const handleInputChange = (e) => {
        setSelectedEmpleado({
            ...selectedEmpleado,
            [e.target.name]: e.target.value,
        });
        setEditing(true);
    };

    const clearForm = () => {
        setSelectedEmpleado(null);
        setEditing(false);
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
                            className="perfil-input"
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
                            className="perfil-input"
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
                            className="perfil-input"
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
                            className="perfil-input"
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
                        <button>Cambiar teléfono</button>
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
                                //value={usuario.password}
                                //onChange={handleUsuarioInputChange}
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
                                //value={usuario.password}
                                //onChange={handleUsuarioInputChange}
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
                            //value={usuario.password}
                            //onChange={handleUsuarioInputChange}
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
                    <button>Cambiar</button>
                    <button>Nuevo</button>
                </div>
            </section>
        </main>
    );
};

export default Perfil;
