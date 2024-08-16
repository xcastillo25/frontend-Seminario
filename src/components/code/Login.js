import { useState } from 'react';
import '../design/Login.css';
import Logo from '../../assets/paseo.jpg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleCheckboxChange = () => {
        setRememberMe(!rememberMe);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                        <form>
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
