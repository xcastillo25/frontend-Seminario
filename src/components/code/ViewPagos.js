import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/ViewPagos.css'; // Asegúrate de que este archivo exista
import { API_URL } from '../../config/config';

const PagosTable = () => {
    const [pagos, setPagos] = useState([]);
    const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
    const [searchMonth, setSearchMonth] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Obtener el mes actual (indexado desde 0, por eso sumamos 1)
    useEffect(() => {
        const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
        setSearchMonth(currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)); // Mes actual capitalizado
        fetchPagos();
    }, []);

    const fetchPagos = async () => {
        try {
            const response = await axios.get(`${API_URL}/pagos`);
            if (response.data?.pagos) {
                setPagos(response.data.pagos);
            } else {
                console.error('Estructura de datos no válida:', response.data);
            }
        } catch (error) {
            console.error('Error al cargar pagos', error);
        }
    };

    const handleSearchYearChange = (e) => setSearchYear(e.target.value);
    const handleSearchMonthChange = (e) => setSearchMonth(e.target.value);
    const handleSearchTermChange = (e) => setSearchTerm(e.target.value);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const filteredPagos = pagos.filter((pago) => {
        const yearMatch = searchYear ? pago.año.toString() === searchYear : true;
        const monthMatch = searchMonth ? pago.mes.toLowerCase() === searchMonth.toLowerCase() : true;
        const searchMatch = searchTerm
            ? Object.values(pago).some(val =>
                val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
            : true;
        return yearMatch && monthMatch && searchMatch;
    });

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    const getPaginationRange = (currentPage, totalPages) => {
        const totalNumbersToShow = 3; // Mostrar 3 páginas en el centro (incluyendo la actual)
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

            // Si la página actual es mayor que 4, mostrar el '...'
            if (currentPage > totalNumbersToShow) {
                pages.push('...');
            }

            // Definir el rango de páginas centrales usando `totalNumbersToShow`
            let startPage = Math.max(2, currentPage - Math.floor(totalNumbersToShow / 2)); // Comenzar antes de la actual
            let endPage = Math.min(totalPages - 1, currentPage + Math.floor(totalNumbersToShow / 2)); // Terminar después de la actual

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Si estamos a más de `totalNumbersToShow` páginas del final, mostrar el '...'
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


    const paginationRange = getPaginationRange(currentPage, Math.ceil(filteredPagos.length / rowsPerPage));

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredPagos.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div>
            <section className="pagos-section">
                <h1 className="pagos-title">Historial de Pagos</h1>
                <div className="search-filters">
                    <select className="search-select" value={searchYear} onChange={handleSearchYearChange}>
                        <option value="">Seleccionar Año</option>
                        {Array.from({ length: 16 }, (_, i) => 2020 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select className="search-select" value={searchMonth} onChange={handleSearchMonthChange}>
                        <option value="">Seleccionar Mes</option>
                        {monthNames.map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        placeholder="Buscar por cualquier campo"
                    />
                </div>
                <table className="pagos-table">
                    <thead>
                        <tr>
                            <th>ID Pago</th>
                            <th>Servicio</th>
                            <th>Mes</th>
                            <th>Año</th>
                            <th>Fecha</th>
                            <th>Concepto</th>
                            <th>Total</th>
                            <th>Estatus de Pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((pago) => (
                                <tr key={pago.idpago}>
                                    <td>{pago.idpago}</td>
                                    <td>{pago.idservicio}</td>
                                    <td>{pago.mes}</td>
                                    <td>{pago.año}</td>
                                    <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                                    <td>{pago.concepto}</td>
                                    <td>{pago.total}</td>
                                    <td>{pago.activo ? 'Activo' : 'Inactivo'}</td>
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
                    {/* {Array.from({ length: Math.ceil(filteredPagos.length / rowsPerPage) }, (_, index) => (
                        <button key={index + 1} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </button>
                    ))} */}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredPagos.length / rowsPerPage)}>Siguiente</button>
                    <button onClick={() => paginate(Math.ceil(filteredPagos.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredPagos.length / rowsPerPage)}>Último</button>
                    <select className="rows-per-page" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </section>
        </div>
    );
};

export default PagosTable;
