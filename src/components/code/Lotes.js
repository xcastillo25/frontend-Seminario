import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../design/Lotes.css'; // Asegúrate de crear este archivo
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';
import MotorValidaciones from './MotorValidaciones';
import { ValidaLetrasAlmacenar, ValidaLotesAlmacenar } from './ValidacionesAlmacenar';


const Lotes = () => {
    const [lotes, setLotes] = useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('manzana');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [loteToDelete, setLoteToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [deleting, setDeleting] = useState(false);

    //ReferenciasValidaciones
    const manzanaRef = useRef(null);
    const loteRef = useRef(null);

    useEffect(() => {
        //Validaciones
        MotorValidaciones.agregarEvento(manzanaRef.current, 'keypress', MotorValidaciones.validaSoloLetras);
        MotorValidaciones.agregarEvento(loteRef.current, 'keypress', MotorValidaciones.validaLotesKeyPress);


        if (manzanaRef.current) {
            MotorValidaciones.agregarEvento(manzanaRef.current, 'blur', MotorValidaciones.validaSoloLetrasCompleto);
        }

        if (loteRef.current) {
            MotorValidaciones.agregarEvento(loteRef.current, 'blur', MotorValidaciones.validaLotesCompleto);
        }

        fetchLotes();
    }, []);

    const fetchLotes = async () => {
        try {
            const response = await axios.get(`${API_URL}/lote`);
            setLotes(response.data.lotes);
        } catch (error) {
            handleError(error, 'Error al cargar lotes');
        }
    };

    const handleSelectLote = (lote) => {
        setSelectedLote(lote);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setSelectedLote({
            ...selectedLote,
            [name]: name === 'manzana' || name === 'lote' ? value.toUpperCase() : value,
        });
        setEditing(true);
    };

    const validateForm = () => {
        if (!selectedLote || !selectedLote.manzana || !selectedLote.lote) {
            toast.error('Todos los campos son obligatorios.');
            return false;
        }

        const resValidaSoloLetrasCompleto = ValidaLetrasAlmacenar(selectedLote.manzana, "Manzana");
        if (!resValidaSoloLetrasCompleto.valido) {
            toast.error(resValidaSoloLetrasCompleto.mensaje);
            return false;
        }

        const resValidaLetrasyNumerosAlmacenar = ValidaLotesAlmacenar(selectedLote.lote, "Lote");
        if (!resValidaLetrasyNumerosAlmacenar.valido) {
            toast.error(resValidaLetrasyNumerosAlmacenar.mensaje);
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoadingSave(true);
        try {
            if (selectedLote && selectedLote.idlote) {
                await axios.put(`${API_URL}/lote/${selectedLote.idlote}`, selectedLote);
                toast.success('Lote actualizado');
            } else {
                await axios.post(`${API_URL}/lote`, selectedLote);
                toast.success('Lote creado');
            }
            fetchLotes();
            clearForm();
        } catch (error) {
            handleError(error, 'Error al guardar el lote.');
        } finally {
            setLoadingSave(false);
        }
    };

    const handleDeleteClick = (idlote) => {
        setLoteToDelete(idlote);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${API_URL}/lote/${loteToDelete}`);
            toast.success('Lote eliminado');
            fetchLotes();
            clearForm();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                // Si el servidor responde con un conflicto (status 409), significa que hay relaciones de claves foráneas
                toast.error('No se puede eliminar el lote porque tiene registros relacionados.');
            } else {
                handleError(error, 'No se puede eliminar este Lote.');
            }
        } finally {
            setShowModal(false);
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        setLoteToDelete(null);
        setShowModal(false);
    };

    const toggleActive = async (idlote) => {
        setLoadingToggle(true);
        try {
            await axios.patch(`${API_URL}/lote/${idlote}/toggle`);
            toast.success('Estado cambiado');
            fetchLotes();
        } catch (error) {
            handleError(error, 'Error al cambiar el estado.');
        } finally {
            setLoadingToggle(false);
        }
    };

    const clearForm = () => {
        setSelectedLote(null);
        setLoadingToggle(false);
        setEditing(false);
    };

    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const filteredLotes = lotes.filter((lote) =>
        lote[filterColumn]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPost = currentPage * rowsPerPage;
    const indexOfFirstPost = indexOfLastPost - rowsPerPage;
    const currentClientes = filteredLotes.slice(indexOfFirstPost, indexOfLastPost);

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




    const paginationRange = getPaginationRange(currentPage, Math.ceil(filteredLotes.length / rowsPerPage));
    return (
        <main className="lotes-container">
            <ToastContainer />
            <section className="lotes-section">
                <h1 className="lotes-title">Gestión de Lotes</h1>
                <div className="lotes-data">
                    <div className="row">
                        <label className="lotes-label">Manzana:</label>
                        <input
                            className="lotes-input"
                            type="text"
                            placeholder="Manzana"
                            name="manzana"
                            value={selectedLote ? selectedLote.manzana : ''}
                            onChange={handleInputChange}
                            ref={manzanaRef}
                        />
                    </div>
                    <div className="row">
                        <label className="lotes-label">Lote:</label>
                        <input
                            className="lotes-input"
                            type="text"
                            placeholder="Número de lote"
                            name="lote"
                            value={selectedLote ? selectedLote.lote : ''}
                            onChange={handleInputChange}
                            ref={loteRef}
                        />
                    </div>
                    <div className="row">
                        <label className="lotes-label">Observaciones:</label>
                        <input
                            className="lotes-input"
                            type="text"
                            placeholder="Observaciones"
                            name="observaciones"
                            value={selectedLote ? selectedLote.observaciones : ''}
                            onChange={handleInputChange}
                        />
                    </div>

                </div>
                <div className="lotes-data-buttons">
                    <button className="lotes-button" onClick={handleSave} disabled={loadingSave}>
                        {loadingSave ? (selectedLote && selectedLote.idlote ? 'Actualizando...' : 'Agregando...') : (selectedLote && selectedLote.idlote ? 'Actualizar' : 'Guardar')}
                    </button>
                    <button className="lotes-button" onClick={clearForm} disabled={loadingSave}>Nuevo</button>
                    {selectedLote && !editing && (
                        <button className="lotes-button" onClick={() => { toggleActive(selectedLote.idlote); clearForm(); }} disabled={loadingToggle}>
                            {loadingToggle ? (selectedLote.activo ? 'Desactivando...' : 'Activando...') : (selectedLote.activo ? 'Desactivar' : 'Activar')}
                        </button>
                    )}
                </div>
            </section>
            <section className="lotes-section">
                <h1 className="lotes-title">Datos Existentes</h1>
                <div className="lotes-buscar">
                    <label className="lotes-label">Buscar:</label>
                    <select
                        className="lotes-select"
                        value={filterColumn}
                        onChange={(e) => setFilterColumn(e.target.value)}
                    >
                        <option value="manzana">Manzana</option>
                        <option value="lote">Lote</option>
                        <option value="observaciones">Observaciones</option>
                    </select>
                    <input
                        type="text"
                        className="lotes-input"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="lotes-table">
                    <table className="lotes-data-table">
                        <thead>
                            <tr>
                                <th>Manzana</th>
                                <th>Lote</th>
                                <th>Observaciones</th>
                                <th>Estado</th>
                                <th>Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentClientes.map((lote) => (
                                <tr key={lote.idlote} onClick={() => handleSelectLote(lote)}>
                                    <td>{lote.manzana}</td>
                                    <td>{lote.lote}</td>
                                    <td>{lote.observaciones}</td>
                                    <td>
                                        <span className={`status ${lote.activo ? 'active' : 'inactive'}`}>
                                            {lote.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="lotes-actions">
                                        <button className="eliminar-icon-button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(lote.idlote); }} disabled={loadingSave || loadingToggle}>
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

                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredLotes.length / rowsPerPage)}>Siguiente</button>
                        <button onClick={() => paginate(Math.ceil(filteredLotes.length / rowsPerPage))} disabled={currentPage === Math.ceil(filteredLotes.length / rowsPerPage)}>Último</button>

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
        </main>
    );
};

export default Lotes;
