import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../design/Pagos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_URL } from '../../config/config';

const Pagos = () => {
    const [servicios, setServicios] = useState([]);
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [filteredServicio, setFilteredServicio] = useState(null);
    const [lecturas, setLecturas] = useState([]); // Inicializamos lecturas como un array vacío
    const [selectedServicio, setSelectedServicio] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('lotes.ubicacion');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState(null);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);
    const [selectedYear1, setSelectedYear1] = useState(new Date().getFullYear());
    const [selectedYear2, setSelectedYear2] = useState(new Date().getFullYear() + 1);
    const [years, setYears] = useState([]);
    const [loadingLecturas, setLoadingLecturas] = useState(false);
    const [valorRecibido, setValorRecibido] = useState(0);
    const [conceptoPago, setConceptoPago] = useState('');
    const [cambio, setCambio] = useState('0.00');
    const [montoPagar, setMontoPagar] = useState(0);
    const [showPagoParcialModal, setShowPagoParcialModal] = useState(false);
    const [pagos, setPagos] = useState([]);
    const [totalPago, setTotalPago] = useState(0);
    const [showAdvancePaymentModal, setShowAdvancePaymentModal] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [lecturasPagadas, setLecturasPagadas] = useState([]);
    const [pagosAdelantados, setPagosAdelantados] = useState([]);;
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [totalToPay, setTotalToPay] = useState(0);
    const [discount, setDiscount] = useState(0); // Estado para almacenar el descuento

    useEffect(() => {
        fetchServicios();
        generateYears();
    }, []);

    useEffect(() => {
        // Inicializar los pagos con los datos de lecturas
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
        // Recalcular el total cada vez que los pagos cambien
        const total = pagos.reduce((acc, pago) => {
            const cuota = parseFloat(pago.cuotaPago) || 0;
            const mora = parseFloat(pago.moraPago) || 0;
            const exceso = parseFloat(pago.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);
        setTotalPago(total);
    }, [pagos]);

    const handleInputValidation = (e, max, idlectura, field) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar números y punto decimal
        if (regex.test(value) && parseFloat(value) <= max) {
            setPagos((prevPagos) =>
                prevPagos.map((pago) =>
                    pago.idlectura === idlectura
                        ? { ...pago, [field]: value }
                        : pago
                )
            );
        }
    };

    const getPagoForLectura = (idlectura, field) => {
        const pago = pagos.find((p) => p.idlectura === idlectura); // Buscamos el pago correspondiente
        return pago ? pago[field] || '' : ''; // Si existe el pago, devolvemos el valor del campo
    };
    

    // Función para actualizar la lectura con el pago ingresado
    const updateLecturaPago = (lecturaId, field, value) => {
        setLecturas((prevLecturas) => {
            return prevLecturas.map((lectura) => {
                if (lectura.idlectura === lecturaId) {
                    return { ...lectura, [field]: value };
                }
                return lectura;
            });
        });
    };
    

    // Efecto para recalcular el total cada vez que los valores de pago cambien
    useEffect(() => {
        const total = lecturas.reduce((acc, lectura) => {
            const cuota = parseFloat(lectura.cuotaPago) || 0;
            const mora = parseFloat(lectura.moraPago) || 0;
            const exceso = parseFloat(lectura.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);
        setTotalPago(total);
    }, [lecturas]); // Actualiza el total cada vez que las lecturas cambien


    useEffect(() => {
        filterServicios();
    }, [searchTerm, filterColumn, servicios]);

    useEffect(() => {
        const selectedCount = selectedMonths.length;
    
        if (selectedCount === 2) {
            setSelectedQuickOption(2);
        } else if (selectedCount === 3) {
            setSelectedQuickOption(3);
        } else if (selectedCount === 6) {
            setSelectedQuickOption(6);
        } else if (selectedCount === 12) {
            setSelectedQuickOption(12);
        } else {
            setSelectedQuickOption(null);  // Si el número de meses no coincide con ninguna opción rápida
        }
    }, [selectedMonths]);  

    const fetchLecturas = async (idservicio) => {
        try {
            setLoadingLecturas(true);
            const response = await axios.get(`${API_URL}/lecturas-idservicio/${idservicio}`);
            setLecturas(response.data.lecturas || []);  // Aseguramos que lecturas sea siempre un array
        } catch (error) {
            handleError(error, 'Error al cargar lecturas');
        } finally {
            setLoadingLecturas(false);
        }
    };

    const filterServicio = () => {
        const filtered = servicios.find(servicio => {
            const valueToFilter = filterColumn.includes('clientes.')
                ? servicio.clientes[filterColumn.split('.')[1]]
                : servicio.lotes[filterColumn.split('.')[1]];

            return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (filtered) {
            setFilteredServicio(filtered);
            fetchLecturas(filtered.idservicio); // Cargar lecturas del servicio filtrado
        } else {
            setFilteredServicio(null);
            setLecturas([]); // Limpiar lecturas si no hay servicio seleccionado
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
            console.log('Servicios recibidos:', response.data.servicios);  // Log de los servicios recibidos
            setServicios(response.data.servicios);
            setFilteredServicios(response.data.servicios); // Inicializa con todos los servicios
        } catch (error) {
            handleError(error, 'Error al cargar servicios');
        }
    };

    const fetchLecturasYPagos = async (idservicio) => {
        try {
            console.log('Obteniendo lecturas pagadas y pagos adelantados para el servicio:', idservicio);
            
            // Realizar ambas solicitudes en paralelo con Promise.all
            const [lecturasPagadasRes, pagosAdelantadosRes] = await Promise.all([
                axios.get(`${API_URL}/lecturas-pagadas/${idservicio}`),
                axios.get(`${API_URL}/pagos-adelantados/${idservicio}`)
            ]);
    
            // Verificar y manejar las lecturas pagadas
            if (lecturasPagadasRes.data && lecturasPagadasRes.data.lecturasPagadas) {
                console.log('Lecturas pagadas:', lecturasPagadasRes.data.lecturasPagadas);
                setLecturasPagadas(lecturasPagadasRes.data.lecturasPagadas);
            } else {
                console.log('No se encontraron lecturas pagadas.');
                setLecturasPagadas([]);  // Si no hay lecturas pagadas, se setea como un array vacío
            }
    
            // Verificar y manejar los pagos adelantados
            if (pagosAdelantadosRes.data && pagosAdelantadosRes.data.pagosAdelantados) {
                console.log('Pagos adelantados:', pagosAdelantadosRes.data.pagosAdelantados);
                setPagosAdelantados(pagosAdelantadosRes.data.pagosAdelantados);
            } else {
                console.log('No se encontraron pagos adelantados.');
                setPagosAdelantados([]);  // Si no hay pagos adelantados, se setea como un array vacío
            }
    
            // Abrir el modal de pagos adelantados
            setShowAdvancePaymentModal(true);
    
        } catch (error) {
            console.error('Error al obtener lecturas pagadas o pagos adelantados:', error);
            toast.error('Error al obtener lecturas pagadas o pagos adelantados');
        }
    };
    
    // Función para abrir el modal al hacer clic en "Pagos Adelantados"
    const handleAdvancePaymentClick = async (idservicio) => {
        try {
            // Obtener las lecturas pendientes o pagadas
            await fetchLecturas(idservicio);
    
            // Verificar si hay lecturas pendientes
            if (lecturas.length > 0) {
                toast.error('No se pueden realizar pagos adelantados porque existen lecturas pendientes.');
                return; // Si hay lecturas, no abrimos el modal
            }
    
            // Si no hay lecturas, obtener lecturas pagadas y pagos adelantados
            await fetchLecturasYPagos(idservicio);
    
            // Abrir el modal de pagos adelantados si no hay lecturas pendientes
            setShowAdvancePaymentModal(true);
    
        } catch (error) {
            console.error('Error al obtener lecturas pagadas o pagos adelantados:', error);
            toast.error('Error al obtener lecturas pagadas o pagos adelantados');
        }
    }; 

    const filterServicios = () => {
        let filtered = servicios;

        if (searchTerm) {
            filtered = servicios.filter(servicio => {
                const valueToFilter = filterColumn.includes('clientes.')
                    ? servicio.clientes[filterColumn.split('.')[1]] // Si el filtro es por cliente
                    : servicio.lotes[filterColumn.split('.')[1]]; // Si el filtro es por lote

                return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        console.log('Servicios filtrados:', filtered);  // Log de los servicios filtrados
        setFilteredServicios(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterColumn(e.target.value);
    };

    const handleSearchClick = () => {
        if (!searchTerm.trim()) {
            // Si el campo de búsqueda está vacío, muestra un error con toast
            toast.error("No se ha ingresado ningún dato en el campo de búsqueda");
            return;
        }
        // Si hay datos en el campo de búsqueda, aplica el filtro
        filterServicio();
    };
    
    const handleError = (error, defaultMessage) => {
        const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : defaultMessage;
        toast.error(errorMessage);
    };

    const handleSelectCliente = (e) => {
        const selectedServicioId = parseInt(e.target.value);
        const selectedServicio = servicios.find(serv => serv.idservicio === selectedServicioId);
        setSelectedServicio(selectedServicio);
    };

    const handleReset = () => {
        setFilteredServicio(null);  // Restablece el resultado mostrado a null
        setSearchTerm('');          // Limpia el campo de búsqueda
    };

    const handlePagarTodoClick = () => {
        if (lecturas.length === 0) {
            toast.error("No hay registros para realizar el pago");
            return;
        }
    
        // Ordenar las lecturas por fecha (de más reciente a más antigua)
        const lecturasOrdenadas = [...lecturas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
        // Obtener la suma total de la primera fila (más reciente)
        const montoPagar = parseFloat(lecturasOrdenadas[0].suma_total) || 0;
    
        // Obtener el mes y el año de cada lectura
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Crear un array con los meses y años
        const mesesYaños = lecturasOrdenadas.map(lectura => {
            const mesNombre = meses[lectura.mes - 1]; // Convertimos el número del mes a su nombre en letras
            return `${mesNombre} ${lectura.año}`;  // Devolvemos el mes y el año en formato "Mes Año"
        });
    
        // Unimos los meses y años en una sola cadena, separados por comas
        const mesesTexto = mesesYaños.join(', ');
    
        // Establecer el concepto del pago
        const concepto = `Pago del servicio de agua de los meses de ${mesesTexto}`;
    
        // Actualizar el estado del concepto y el monto a pagar
        setMontoPagar(montoPagar);
        setConceptoPago(concepto);
        setShowModal(true);  // Abre el modal para realizar el pago
    };
    
    const handlePagoParcialPagarClick = () => {
        const totalParcial = pagos.reduce((acc, pago) => {
            const cuota = parseFloat(pago.cuotaPago) || 0;
            const mora = parseFloat(pago.moraPago) || 0;
            const exceso = parseFloat(pago.excesoPago) || 0;
            return acc + cuota + mora + exceso;
        }, 0);

        setMontoPagar(totalParcial); // Establece el monto a pagar para el Pago Parcial
        //setShowPagoParcialModal(false); // Cierra el modal de Pago Parcial
        setShowModal(true); // Abre el modal de pagos
    };

    
    const handleModalClose = () => {
        setShowModal(false);
        setShowAdvancePaymentModal(false);
    };

    const handleValorRecibidoChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar solo números y punto decimal
        if (regex.test(value)) {
            setValorRecibido(value);
            setCambio((parseFloat(value || 0) - montoPagar).toFixed(2));
        }
    };

    const handleConceptoPagoChange = (e) => {
        setConceptoPago(e.target.value);
    };

  
    const handleModalPagarClick = async () => {
        // Validar que se haya ingresado un valor
        if (!valorRecibido || parseFloat(valorRecibido) <= 0) {
            toast.error('Debe ingresar un monto válido para realizar el pago');
            return;
        }
    
        // Validar que el valor recibido sea suficiente para cubrir el monto total a pagar
        if (parseFloat(valorRecibido) < montoPagar) {
            toast.error('El monto ingresado no cubre el total a pagar');
            return;
        }
    
        // Validar que el concepto del pago no esté vacío
        if (!conceptoPago || conceptoPago.trim() === "") {
            toast.error('Debe ingresar un concepto para realizar el pago');
            return;
        }
    
        setLoadingPayment(true);  // Bloquear el botón y mostrar "Pagando..."
        let montoDisponible = parseFloat(valorRecibido);
        const lecturasPorPagar = [...lecturas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenar por fecha
    
        for (let lectura of lecturasPorPagar) {
            const cuota = parseFloat(lectura.cuota) || 0;
            const mora = parseFloat(lectura.monto_mora) || 0;
            const exceso = parseFloat(lectura.monto_exceso) || 0;
            const totalLectura = cuota + mora + exceso;
    
            if (montoDisponible < totalLectura) {
                break; // Si el monto disponible no cubre la siguiente lectura, detenemos el proceso
            }
    
            try {
                // Crear el pago para la lectura actual
                await axios.post(`${API_URL}/pagos`, {
                    idlectura: lectura.idlectura,
                    mes: lectura.mes,
                    año: lectura.año,
                    fecha: new Date(),
                    concepto: conceptoPago,  // Usamos el concepto ingresado
                    cuota: cuota,
                    mora: mora,
                    exceso: exceso,
                    monto_exceso: exceso,
                    total: totalLectura
                });
    
                // Actualizar la lectura marcándola como pagada
                await axios.put(`${API_URL}/lectura-pagada/${lectura.idlectura}`, {
                    lectura_pagada: true,
                    mora_pagada: true,
                    exceso_pagado: true
                });
    
                // Descontar el monto pagado del monto disponible
                montoDisponible -= totalLectura;
                handleReset();
            } catch (error) {
                console.error('Error al procesar el pago:', error);
                toast.error('Error al procesar el pago');
                setLoadingPayment(false);  // Desbloquear el botón en caso de error
                return;
            }
        }
    
        // Si llegamos aquí, el pago se realizó con éxito
        toast.success('Pago realizado con éxito');
    
        // Volver a buscar las lecturas después del pago
        await fetchLecturas(selectedServicio.idservicio);
    
        setLoadingPayment(false);  // Desbloquear el botón
        setShowModal(false);  // Cerrar el modal
    };  

    useEffect(() => {
        if (showModal) {
            // Inicializa el valor recibido como vacío cuando se abre el modal
            setValorRecibido('');
        }
    }, [showModal]);

    // Asegúrate de que lecturas sea un array antes de usar .slice()
    const indexOfLastLectura = currentPage * rowsPerPage;
    const indexOfFirstLectura = indexOfLastLectura - rowsPerPage;
    const currentLecturas = Array.isArray(lecturas) ? lecturas.slice(indexOfFirstLectura, indexOfLastLectura) : [];

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePagoParcialClick = () => {
        if (lecturas.length === 0) {
            toast.error("No hay registros para realizar un pago parcial");
            return;
        }
        setShowPagoParcialModal(true);
    };
    
    const handlePagoParcialModalClose = () => {
        setShowPagoParcialModal(false);
    }; 

    const isMonthPaid = (year, month) => {
        // Busca si una lectura pagada ya existe para ese año y mes
        return lecturasPagadas.some(lectura => lectura.año === year && lectura.mes === month);
    };

    const isAdvancePaymentDone = (year, month) => {
        // Busca si un pago adelantado ya existe para ese año y mes
        return pagosAdelantados.some(pago => pago.año === year && pago.mes === month);
    };

    const handleYearChangeLeft = (newYear) => {
        setSelectedYear1(newYear);
        setSelectedYear2(newYear + 1); // Sincronizamos el año derecho con +1
    };
    
    // Función para manejar el cambio de año en el select de la derecha
    const handleYearChangeRight = (newYear) => {
        setSelectedYear2(newYear);
        setSelectedYear1(newYear - 1); // Sincronizamos el año izquierdo con -1
    };
    
    const isMonthSelected = (year, month) => {
        return selectedMonths.some(selected => selected.year === year && selected.month === month);
    };
    
    const handleMonthSelect = (year, month, cuota) => {
        const monthKey = `${year}-${month}`;
        
        if (selectedMonths.includes(monthKey)) {
            // Si el mes ya está seleccionado, lo desmarcamos
            const updatedMonths = selectedMonths.filter(m => m !== monthKey);
            setSelectedMonths(updatedMonths);
            setTotalToPay(prevTotal => prevTotal - cuota);
        } else {
            // Si el mes no está seleccionado, lo agregamos
            setSelectedMonths([...selectedMonths, monthKey]);
            setTotalToPay(prevTotal => prevTotal + cuota);
        }
    
        // Recalcular el descuento después de seleccionar/deseleccionar meses
        const updatedCount = selectedMonths.length + (selectedMonths.includes(monthKey) ? -1 : 1);
        const newDiscount = Math.floor(updatedCount / 12) * parseFloat(filteredServicio.configuracion.cuota);
        setDiscount(newDiscount);
    };
    
    

    const getCuota = () => {
        // Obtener la cuota directamente desde el servicio filtrado
        return filteredServicio && filteredServicio.configuracion && filteredServicio.configuracion.cuota
            ? parseFloat(filteredServicio.configuracion.cuota)
            : 0;
    };
    

    const getLastPaidMonth = () => {
        // Encuentra la última lectura pagada (la de mayor año y mes)
        if (lecturasPagadas.length === 0) return null;
    
        // Ordenar lecturas pagadas por año y mes de forma descendente
        const sortedLecturas = [...lecturasPagadas].sort((a, b) => {
            if (a.año !== b.año) return b.año - a.año;
            return b.mes - a.mes;
        });
    
        return { year: sortedLecturas[0].año, month: sortedLecturas[0].mes };
    };
    
    const isMonthSelectable = (year, month) => {
        const lastPaidMonth = getLastPaidMonth();
    
        // Si no hay lecturas pagadas, todos los meses son seleccionables
        if (!lastPaidMonth) return true;
    
        // Si el año es menor al año de la última lectura pagada, deshabilitamos
        if (year < lastPaidMonth.year) return false;
    
        // Si el año es el mismo, deshabilitamos meses anteriores al último pagado
        if (year === lastPaidMonth.year && month <= lastPaidMonth.month) return false;
    
        // Si es un mes posterior, habilitamos
        return true;
    };
    
    const handleQuickMonthSelect = (months) => {
        const lastPaidMonth = getLastPaidMonth(); // Obtener el último mes pagado
        const newSelectedMonths = [];
        let totalCuota = 0;
    
        for (let i = 1; i <= months; i++) {
            const nextMonth = addMonths(lastPaidMonth, i); // Función para agregar un mes al último pagado
            const monthKey = `${nextMonth.year}-${nextMonth.month}`;
            newSelectedMonths.push(monthKey);
            totalCuota += parseFloat(filteredServicio.configuracion.cuota);
        }
    
        setSelectedMonths(newSelectedMonths);
        setTotalToPay(totalCuota);
        setSelectedQuickOption(months); // Sincronizar con la selección rápida
    
        // Calcular el descuento en función de los meses seleccionados
        const newDiscount = Math.floor(months / 12) * parseFloat(filteredServicio.configuracion.cuota);
        setDiscount(newDiscount);
    };
    
    
    
    const addMonths = (lastPaidMonth, i) => {
        const newMonth = lastPaidMonth.month + i;
        const newYear = lastPaidMonth.year + Math.floor((lastPaidMonth.month + i - 1) / 12);
        return { year: newYear, month: (newMonth - 1) % 12 + 1 };
    };

    const calculateTotal = (selectedMonths) => {
        let total = 0;
        selectedMonths.forEach(monthYear => {
            const [year, month] = monthYear.split('-').map(Number);
            total += parseFloat(filteredServicio.configuracion.cuota); // Obtener la cuota de la configuración del servicio
        });
        return total;
    };   
    
    const clearSelectedMonths = () => {
        setSelectedQuickOption('clear'); // Establecer 'clear' como la opción seleccionada
        setSelectedMonths([]);           // Limpiar los meses seleccionados
        setTotalToPay(0);                // Reiniciar el total a pagar
    };
    
    const [selectedQuickOption, setSelectedQuickOption] = useState(null);
        
    const [showModalPagoAdelantado, setShowModalPagoAdelantado] = useState(false);

    const validateMonthSelection = () => {
        // Si no hay meses seleccionados
        if (selectedMonths.length === 0) {
            toast.error('No se ha seleccionado ningún mes para pagar.');
            return false;
        }
    
        // Obtener el último mes pagado
        const lastPaidMonth = getLastPaidMonth();
    
        // Convertir los meses seleccionados en un formato manejable y ordenarlos
        const sortedSelectedMonths = selectedMonths
            .map(monthStr => {
                const [year, month] = monthStr.split('-').map(Number);
                return { year, month };
            })
            .sort((a, b) => (a.year - b.year) || (a.month - b.month));
    
        const firstSelectedMonth = sortedSelectedMonths[0];
    
        // Verificar si hay un hueco de meses entre el último mes pagado y el primero seleccionado
        if (!areConsecutive(lastPaidMonth, firstSelectedMonth)) {
            toast.error('Hay un mes intermedio sin seleccionar. Todos los meses deben ser consecutivos al último mes pagado.');
            return false;
        }
    
        // Verificar si los meses seleccionados son consecutivos entre sí
        for (let i = 1; i < sortedSelectedMonths.length; i++) {
            const currentMonth = sortedSelectedMonths[i];
            const previousMonth = sortedSelectedMonths[i - 1];
            
            if (!areConsecutive(previousMonth, currentMonth)) {
                toast.error('Los meses seleccionados no son consecutivos. Por favor selecciona meses consecutivos.');
                return false;
            }
        }
    
        return true;
    };
    
    // Función para comprobar si los meses son consecutivos
    const areConsecutive = (prevMonth, nextMonth) => {
        const { year: prevYear, month: prevMonthNum } = prevMonth;
        const { year: nextYear, month: nextMonthNum } = nextMonth;
    
        if (nextYear === prevYear) {
            return nextMonthNum === prevMonthNum + 1; // Mes siguiente en el mismo año
        } else if (nextYear === prevYear + 1) {
            return prevMonthNum === 12 && nextMonthNum === 1; // De diciembre a enero del año siguiente
        }
        return false;
    };
    
    
    const handleModalPagoClick = () => {
        // Validar la selección de los meses
        if (!validateMonthSelection()) {
            return; // Si la validación no pasa, no continúa el proceso
        }
    
        // Si la validación es correcta, calculamos el total menos el descuento
        const totalConDescuento = totalToPay - discount;
    
        // Pasamos el monto al modal de pago adelantado y lo mostramos
        openAdvancePaymentModal(totalConDescuento);
    };
    
    // Función para abrir el modal de pagos adelantados
    const openAdvancePaymentModal = (totalConDescuento) => {
        setMontoPagar(totalConDescuento);  // Establece el monto con el descuento aplicado
        setShowModalPagoAdelantado(true);
    };
    
    const handlePagoModalClose = () => {
        setShowModalPagoAdelantado(false); 
    };
    
    const handlePagoModalClick = async () => {
        // Validar que se haya ingresado un valor
        if (!valorRecibido || parseFloat(valorRecibido) <= 0) {
            toast.error('Debe ingresar un monto válido para realizar el pago');
            return;
        }
    
        // Validar que el valor recibido sea suficiente para cubrir el monto total a pagar
        if (parseFloat(valorRecibido) < totalToPay) {
            toast.error('El monto ingresado no cubre el total a pagar');
            return;
        }
    
        // Validar que el concepto del pago no esté vacío
        if (!conceptoPago || conceptoPago.trim() === "") {
            toast.error('Debe ingresar un concepto para realizar el pago');
            return;
        }
    
        setLoadingPayment(true);  // Bloquear el botón y mostrar "Pagando..."
    
        try {
            // Iterar sobre los meses seleccionados
            for (let i = 0; i < selectedMonths.length; i++) {
                const [year, month] = selectedMonths[i].split('-').map(Number);
                const isLastMonth = i === selectedMonths.length - 1; // Verificar si es el último mes seleccionado
    
                // Si es el último mes, aplicar el descuento
                const cuota = getCuota();
                const descuentoAplicado = isLastMonth ? discount : 0;
                const totalAPagar = cuota - descuentoAplicado;
    
                // Crear el pago adelantado para el mes seleccionado
                await axios.post(`${API_URL}/pagos-adelantados`, {
                    idservicio: filteredServicio.idservicio,
                    mes: month,
                    año: year,
                    fecha: new Date(),
                    concepto: conceptoPago,
                    cuota: cuota,
                    descuento: descuentoAplicado,
                    total: totalAPagar
                });
            }
    
            toast.success('Pagos adelantados registrados con éxito');
    
            // Actualizar el estado o realizar cualquier acción posterior al pago
            handleReset();
            setShowModalPagoAdelantado(false);
    
        } catch (error) {
            console.error('Error al registrar los pagos adelantados:', error);
            toast.error('Error al registrar los pagos adelantados');
        } finally {
            setLoadingPayment(false);  // Desbloquear el botón
        }
    };
    

    return (
        <main>
            <ToastContainer />
            <section className="pagos-section">
                <h1 className="pagos-title">Gestión de Pagos</h1>
                <div className="pagos-busqueda">
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
                
                <div className="pagos-resultados">
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
                        <p>No se ha seleccionado ningún servicio.</p>  // Texto inicial si no hay selección
                    )}
                </div>
                
                {filteredServicio ? (
                    <div>
                        <div className="pagos-titulo-tabla">
                            <h2>Lecturas del servicio: {filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</h2>
                            <h2>Lote: {filteredServicio.lotes.ubicacion}</h2>
                        </div>
                        <div className="pagos-lectura-buttons">
                            <button onClick={handlePagarTodoClick}>Pagar Todo</button>
                            <button onClick={handlePagoParcialClick}>Pago Parcial</button>
                            <button onClick={() => handleAdvancePaymentClick(filteredServicio.idservicio)}>
                                Pagos Adelantados
                            </button>

                        </div>
                        {/* Mostrar lecturas en una tabla */}
                        <div className="lecturas-table">
                            <table className="lecturas-data-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Mes</th>
                                        <th>Lectura</th>
                                        <th>Cuota</th>
                                        <th>% Mora</th>
                                        <th>Monto Mora</th>
                                        <th>Total Mensual</th>
                                        <th>Monto Acumulado</th>
                                        <th>Exceso</th>
                                        <th>Monto Exceso</th>
                                        <th>Total Excesos</th>
                                        <th>Suma Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingLecturas ? (
                                        <tr>
                                            <td colSpan="12">Cargando lecturas...</td>
                                        </tr>
                                    ) : currentLecturas.length > 0 ? (
                                        currentLecturas.map((lectura) => {
                                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                            const mesNombre = meses[lectura.mes - 1];
                                            const porcentajeMora = `${(lectura.porcentaje_acumulado * 100).toFixed(0)}%`;
                                            return (
                                                <tr key={lectura.idlectura}>
                                                    <td>{lectura.año}</td>
                                                    <td>{mesNombre}</td>
                                                    <td>{lectura.lectura}</td>
                                                    <td>{lectura.cuota}</td>
                                                    <td>{porcentajeMora}</td>
                                                    <td>{lectura.monto_mora}</td>
                                                    <td>{lectura.cuota_mensual}</td>
                                                    <td>{lectura.monto_acumulado}</td>
                                                    <td>{lectura.exceso}</td>
                                                    <td>{lectura.monto_exceso}</td>
                                                    <td>{lectura.total}</td>
                                                    <td>{lectura.suma_total}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="12">No se encontraron lecturas para este servicio.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            <div className="pagination">
                                <button onClick={() => paginate(1)} disabled={currentPage === 1}>Inicio</button>
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                                {Array.from({ length: Math.ceil(lecturas.length / rowsPerPage) }, (_, index) => (
                                    <button key={index + 1} onClick={() => paginate(index + 1)}>
                                        {index + 1}
                                    </button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(lecturas.length / rowsPerPage)}>Siguiente</button>
                                <button onClick={() => paginate(Math.ceil(lecturas.length / rowsPerPage))} disabled={currentPage === Math.ceil(lecturas.length / rowsPerPage)}>Último</button>
                                <select className="rows-per-page" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>

                    </div>
                )                  
                : (
                    <p></p>
                )
                }        
            </section>

            {/* Modal para Pagar Todo */}
            
            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <h2>Pagos</h2>
                            
                            <label>Monto a Pagar:</label>
                            <p>Q.{montoPagar.toFixed(2)}</p> {/* Muestra el monto total a pagar */}

                            <label>Valor Recibido:</label>
                            <input
                                type="text"
                                value={valorRecibido}
                                onChange={handleValorRecibidoChange}
                                placeholder="Q.0.00"
                                className="valor"
                                inputMode="decimal"
                            />

                            <label>Cambio:</label>
                            <p className="cambio">Q.{cambio}</p> {/* Muestra el cambio calculado */}

                            <label>Concepto del Pago:</label>
                            <input
                                type="text"
                                value={conceptoPago}
                                onChange={handleConceptoPagoChange}
                                placeholder="Ingrese el concepto del pago"
                                className="concepto"
                            />

                            <div className="modal-buttons">
                            <button 
                                onClick={handleModalPagarClick} 
                                disabled={loadingPayment} // Deshabilitar mientras se realiza el pago
                            >
                                {loadingPayment ? 'Pagando...' : 'Pagar'}
                            </button>
                                <button onClick={handleModalClose}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPagoParcialModal && (
                <div className="modal-overlay pago-parcial-modal" onClick={handlePagoParcialModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Pago Parcial</h2>
                        {filteredServicio && (
                            <div className="cliente-info">
                                <p><strong>Cliente:</strong> {filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</p>
                                <p><strong>Lote:</strong> {filteredServicio.lotes.ubicacion}</p>
                                <p className="total"><strong>Total: Q. {totalPago.toFixed(2)}</strong></p>
                            </div>
                        )}

                        {lecturas.length === 0 ? (
                            <p>No se encontraron registros para realizar un pago parcial.</p>
                        ) : (
                            <div className="pagoparcial-lecturas-table">
                                <table className="lecturas-data-table">
                                    <thead>
                                        <tr>
                                            <th>Año</th>
                                            <th>Mes</th>
                                            <th>Lectura</th>
                                            <th>Exceso</th>
                                            <th>Cuota</th>
                                            <th>Monto Mora</th>
                                            <th>Monto Exceso</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lecturas.map((lectura) => {
                                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                            const mesNombre = meses[lectura.mes - 1];

                                            const cuotaPago = parseFloat(getPagoForLectura(lectura.idlectura, 'cuotaPago')) || 0;
                                            const moraPago = parseFloat(getPagoForLectura(lectura.idlectura, 'moraPago')) || 0;
                                            const excesoPago = parseFloat(getPagoForLectura(lectura.idlectura, 'excesoPago')) || 0;
                                            const totalFila = cuotaPago + moraPago + excesoPago;

                                            return (
                                                <tr key={lectura.idlectura}>
                                                    <td>{lectura.año}</td>
                                                    <td>{mesNombre}</td>
                                                    <td>{lectura.lectura}</td>
                                                    <td>{lectura.exceso}</td>

                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.cuota}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Cuota"
                                                                value={getPagoForLectura(lectura.idlectura, 'cuotaPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.cuota, lectura.idlectura, 'cuotaPago')}
                                                                readOnly={lectura.cuota === 0}
                                                                style={{ backgroundColor: lectura.cuota === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.monto_mora}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Mora"
                                                                value={getPagoForLectura(lectura.idlectura, 'moraPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.monto_mora, lectura.idlectura, 'moraPago')}
                                                                readOnly={lectura.monto_mora === 0}
                                                                style={{ backgroundColor: lectura.monto_mora === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.monto_exceso}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Exceso"
                                                                value={getPagoForLectura(lectura.idlectura, 'excesoPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.monto_exceso, lectura.idlectura, 'excesoPago')}
                                                                readOnly={lectura.monto_exceso === 0}
                                                                style={{ backgroundColor: lectura.monto_exceso === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td>{totalFila.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button onClick={handlePagoParcialPagarClick}>Pagar</button>
                            <button onClick={handlePagoParcialModalClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showAdvancePaymentModal && (
                <div className="modal-overlay-pagos-adelantados" onClick={handleModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Pagos Adelantados</h2>
                        {filteredServicio && (
                            <div className="title">
                                <h2><strong>Cliente:</strong> {filteredServicio.clientes.nombre} {filteredServicio.clientes.apellidos}</h2>
                                <h2><strong>Lote:</strong> {filteredServicio.lotes.ubicacion}</h2>
                                <h1><strong>Total: </strong>Q.{totalToPay.toFixed(2)}</h1> {/* Mostrar el total acumulado */}
                            </div>
                        )}
                        <div className="pagos-mes">
                            {/* Año Anterior */}
                            <div className="meses">
                                <h1>Año Anterior</h1>
                                <select value={selectedYear1} onChange={(e) => handleYearChangeLeft(parseInt(e.target.value))}>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <div className="check-meses">
                                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes, index) => (
                                        <div key={index} className="checkbox-mes">
                                            <p>{mes}</p>
                                            <input
                                                type="checkbox"
                                                checked={isMonthPaid(selectedYear1, index + 1) || selectedMonths.includes(`${selectedYear1}-${index + 1}`)}
                                                disabled={!isMonthSelectable(selectedYear1, index + 1)}
                                                onChange={() => handleMonthSelect(selectedYear1, index + 1, getCuota(selectedYear1, index + 1))}
                                                style={{
                                                    backgroundColor: isMonthPaid(selectedYear1, index + 1) ? 'grey' : selectedMonths.includes(`${selectedYear1}-${index + 1}`) ? 'green' : 'white'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Año Siguiente */}
                            <div className="meses">
                                <h1>Año Siguiente</h1>
                                <select value={selectedYear2} onChange={(e) => handleYearChangeRight(parseInt(e.target.value))}>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <div className="check-meses">
                                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes, index) => (
                                        <div key={index} className="checkbox-mes">
                                            <p>{mes}</p>
                                            <input
                                                type="checkbox"
                                                checked={isMonthPaid(selectedYear2, index + 1) || selectedMonths.includes(`${selectedYear2}-${index + 1}`)}
                                                disabled={!isMonthSelectable(selectedYear2, index + 1)}
                                                onChange={() => handleMonthSelect(selectedYear2, index + 1, getCuota(selectedYear2, index + 1))}
                                                style={{
                                                    backgroundColor: isMonthPaid(selectedYear2, index + 1) ? 'grey' : selectedMonths.includes(`${selectedYear2}-${index + 1}`) ? 'green' : 'white'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Botones para seleccionar automáticamente los meses */}
                        <div className="month-selection-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedQuickOption === 2}
                                    onChange={() => handleQuickMonthSelect(2)}
                                />
                                2 meses
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedQuickOption === 3}
                                    onChange={() => handleQuickMonthSelect(3)}
                                />
                                3 meses
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedQuickOption === 6}
                                    onChange={() => handleQuickMonthSelect(6)}
                                />
                                6 meses
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedQuickOption === 12}
                                    onChange={() => handleQuickMonthSelect(12)}
                                />
                                12 meses
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedQuickOption === 'clear'} // Queda marcado si 'clear' está seleccionado
                                    onChange={clearSelectedMonths}           // Al seleccionar, limpia todo
                                />
                                Borrar todo
                            </label>
                            <label>Descuento: Q.{discount.toFixed(2)}</label> {/* Mostrar el descuento acumulado */}
                        </div>
                        <div className="modal-buttons">
                        <button onClick={handleModalPagoClick}>Pagar</button> {/* Cambia a handleAdvancePaymentClick */}
                        <button onClick={handleModalClose}>Cerrar</button>
                    </div>
                    </div>
                </div>
            )}

            {showModalPagoAdelantado && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <h2>Pagos Adelantados</h2>
                            {/* Formulario de pago para pagos adelantados */}
                            <label>Monto a Pagar:</label>
                            <p>Q.{(totalToPay - discount).toFixed(2)}</p> {/* Muestra el monto total a pagar con el descuento aplicado */}

                            <label>Valor Recibido:</label>
                            <input
                                type="text"
                                value={valorRecibido}
                                onChange={handleValorRecibidoChange}
                                placeholder="Q.0.00"
                                className="valor"
                                inputMode="decimal"
                            />

                            <label>Cambio:</label>
                            <p className="cambio">Q.{cambio}</p> {/* Muestra el cambio calculado */}

                            <label>Concepto del Pago:</label>
                            <input
                                type="text"
                                value={conceptoPago}
                                onChange={handleConceptoPagoChange}
                                placeholder="Pago de meses adelantados"
                                className="concepto"
                            />

                            <div className="modal-buttons">
                                <button 
                                    onClick={handlePagoModalClick} 
                                    disabled={loadingPayment} // Deshabilitar mientras se realiza el pago
                                >
                                    {loadingPayment ? 'Pagando...' : 'Pagar'}
                                </button>
                                <button onClick={handlePagoModalClose}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



        </main>
    );
};

export default Pagos;