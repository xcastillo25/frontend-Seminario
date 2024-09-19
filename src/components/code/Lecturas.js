import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Lecturas.css'; // Asegúrate de que este archivo exista
import { API_URL } from '../../config/config';

const LecturasTable = () => {
    const [lecturas, setLecturas] = useState([]);
    const [searchYear, setSearchYear] = useState('');
    const [searchMonth, setSearchMonth] = useState('');
    const [searchLecturas, setSearchLecturas] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        fetchLecturas();
    }, []);

    const fetchLecturas = async () => {
        try {
            const response = await axios.get(`${API_URL}/view-lecturas`);
            if (response.data?.Lecturas) {
                setLecturas(response.data.Lecturas);
            } else {
                console.error('Estructura de datos no válida:', response.data);
            }
        } catch (error) {
            console.error('Error al cargar lecturas', error);
        }
    };

    const handleSearchYearChange = (e) => setSearchYear(e.target.value);

    const handleSearchMonthChange = (e) => setSearchMonth(e.target.value);

    const handleSearchLecturasChange = (e) => setSearchLecturas(e.target.value);

    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);

    const handleImageClose = (e) => {
        if (e.target.classList.contains('image-viewer-custom')) {
            setSelectedImage('');
        }
    };

    const filteredLecturas = lecturas.filter((lectura) => {
        const yearMatch = searchYear ? lectura.año.toString() === searchYear : true;
        const monthMatch = searchMonth ? lectura.mes.toString() === searchMonth : true;
        const loteMatch = searchLecturas ? lectura.lote.toLowerCase().includes(searchLecturas.toLowerCase()) : true;
        return yearMatch && monthMatch && loteMatch;
    });

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredLecturas.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div className="lecturas-container">
            <section className="lecturas-section">
                <h1 className="lecturas-title">Lecturas</h1>
                <div className="search-filters">
                    <select className="search-select" value={searchYear} onChange={handleSearchYearChange}>
                        <option value="">Seleccionar Año</option>
                        {Array.from({ length: 16 }, (_, i) => 2020 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select className="search-select" value={searchMonth} onChange={handleSearchMonthChange}>
                        <option value="">Seleccionar Mes</option>
                        {[
                            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                        ].map((month, index) => (
                            <option key={index + 1} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="search-input"
                        value={searchLecturas}
                        onChange={handleSearchLecturasChange}
                        placeholder="Buscar por Lote"
                    />
                </div>
                <table className="lecturas-table">
                    <thead>
                        <tr>
                            <th>ID Lectura</th>
                            <th>Lectura</th>
                            <th>Fecha</th>
                            <th>Mes</th>
                            <th>Año</th>
                            <th>Foto</th>
                            <th>Número de Contador</th>
                            <th>Lote</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((lectura) => (
                                <tr key={lectura.idlectura}>
                                    <td>{lectura.idlectura}</td>
                                    <td>{lectura.lectura}</td>
                                    <td>{new Date(lectura.fecha).toLocaleDateString()}</td>
                                    <td>{lectura.mes}</td>
                                    <td>{lectura.año}</td>
                                    <td>
                                        <button className="view-photo-button" onClick={() => handleImageClick(lectura.url_foto)}>
                                            Ver Foto
                                        </button>
                                    </td>
                                    <td>{lectura.numero_contador}</td>
                                    <td>{lectura.lote || 'Lote no asignado'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">No hay datos disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="pagination">
                    <button onClick={() => paginate(1)} disabled={currentPage === 1}>Inicio</button>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                    {Array.from({ length: Math.ceil(filteredLecturas.length / rowsPerPage) }, (_, index) => (
                        <button key={index + 1} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredLecturas.length / rowsPerPage)}>Siguiente</button>
                    <button onClick={() => paginate(Math.ceil(filteredLecturas.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredLecturas.length / rowsPerPage)}>Último</button>
                    <select className="rows-per-page" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </section>

            {selectedImage && (
                <div className="image-viewer-custom" onClick={handleImageClose}>
                    <div className="image-viewer-content">
                        <img src={selectedImage} alt="Lectura" className="image-viewer-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturasTable;
