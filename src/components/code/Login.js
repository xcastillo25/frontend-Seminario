import React, { useState } from 'react';
import '../design/Login.css';
import Logo from '../../assets/paseo.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from './ContextAuth';  // Asegúrate de importar correctamente el contexto
import { API_URL } from '../../config/config';  // Asegúrate de que esta URL está configurada correctamente

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();  // Obtener la función de login del contexto
    const navigate = useNavigate();

    const handleCheckboxChange = () => {
        setRememberMe(!rememberMe);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/login`, { usuario, password });

            // Guarda el token y los datos del usuario en el contexto de autenticación
            login({
                token: response.data.token,
                usuario: {
                    idusuario: response.data.idusuario,
                    nombre: response.data.nombre,
                    apellidos: response.data.apellidos,
                    foto: response.data.foto,
                    rol: response.data.rol  // Asegúrate de incluir el rol
                }
            });

            toast.success('Inicio de sesión exitoso!');
            navigate('/home');  // Redirige al usuario al dashboard

        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al iniciar sesión');
        }
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
                                    />
                                    Recuérdame
                                </label>
                                <a href="#" className="forgot-password">Recuperar la Contraseña</a>
                            </div>
                            <button type="submit" className="btn-signin">Iniciar Sesión</button>
                            <hr />
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Login;
