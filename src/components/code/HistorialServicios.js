import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/HistorialServicios.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

// Importar componentes y módulos necesarios para Chart.js
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HistorialServicios = () => {
  // Estados
  const [data, setData] = useState([]); // Datos obtenidos del API
  const [years, setYears] = useState([]); // Años disponibles
  const [selectedYear, setSelectedYear] = useState(''); // Año seleccionado
  const [chartData, setChartData] = useState(null); // Datos para la gráfica
  const [chartOptions, setChartOptions] = useState({}); // Opciones de la gráfica
  const [loadingStatus, setLoadingStatus] = useState('loading'); // Estado de carga

  // Meses para etiquetar el eje X
  const monthsNames = [
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
    { label: 'Diciembre', value: 12 },
  ];

  // Efecto para obtener los datos del API al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoadingStatus('loading');
      try {
        const response = await axios.get(`${API_URL}/mostrarResumenPagosEstadistica`);
        const apiData = response.data.data;

        if (apiData && apiData.length > 0) {
          setData(apiData);

          // Extraer años disponibles
          const uniqueYears = [...new Set(apiData.map(item => item.año))].sort((a, b) => a - b);
          setYears(uniqueYears);

          // Seleccionar el año más reciente por defecto
          const latestYear = uniqueYears[uniqueYears.length - 1];
          setSelectedYear(latestYear);

          setLoadingStatus('success');
        } else {
          setLoadingStatus('noData');
          toast.info('No se encontraron datos para mostrar.');
        }
      } catch (error) {
        setLoadingStatus('error');
        toast.error('Error al obtener los datos de la estadística de pagos');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      updateChartData();
    }
  }, [selectedYear, data]);

  // Función para actualizar los datos de la gráfica
  const updateChartData = () => {
    const filteredData = data.filter(item => item.año === selectedYear);

    if (filteredData.length > 0) {
      // Ordenar datos por mes
      filteredData.sort((a, b) => parseInt(a.mes) - parseInt(b.mes));

      // Preparar etiquetas y datos
      const labels = filteredData.map(item => {
        const monthObj = monthsNames.find(m => m.value === parseInt(item.mes));
        return monthObj ? monthObj.label : `Mes ${item.mes}`;
      });

      const totalCuotasData = filteredData.map(item => parseFloat(item.totalCuotas));
      const totalMorasData = filteredData.map(item => parseFloat(item.totalMoras));
      const totalExcesosData = filteredData.map(item => parseFloat(item.totalExcesos));

      // Calcular el total por mes (suma de cuotas, moras y excesos)
      const totalMesData = totalCuotasData.map((cuota, index) => cuota + totalMorasData[index] + totalExcesosData[index]);

      // Configurar datos de la gráfica
      const chartDataObj = {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Total Cuotas',
            data: totalCuotasData,
            backgroundColor: 'rgba(75, 192, 192, 0.8)', // Verde agua
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
          {
            type: 'bar',
            label: 'Total Moras',
            data: totalMorasData,
            backgroundColor: 'rgba(255, 159, 64, 0.8)', // Naranja
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
          {
            type: 'bar',
            label: 'Total Excesos',
            data: totalExcesosData,
            backgroundColor: 'rgba(153, 102, 255, 0.8)', // Morado
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            stack: 'Stack 0',
          },
          {
            type: 'line',
            label: 'Total Mes',
            data: totalMesData,
            borderColor: 'rgba(54, 162, 235, 1)', // Azul
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: false,
            tension: 0.1,
            pointStyle: 'circle',
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y',
          },
        ],
      };

      // Configurar opciones de la gráfica
      const chartOptionsObj = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14, 
              },
            },
          },
          title: {
            display: true,
            text: `Resumen de Pagos para el año ${selectedYear}`,
            font: {
              size: 20, 
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                let value = context.parsed.y || 0;
                return `${label}: Q${value.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Meses',
              font: {
                size: 16,
              },
            },
            ticks: {
              font: {
                size: 12, 
              },
            },
          },
          y: {
            stacked: true,
            title: {
              display: true,
              font: {
                size: 16, 
              },
            },
            ticks: {
              font: {
                size: 12, 
              },
            },
          },
        },
        animation: {
          duration: 1000, 
          easing: 'easeInOutQuad',
        },
      };

      setChartData(chartDataObj);
      setChartOptions(chartOptionsObj);
      setLoadingStatus('success');
    } else {
      setChartData(null);
      setLoadingStatus('noData');
      toast.info('No hay datos disponibles para el año seleccionado.');
    }
  };

  return (
    <main className="historial-servicios-container">
      <ToastContainer />
      <section className="historial-servicios-section">
        <h3 className="historial-servicios-title">Historial de Servicios</h3>
        <div className="historial-pagos-data">
          {/* Selector de año */}
          <div className="select-row">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="select-dropdown"
            >
              <option value="">Seleccione un año</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Gráfica */}
          <div className="chart-container">
            {loadingStatus === 'loading' && <p>Cargando gráfica...</p>}
            {loadingStatus === 'noData' && <p>No se encontraron datos para mostrar.</p>}
            {loadingStatus === 'error' && <p>Error al cargar los datos.</p>}
            {loadingStatus === 'success' && chartData && (
              <Chart type="bar" data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HistorialServicios;
