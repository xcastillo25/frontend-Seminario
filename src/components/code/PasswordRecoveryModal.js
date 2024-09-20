import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../config/config';
import '../design/PasswordRecoveryModal.css';

const PasswordRecoveryModal = ({ isOpen, onClose }) => {
    const [usuario, setUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/recuperarPassword`, { usuario, email });

            // Si la respuesta es exitosa, muestra un mensaje de éxito
            toast.success(response.data.message || 'Contraseña recuperada con éxito. Revisa tu correo.');

            // Limpiar los campos después del éxito
            setUsuario('');
            setEmail('');
        } catch (error) {
            // Si hay un error, muestra el mensaje de error correspondiente
            toast.error(error.response?.data?.error || 'No se pudo recuperar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null; // No renderizar si el modal no está abierto

    return (
        <>
            <ToastContainer />
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="recovery-boton-cerrar"> 
                        <button className="btn-close" onClick={onClose}>X</button>
                    </div>
                    <h2>Recuperar Contraseña</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Usuario:</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PasswordRecoveryModal;
