import React, { useState, useEffect } from 'react';
import '../design/Login.css';
import Logo from '../../assets/paseo.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from './ContextAuth';  
import { API_URL } from '../../config/config';  
import PasswordRecoveryModal from './PasswordRecoveryModal'; // Importa el modal

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para manejar el modal

    const { login } = useAuth();  
    const navigate = useNavigate();

    useEffect(() => {
        const savedUsuario = localStorage.getItem('usuario');
        const savedPassword = localStorage.getItem('password');
        if (savedUsuario && savedPassword) {
            setUsuario(savedUsuario);
            setPassword(savedPassword);
            setRememberMe(true);  // Marca el checkbox si se encontraron credenciales
        }
    }, []);

    const handleCheckboxChange = () => {
        setRememberMe(!rememberMe);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, { usuario, password });

            if (rememberMe) {
                localStorage.setItem('usuario', usuario);
                localStorage.setItem('password', password);
            } else {
                // Si no está marcado, eliminar las credenciales guardadas
                localStorage.removeItem('usuario');
                localStorage.removeItem('password');
            }

            login({
                token: response.data.token,
                usuario: {
                    idusuario: response.data.idusuario,
                    idempleado: response.data.idempleado,
                    nombre: response.data.nombre,
                    apellidos: response.data.apellidos,
                    foto: response.data.foto,
                    rol: response.data.rol,
                    clientes: response.data.clientes,
                    empleados: response.data.empleados,
                    lotes: response.data.lotes,
                    servicios: response.data.servicios,
                    roles: response.data.roles,
                    usuarios: response.data.usuarios,
                    pagos: response.data.pagos,
                    lecturas: response.data.lecturas,
                    configuracion: response.data.configuracion,
                    historial_pagos: response.data.historial_pagos   
                }
            });

            toast.success('Inicio de sesión exitoso!');
            navigate('/home');  

        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const openPasswordRecoveryModal = () => {
        setIsModalOpen(true); // Abre el modal
    };

    const closePasswordRecoveryModal = () => {
        setIsModalOpen(false); // Cierra el modal
    };

    return (
        <>
            <section className="Login" id="Login">
                <ToastContainer />
                <div className="login-container">
                    <div className="login-info">
                        <img src={Logo} alt="Logo" />
                    </div>
                    <div className="login-form">
                        <h1>Bienvenido</h1>
                        <h2>Sistema de Agua Potable Paseo Las Lomas</h2>
                        <form onSubmit={handleSubmit}>
                            <label>Usuario:</label>
                            <input 
                                type="text" 
                                placeholder="Usuario" 
                                value={usuario} 
                                onChange={(e) => setUsuario(e.target.value)} 
                                required 
                            />
                            <label>Contraseña:</label>
                            <div className="password-container">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Contraseña" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <span 
                                    className="password-toggle-icon" 
                                    onClick={togglePasswordVisibility}
                                >
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                </span>
                            </div>
                            <div className="options">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe} 
                                        onChange={handleCheckboxChange} 
                                        className="checkbox-custom"
                                        disabled={isLoading}
                                    />
                                    Recuérdame
                                </label>
                                <a href="#" className="forgot-password" onClick={openPasswordRecoveryModal}>Recuperar la Contraseña</a>
                            </div>
                            <button type="submit" className="btn-signin" disabled={isLoading}>
                                {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                            </button>
                            <hr />
                        </form>
                    </div>
                </div>
            </section>

            {/* Modal de recuperación de contraseña */}
            <PasswordRecoveryModal isOpen={isModalOpen} onClose={closePasswordRecoveryModal} />
        </>
    );
};

export default Login;
