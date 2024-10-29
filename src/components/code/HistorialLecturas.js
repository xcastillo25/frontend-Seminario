import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/HistorialLecturas.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const HistorialLecturas = () => {
    const [servicios, setServicios] = useState([]);
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [filteredServicio, setFilteredServicio] = useState(null);
    const [lecturas, setLecturas] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('lotes.ubicacion');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [years, setYears] = useState([]);
    const [loadingLecturas, setLoadingLecturas] = useState(false);
    const [valorRecibido, setValorRecibido] = useState(0);
    const [valorRecibidoParcial, setValorRecibidoParcial] = useState(0);
    const [conceptoPago, setConceptoPago] = useState('');
    const [cambio, setCambio] = useState('0.00');
    const [cambioParcial, setCambioParcial] = useState('0.00');
    const [montoPagar, setMontoPagar] = useState(0);
    const [pagos, setPagos] = useState([]);
    const [totalPago, setTotalPago] = useState(0);
    const [lecturasPagadas, setLecturasPagadas] = useState([]);
    const [pagosAdelantados, setPagosAdelantados] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [totalToPay, setTotalToPay] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [showModalPagoParcial, setShowModalPagoParcial] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    useEffect(() => {
        fetchServicios();
        generateYears();
    }, []);

    useEffect(() => {
        if (showModalPagoParcial) {
            setCambioParcial(0);
            setValorRecibidoParcial('');
            setConceptoPago('');
        }
    }, [showModalPagoParcial]);
    
    useEffect(() => {
        setPagos(
            lecturas.map((lectura) => ({
                idlectura: lectura.idlectura,
                cuotaPago: 0,
                moraPago: 0,
                excesoPago: 0,
            }))
        );
    }, [lecturas]);

    useEffect(() => {
        const total = pagos.reduce((acc, pago) => {
            const cuota = parseFloat(pago.cuotaPago) || 0;
            const mora = parseFloat(pago.moraPago) || 0;
            const exceso = parseFloat(pago.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);
        setTotalPago(total);
    }, [pagos]);

    useEffect(() => {
        const total = lecturas.reduce((acc, lectura) => {
            const cuota = parseFloat(lectura.cuotaPago) || 0;
            const mora = parseFloat(lectura.moraPago) || 0;
            const exceso = parseFloat(lectura.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);
        setTotalPago(total);
    }, [lecturas]);

    useEffect(() => {
        filterServicios();
    }, [searchTerm, filterColumn, servicios]);

    const fetchLecturas = async (idservicio) => {
        try {
            setLoadingLecturas(true);
            const response = await axios.get(`${API_URL}/reporte-lecturas/${idservicio}`);
            const lecturasData = response.data.lecturas || [];
            
            console.log("Datos de lecturas cargados:", lecturasData); // Log para verificar los datos cargados
            
            setLecturas(lecturasData);
            processLecturasData(lecturasData);
        } catch (error) {
            handleError(error, 'Error al cargar lecturas');
        } finally {
            setLoadingLecturas(false);
        }
    };    

    const filterServicio = async () => {
        const filtered = servicios.find(servicio => {
            const valueToFilter = filterColumn.includes('clientes.')
                ? servicio.clientes[filterColumn.split('.')[1]]
                : servicio.lotes[filterColumn.split('.')[1]];
    
            return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    
        setLecturas([]);
    
        if (filtered) {
            setFilteredServicio(filtered);
            await fetchLecturas(filtered.idservicio);
            setShowGraph(true)
        } else {
            setFilteredServicio(null);
            setShowGraph(false);
            setChartData(null);
        }
    };
    
    const generateYears = () => {
        const startYear = 2020;
        const endYear = 2035;
        const yearsArray = [];
        for (let year = startYear; year <= endYear; year++) {
            yearsArray.push(year);
        }
        setYears(yearsArray);
    };

    const fetchServicios = async () => {
        try {
            const response = await axios.get(`${API_URL}/servicio-pago`);
            setServicios(response.data.servicios);
            setFilteredServicios(response.data.servicios);
        } catch (error) {
            handleError(error, 'Error al cargar servicios');
        }
    };

    const filterServicios = () => {
        let filtered = servicios;

        if (searchTerm) {
            filtered = servicios.filter(servicio => {
                const valueToFilter = filterColumn.includes('clientes.')
                    ? servicio.clientes[filterColumn.split('.')[1]]
                    : servicio.lotes[filterColumn.split('.')[1]];

                return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        setFilteredServicios(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterColumn(e.target.value);
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            toast.error("No se ha ingresado ningún dato en el campo de búsqueda");
            return;
        }
    
        setLecturas([]);
        setPagos([]);
        setTotalPago(0);
        setFilteredServicio(null);
    
        await filterServicio();
    };
    
    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const handleReset = () => {
        setFilteredServicio(null);
        setSearchTerm('');
    };

    const handleConceptoPagoChange = () => {
        const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
        const sortedSelectedMonths = selectedMonths
            .map(monthStr => {
                const [year, month] = monthStr.split('-').map(Number);
                return { year, month };
            })
            .sort((a, b) => (a.year - b.year) || (a.month - b.month));
    
        const conceptoPago = sortedSelectedMonths
            .map(({ year, month }) => `${mesesNombres[month - 1]} ${year}`)
            .join(', ');
    
        setConceptoPago(`Pagos adelantados para ${conceptoPago}`);
    };
    
    useEffect(() => {
        handleConceptoPagoChange();
    }, [selectedMonths]);

    useEffect(() => {
        if (showModal) {
            setValorRecibido('');
        }
    }, [showModal]);

    const indexOfLastLectura = currentPage * rowsPerPage;
    const indexOfFirstLectura = indexOfLastLectura - rowsPerPage;
    const currentLecturas = Array.isArray(lecturas) ? lecturas.slice(indexOfFirstLectura, indexOfLastLectura) : [];

    useEffect(() => {
        const totalSum = currentLecturas.reduce((acc, lectura) => {
            const totalMensual = parseFloat(lectura.cuota_mensual) || 0;
            const montoExceso = parseFloat(lectura.monto_exceso) || 0;
            return acc + totalMensual + montoExceso;
        }, 0);
        
        setMontoPagar(totalSum);
    }, [currentLecturas]);
    
    const processLecturasData = (lecturasData) => {
        // Ordenamos las lecturas en función de año y mes, en orden ascendente
        const sortedLecturas = lecturasData.slice().sort((a, b) => {
            if (a.año !== b.año) return a.año - b.año; // Ordenar primero por año
            return a.mes - b.mes; // Luego por mes
        });
    
        // Tomamos las últimas 12 lecturas (en caso de que haya más de 12) y las mantenemos en orden ascendente
        const last12Lecturas = sortedLecturas.slice(-12);
    
        // Variables para almacenar los valores de mora, exceso y diferencia de lecturas
        let lecturaInicial = parseFloat(last12Lecturas[0]?.servicios?.lectura_inicial || 0);
        const moraValues = [];
        const excesoValues = [];
        const lecturaDifferences = [];
    
        last12Lecturas.forEach((lectura, index) => {
            const lecturaActual = parseFloat(lectura.lectura || 0);
    
            if (index === 0) {
                // Para la primera lectura, usamos lectura_inicial para calcular la diferencia
                lecturaDifferences.push(lecturaActual - lecturaInicial);
            } else {
                const lecturaAnterior = parseFloat(last12Lecturas[index - 1].lectura || 0);
                lecturaDifferences.push(lecturaActual - lecturaAnterior);
            }
    
            // Agregamos los valores de mora y exceso
            moraValues.push(parseFloat(lectura.monto_mora || 0));
            excesoValues.push(parseFloat(lectura.monto_exceso || 0));
        });
    
        // Configuramos las etiquetas de la gráfica en formato "Mes Año"
        const mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const labels = last12Lecturas.map((lectura) => `${mesesNombres[lectura.mes - 1]} ${lectura.año}`);
    
        // Configuramos los datos para la gráfica
        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Consumo',
                    data: lecturaDifferences,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                    label: 'Mora',
                    data: moraValues,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                },
                {
                    label: 'Exceso',
                    data: excesoValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
            ],
        });
    };
    

    return (
        <main>
            <ToastContainer />
            <section className="historial-lecturas-section">
                <h1 className="historial-lecturas-title">Gestión de Lecturas</h1>
                <div className="historial-lecturas-busqueda">
                    <label>Buscar:</label>
                    <select value={filterColumn} onChange={handleFilterChange}>
                        <option value="lotes.ubicacion">Lote</option>
                        <option value="clientes.nombre">Nombre</option>
                        <option value="clientes.apellidos">Apellidos</option>
                        <option value="clientes.cui">CUI</option>
                        <option value="clientes.nit">NIT</option>
                        <option value="clientes.telefono">Teléfono</option>
                    </select>
                    <input 
                        type="text"
                        placeholder="Buscar datos"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button onClick={handleSearchClick}>Buscar</button>
                    <button onClick={handleReset}>Nuevo</button>
                </div>
                
                <div className="historial-lecturas-resultados">
                    {filteredServicio ? (
                        <div className="resultado-item">
                            <div className="row">
                                <label>Nombre del Cliente:</label>
                                <h3>{filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</h3>
                            </div>
                            <div className="row">
                                <label>NIT:</label> 
                                <h3>{filteredServicio.clientes.nit}</h3>
                            </div>
                            <div className="row">
                                <label>Título:</label>
                                <h3>{filteredServicio.no_titulo}</h3>
                            </div>
                            <div className="row">
                                <label>No. Contador:</label>
                                <h3>{filteredServicio.no_contador}</h3>
                            </div>
                            <div className="row">
                                <label>Estado:</label>
                                <h3>{filteredServicio.estatus_contador}</h3>
                            </div>
                            <div className="row">
                                <label>Lote:</label>
                                <h3>{filteredServicio.lotes.ubicacion}</h3>
                            </div>
                            <div className="row">
                                <label>Cuota:</label>
                                <h3>Q.{filteredServicio.configuracion.cuota}</h3>
                            </div>
                        </div>
                    ) : (
                        <p>No se ha seleccionado ningún servicio.</p>
                    )}
                </div>
                
                {showGraph && ( 
                    <div className="historial-lecturas-grafico">
                        <h1>Historial de Lecturas</h1>
                        {chartData ? (
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Valor',
                                            },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <p>Cargando datos de la gráfica...</p>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
};

export default HistorialLecturas;
