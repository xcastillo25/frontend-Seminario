import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../design/HistorialServicios.css'; // Asegúrate de crear este archivo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';
import MotorValidaciones from './MotorValidaciones';
import {validaDPI, validaNIT, ValidaTelefono} from './ValidacionesAlmacenar';

const HistorialServicios = () => {
   

    return (
        <main className="historial-servicios-container">
            <ToastContainer />
            <section className="historial-servicios-section">
                <h3 className="historial-servicios-title">Reporte de Servicios</h3>
                <div className="historial-pagos-data">

                </div>
            </section>
        </main>
    );
};

export default HistorialServicios;
