import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Inicio.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Inicio = () => {
    // Estados para la primera gráfica de barras
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState({});
    const [availableData, setAvailableData] = useState([]);
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [realizadas, setRealizadas] = useState(0);
    const [pendientes, setPendientes] = useState(0);

    // Estados para la nueva gráfica de barras
    const [newChartData, setNewChartData] = useState(null);
    const [newChartOptions, setNewChartOptions] = useState({});
    const [newAvailableData, setNewAvailableData] = useState([]);
    const [newYears, setNewYears] = useState([]);
    const [newMonths, setNewMonths] = useState([]);
    const [newSelectedYear, setNewSelectedYear] = useState('');
    const [newSelectedMonth, setNewSelectedMonth] = useState('');

    // Estados para almacenar los totales de la nueva gráfica
    const [totalCuotas, setTotalCuotas] = useState(0);
    const [totalMoras, setTotalMoras] = useState(0);
    const [totalExcesos, setTotalExcesos] = useState(0);

    // Estados para la gráfica de pie
    const [pieData, setPieData] = useState(null);
    const [serviceSummary, setServiceSummary] = useState({});

    const defaultMonths = [
        { label: 'Enero', value: 1 },
        { label: 'Febrero', value: 2 },
        { label: 'Marzo', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Mayo', value: 5 },
        { label: 'Junio', value: 6 },
        { label: 'Julio', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Septiembre', value: 9 },
        { label: 'Octubre', value: 10 },
        { label: 'Noviembre', value: 11 },
        { label: 'Diciembre', value: 12 }
    ];

    // Función para obtener datos de la gráfica de pie
    const fetchPieData = async () => {
        try {
            const response = await axios.get(`${API_URL}/mostrarResumenServicios`);
            const serviceData = response.data.data[0];

            const pieChartData = {
                labels: ['Pagando', 'Cortado', 'Suspendido'],
                datasets: [
                    {
                        label: 'Estado de Servicios',
                        data: [serviceData.totalPagando, serviceData.totalCortado, serviceData.totalSuspendido],
                        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
                    }
                ]
            };

            setPieData(pieChartData);
            setServiceSummary(serviceData);
        } catch (error) {
            toast.error('Error al obtener los datos de los servicios');
        }
    };

    // Función para obtener datos de la primera gráfica de barras
    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_URL}/mostrarResumenLecturas`);
            let data = response.data.data;

            const uniqueYears = [...new Set(data.map(item => item.anio))];
            const uniqueMonths = [...new Set(data.map(item => item.mes))];

            setYears(uniqueYears);
            setMonths(defaultMonths.filter(month => uniqueMonths.includes(month.value)));
            setAvailableData(data);

            const maxItem = data.reduce((max, item) => {
                if (item.anio > max.anio || (item.anio === max.anio && item.mes > max.mes)) {
                    return item;
                }
                return max;
            }, data[0]);

            if (!selectedYear && !selectedMonth) {
                setSelectedYear(maxItem.anio.toString());
                setSelectedMonth(maxItem.mes.toString());
            }
        } catch (error) {
            toast.error('Error al obtener los datos de las lecturas');
        }
    };

    // Función para actualizar datos de la primera gráfica de barras
    const updateChartData = () => {
        const filteredData = availableData.filter(
            item => item.anio === parseInt(selectedYear) && item.mes === parseInt(selectedMonth)
        );

        if (filteredData.length > 0) {
            const meses = filteredData.map(item => `${item.mes}/${item.anio}`);
            const realizadas = filteredData.map(item => item.lecturasRealizadas);
            const pendientes = filteredData.map(item => item.lecturasPendientes);

            const totalLecturas = filteredData.map(item => item.lecturasRealizadas + item.lecturasPendientes);
            const realizadasPorcentaje = realizadas.map((r, i) => ((r / totalLecturas[i]) * 100).toFixed(2));
            const pendientesPorcentaje = pendientes.map((p, i) => ((p / totalLecturas[i]) * 100).toFixed(2));

            setRealizadas(realizadas.reduce((a, b) => a + b, 0));
            setPendientes(pendientes.reduce((a, b) => a + b, 0));

            setChartData({
                labels: meses,
                datasets: [
                    {
                        label: 'Lecturas Realizadas',
                        data: realizadasPorcentaje,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        type: 'bar',
                    },
                    {
                        label: 'Lecturas Pendientes',
                        data: pendientesPorcentaje,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 2,
                        type: 'bar',
                    }
                ]
            });

            setChartOptions({
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(0, 220, 195)',
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Lecturas Realizadas vs Pendientes',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
            });
        } else {
            setChartData(null);
            setRealizadas(0);
            setPendientes(0);
            toast.info('No hay datos disponibles para el mes y año seleccionados.');
        }
    };

    // Función para obtener datos de la nueva gráfica de barras
    const fetchNewChartData = async () => {
        try {
            const response = await axios.get(`${API_URL}/mostrarResumenPagos`);
            let data = response.data.data;

            const uniqueYears = [...new Set(data.map(item => parseInt(item.año)))];
            const uniqueMonths = [...new Set(data.map(item => parseInt(item.mes)))];

            setNewYears(uniqueYears);
            setNewMonths(defaultMonths.filter(month => uniqueMonths.includes(month.value)));
            setNewAvailableData(data);

            const maxItem = data.reduce((max, item) => {
                if (parseInt(item.año) > parseInt(max.año) || (parseInt(item.año) === parseInt(max.año) && parseInt(item.mes) > parseInt(max.mes))) {
                    return item;
                }
                return max;
            }, data[0]);

            if (!newSelectedYear && !newSelectedMonth) {
                setNewSelectedYear(maxItem.año.toString());
                setNewSelectedMonth(maxItem.mes.toString());
            }
        } catch (error) {
            toast.error('Error al obtener los datos de los pagos');
        }
    };

    // Función para actualizar datos de la nueva gráfica de barras
    const updateNewChartData = () => {
        const filteredData = newAvailableData.filter(
            item => parseInt(item.año) === parseInt(newSelectedYear) && parseInt(item.mes) === parseInt(newSelectedMonth)
        );

        if (filteredData.length > 0) {
            const totalCuotasValue = parseFloat(filteredData[0].totalCuotas);
            const totalMorasValue = parseFloat(filteredData[0].totalMoras);
            const totalExcesosValue = parseFloat(filteredData[0].totalExcesos);

            setTotalCuotas(totalCuotasValue);
            setTotalMoras(totalMorasValue);
            setTotalExcesos(totalExcesosValue);

            const labels = ['Total Cuotas', 'Total Moras', 'Total Excesos'];
            const dataValues = [totalCuotasValue, totalMorasValue, totalExcesosValue];

            setNewChartData({
                labels: labels,
                datasets: [
                    {
                        label: 'Resumen de Pagos',
                        data: dataValues,
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 206, 86, 0.6)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255,99,132,1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 2,
                    }
                ]
            });

            setNewChartOptions({
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Resumen de Pagos para ${filteredData[0].mes}/${filteredData[0].año}`,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
            });
        } else {
            setNewChartData(null);
            setTotalCuotas(0);
            setTotalMoras(0);
            setTotalExcesos(0);
            toast.info('No hay datos disponibles para el mes y año seleccionados.');
        }
    };

    useEffect(() => {
        fetchData();
        fetchPieData();
        fetchNewChartData();
    }, []);

    useEffect(() => {
        if (selectedMonth && selectedYear) {
            updateChartData();
        }
    }, [selectedMonth, selectedYear, availableData]);

    useEffect(() => {
        if (newSelectedMonth && newSelectedYear) {
            updateNewChartData();
        }
    }, [newSelectedMonth, newSelectedYear, newAvailableData]);

    return (
        <main className="inicio-container">
            <ToastContainer />
            <section className="cards-section">
                <div className="cards-wrapper">
                    {/* Primera Gráfica de Barras */}
                    <div className="card">
                        <h4>Resumen de Lecturas Mensuales</h4>
                        <div className="select-row">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="select-dropdown"
                            >
                                <option value="">Selecciona un año</option>
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="select-dropdown"
                            >
                                <option value="">Selecciona un mes</option>
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="chart-container">
                            {chartData ? (
                                <Bar
                                    data={chartData}
                                    options={chartOptions}
                                />
                            ) : (
                                <p>Cargando gráfica...</p>
                            )}
                        </div>
                        <div className="chart-info">
                            <p>Lecturas Realizadas: <strong>{realizadas}</strong></p>
                            <p>Lecturas Pendientes: <strong>{pendientes}</strong></p>
                        </div>
                    </div>

                    {/* Nueva Gráfica de Pagos */}
                    <div className="card">
                        <h4>Resumen de Pagos Mensuales</h4>
                        <div className="select-row">
                            <select
                                value={newSelectedYear}
                                onChange={(e) => setNewSelectedYear(e.target.value)}
                                className="select-dropdown"
                            >
                                <option value="">Selecciona un año</option>
                                {newYears.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={newSelectedMonth}
                                onChange={(e) => setNewSelectedMonth(e.target.value)}
                                className="select-dropdown"
                            >
                                <option value="">Selecciona un mes</option>
                                {newMonths.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="chart-container">
                            {newChartData ? (
                                <Bar
                                    data={newChartData}
                                    options={newChartOptions}
                                />
                            ) : (
                                <p>Cargando gráfica...</p>
                            )}
                        </div>
                        <div className="chart-info">
                            <p>Total Cuotas: <strong>{totalCuotas}</strong></p>
                            <p>Total Moras: <strong>{totalMoras}</strong></p>
                            <p>Total Excesos: <strong>{totalExcesos}</strong></p>
                        </div>
                    </div>

                    {/* Gráfica de Pie */}
                    <div className="card">
                        <h4>Resumen de Estado de Servicios</h4>
                        <div className="pie-chart-container">
                            {pieData ? (
                                <Pie
                                    data={pieData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Estado de Servicios'
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p>Cargando gráfica...</p>
                            )}
                        </div>
                        <div className="chart-info">
                            <p>Pagando: <strong>{serviceSummary.totalPagando}</strong></p>
                            <p>Cortado: <strong>{serviceSummary.totalCortado}</strong></p>
                            <p>Suspendido: <strong>{serviceSummary.totalSuspendido}</strong></p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Inicio;
