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
    const [valorRecibidoAdelantado, setValorRecibidoAdelantado] = useState(0);
    const [valorRecibidoParcial, setValorRecibidoParcial] = useState(0);
    const [conceptoPago, setConceptoPago] = useState('');
    const [conceptoPagoAdelantado, setConceptoPagoAdelantado] = useState('');
    const [conceptoPagoParcial, setConceptoPagoParcial] = useState('');
    const [cambio, setCambio] = useState('0.00');
    const [cambioAdelantado, setCambioAdelantado] = useState('0.00');
    const [cambioParcial, setCambioParcial] = useState('0.00');
    const [montoPagar, setMontoPagar] = useState(0);
    const [montoPagarAdelantado, setMontoPagarAdelantado] = useState(0);
    const [montoPagarParcial, setMontoPagarParcial] = useState(0);
    const [showPagoParcialModal, setShowPagoParcialModal] = useState(false);
    const [pagos, setPagos] = useState([]);
    const [totalPago, setTotalPago] = useState(0);
    const [showAdvancePaymentModal, setShowAdvancePaymentModal] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [lecturasPagadas, setLecturasPagadas] = useState([]);
    const [pagosAdelantados, setPagosAdelantados] = useState([]);;
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [totalToPay, setTotalToPay] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [showModalPagoParcial, setShowModalPagoParcial] = useState(false);

    useEffect(() => {
        fetchServicios();
        generateYears();
    }, []);

    useEffect(() => {
        if (showModalPagoParcial) {
            // Limpiar el campo cambio y otros al abrir el modal
            setCambioParcial(0);
            setValorRecibidoParcial(''); // Limpiar el campo valor recibido
            setConceptoPago(''); // Limpiar el concepto
        }
    }, [showModalPagoParcial]);

    const generateConceptoPago = () => {
        const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
        // Ordenar los meses seleccionados en orden cronológico
        const sortedSelectedMonths = selectedMonths
            .map(monthStr => {
                const [year, month] = monthStr.split('-').map(Number);
                return { year, month };
            })
            .sort((a, b) => (a.year - b.year) || (a.month - b.month)); // Ordenar por año y mes
    
        // Crear el concepto concatenando los meses y años
        const conceptoPago = sortedSelectedMonths
            .map(({ year, month }) => `${mesesNombres[month - 1]} ${year}`) // Formatear "Mes Año"
            .join(', '); // Unir con comas
    
        return `Pagos adelantados para ${conceptoPago}`;
    };
    
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
        let value = e.target.value;
    
        // Expresión regular para validar números decimales
        const regex = /^\d*\.?\d{0,2}$/; // Limitar a 2 decimales
    
        // Si el valor es solo un punto ".", lo convertimos en "0."
        if (value === '.') {
            value = '0.';
        }
    
        // Permitir que el campo quede vacío o validar número decimal con límite máximo
        if (value === '' || (regex.test(value) && parseFloat(value) <= max)) {
            setPagos((prevPagos) =>
                prevPagos.map((pago) =>
                    pago.idlectura === idlectura
                        ? { ...pago, [field]: value }
                        : pago
                )
            );
    
            // Calcular la nueva mora cada vez que se escribe algo en el campo de cuota
            const lectura = lecturas.find((l) => l.idlectura === idlectura);
            if (lectura) {
                const nuevaMora = calcularNuevaMora(lectura.cuota, parseFloat(value) || 0, lectura.porcentaje_acumulado);
                setPagos((prevPagos) =>
                    prevPagos.map((pago) =>
                        pago.idlectura === idlectura
                            ? { ...pago, nuevaMora }  // Actualizamos la nueva mora en el estado
                            : pago
                    )
                );
            }
        }
    };
    
    const getPagoForLectura = (idlectura, field) => {
        const pago = pagos.find((p) => p.idlectura === idlectura); // Buscamos el pago correspondiente
        return pago ? pago[field] || '' : ''; // Si existe el pago, devolvemos el valor del campo
    };
    
    const handleModalPagoParcialClose = () => {
        setShowModalPagoParcial(false);
        setCambioParcial(0); // Limpiar el campo cambio
        setValorRecibidoParcial(''); // Limpiar el campo valor recibido
        setConceptoPago(''); // Limpiar el concepto
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

    const filterServicio = async () => {
        const filtered = servicios.find(servicio => {
            const valueToFilter = filterColumn.includes('clientes.')
                ? servicio.clientes[filterColumn.split('.')[1]]
                : servicio.lotes[filterColumn.split('.')[1]];
    
            return valueToFilter?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    
        // Limpiar las lecturas antes de cargar las nuevas
        setLecturas([]); 
    
        if (filtered) {
            setFilteredServicio(filtered);
            await fetchLecturas(filtered.idservicio); // Cargar lecturas del servicio filtrado
        } else {
            setFilteredServicio(null);
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
            const [lecturasPagadasRes, pagosAdelantadosRes] = await Promise.allSettled([
                axios.get(`${API_URL}/lecturas-pagadas/${idservicio}`),
                axios.get(`${API_URL}/pagos-adelantados/${idservicio}`)
            ]);
    
            // Manejo de lecturas pagadas
            if (lecturasPagadasRes.status === 'fulfilled' && lecturasPagadasRes.value.status === 200) {
                setLecturasPagadas(lecturasPagadasRes.value.data.lecturasPagadas || []);
                console.log('Lecturas pagadas:', lecturasPagadasRes.value.data.lecturasPagadas);
            } else if (lecturasPagadasRes.status === 'fulfilled' && lecturasPagadasRes.value.status === 404) {
                // No hay lecturas pagadas, lo manejamos como una condición esperada
                console.log('No se encontraron lecturas pagadas.');
                setLecturasPagadas([]);  // Establecemos un array vacío si no hay lecturas pagadas
            } else {
                console.error('Error al obtener lecturas pagadas:', lecturasPagadasRes.reason);
            }
    
            // Manejo de pagos adelantados
            if (pagosAdelantadosRes.status === 'fulfilled' && pagosAdelantadosRes.value.status === 200) {
                setPagosAdelantados(pagosAdelantadosRes.value.data.pagosAdelantados || []);
                console.log('Pagos adelantados:', pagosAdelantadosRes.value.data.pagosAdelantados);
            } else if (pagosAdelantadosRes.status === 'fulfilled' && pagosAdelantadosRes.value.status === 404) {
                // No hay pagos adelantados, lo manejamos como una condición esperada
                console.log('No se encontraron pagos adelantados.');
                setPagosAdelantados([]);  // Establecemos un array vacío si no hay pagos adelantados
            } else {
                console.error('Error al obtener pagos adelantados:', pagosAdelantadosRes.reason);
            }
    
            // Abrir el modal de pagos adelantados si no hay errores
            setShowAdvancePaymentModal(true);
    
        } catch (error) {
            console.error('Error al obtener lecturas pagadas o pagos adelantados:', error);
            toast.error('Error al obtener lecturas pagadas o pagos adelantados');
        }
    };
    
    const handlePagoExitoso = async () => {
        try {
            // Hacer la llamada a la API para obtener las lecturas actualizadas
            const response = await axios.get(`${API_URL}/lecturas-idservicio/${selectedServicio.idservicio}`);
            setLecturas(response.data.lecturas || []);
        } catch (error) {
            console.error('Error al actualizar lecturas:', error);
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

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) {
            toast.error("No se ha ingresado ningún dato en el campo de búsqueda");
            return;
        }
    
        // Limpiar lecturas, pagos y cualquier dato anterior
        setLecturas([]);
        setPagos([]);
        setTotalPago(0);
        setFilteredServicio(null);
    
        await filterServicio(); // Llamar a la función de filtro
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
    
        // Obtener todas las lecturas visibles en la tabla, usando `currentLecturas` que ya tienes paginadas
        const lecturasMostradas = currentLecturas;  // Aquí usas las lecturas actualmente visibles en la tabla
    
        // Si no hay lecturas visibles, salimos
        if (lecturasMostradas.length === 0) {
            toast.error("No hay lecturas visibles para realizar el pago");
            return;
        }
    
        // Obtener la suma total de la primera fila visible (más reciente) 
        const montoPagar = parseFloat(lecturasMostradas[0].suma_total) || 0;  // Primera fila de la tabla visible
    
        // Generar un array de textos como "Octubre 2024", "Noviembre 2024", etc., desde la más antigua a la más nueva
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
        // Revertimos el array de lecturas mostradas para tener de más antiguo a más nuevo
        const mesesTexto = [...lecturasMostradas].reverse().map(lectura => {
            const mesNombre = meses[lectura.mes - 1];
            return `${mesNombre} ${lectura.año}`;
        });
    
        // Concatenar los meses y años en una sola cadena, separados por comas
        const concepto = `Pago del servicio de agua del mes de ${mesesTexto.join(', ')}`;
    
        // Actualizar el estado del concepto y el monto a pagar
        setMontoPagar(montoPagar);  // La cantidad de la primera fila visible (más nueva)
        setConceptoPago(concepto);   // Concepto con los meses de más antiguo a más nuevo
        setShowModal(true);          // Abre el modal para realizar el pago
    };
    
    const generateConceptoPagoParcial = () => {
        const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Filtrar las lecturas donde los campos `cuota`, `monto_mora`, o `monto_exceso` sean distintos de cero
        const lecturasConPagos = lecturas.filter(lectura => 
            parseFloat(lectura.cuota) > 0 || 
            parseFloat(lectura.monto_mora) > 0 || 
            parseFloat(lectura.monto_exceso) > 0
        );
    
        // Crear el concepto concatenando los meses y años de esas lecturas
        const conceptoPago = lecturasConPagos
            .map(lectura => `${mesesNombres[lectura.mes - 1]} ${lectura.año}`) // Formatear "Mes Año"
            .join(', '); // Unir con comas
        
        return `Pagos parciales para ${conceptoPago}`;
    };    
    
    // Función para calcular la nueva mora
    // Función para calcular la nueva mora
    const calcularNuevaMora = (cuotaOriginal, cuotaIngresada, porcentajeAcumulado) => {
        const nuevaCuota = cuotaOriginal - cuotaIngresada;
        const moraBase = nuevaCuota * (porcentajeAcumulado / 100);
        const iva = moraBase * 0.12;
        return moraBase + iva;
    };

    const actualizarLectura = async (lectura, cuotaIngresada, moraIngresada, excesoIngresado, montoAcumulado) => {
        // Verificar si el exceso ha sido pagado completamente
        let nuevoExceso = lectura.monto_exceso - excesoIngresado;
        if (nuevoExceso < 0) nuevoExceso = 0; // Asegurarse de que el exceso nunca sea negativo
    
        let excesoPagado = nuevoExceso === 0; // Solo marcar como pagado si el nuevo exceso es exactamente 0
    
        // Calcular la nueva mora usando la función calcularNuevaMora
        const nuevaMora = calcularNuevaMora(lectura.cuota, cuotaIngresada, lectura.porcentaje_acumulado);
    
        // Calcular el valor restante para cuota
        const cuotaRestante = lectura.cuota - cuotaIngresada;
        const moraRestante = nuevaMora; // Ahora usamos la nueva mora calculada
    
        // Asegurar que los valores de cuota y mora restantes no sean negativos
        let nuevaCuota = cuotaRestante > 0 ? cuotaRestante : 0;
    
        // Cálculo de totalMensual (si no lo tienes calculado previamente, lo puedes agregar aquí)
        const totalMensual = parseFloat(lectura.cuota_mensual) - cuotaIngresada - moraIngresada;
    
        // Asegúrate de que suma_total se calcule correctamente y no concatenando valores como strings
        const sumaTotal = parseFloat(totalMensual) + nuevoExceso + nuevaMora; // Incluimos la nueva mora en suma total
    
        // Asignar mora_pagada dependiendo del valor de nuevaMora
        const moraPagada = nuevaMora === 0;
    
        // Construir el cuerpo de la actualización por lectura
        const lecturaParaActualizar = {
            monto_mora: nuevaMora, // Nueva mora recalculada
            monto_acumulado: montoAcumulado, // Monto acumulado
            cuota: nuevaCuota, // Aquí se guarda la cuota restante, no la ingresada
            cuota_mensual: totalMensual, // Aquí guardamos el totalMensual calculado
            monto_exceso: nuevoExceso, // Nuevo exceso calculado
            mora_pagada: moraPagada, // Si la nueva mora es 0, entonces mora_pagada = true
            exceso_pagado: excesoPagado, // True si el exceso es exactamente 0
            porcentaje_acumulado: nuevaCuota === 0 ? 0 : lectura.porcentaje_acumulado,
            total: cuotaIngresada + moraIngresada + excesoIngresado, // Suma de lo que se pagó en esta transacción
            suma_total: sumaTotal, // Aquí se asegura que el valor es un número válido
            lectura_pagada: nuevaCuota === 0 // Marcar como pagada si la cuota fue completamente cubierta
        };
    
        // Realizar la solicitud PUT para actualizar la lectura
        await axios.put(`${API_URL}/lectura-parcial/${lectura.idlectura}`, lecturaParaActualizar);
    };
    

    const registrarPago = async (lectura, cuotaIngresada, moraIngresada, excesoIngresado) => {
        // Registrar el pago para la lectura
        await axios.post(`${API_URL}/pagos`, {
            idlectura: lectura.idlectura,
            mes: lectura.mes, // Usar los valores de mes y año correctos de la lectura
            año: lectura.año,
            fecha: new Date(),
            concepto: 'Pago Parcial',
            cuota: cuotaIngresada,
            mora: moraIngresada,
            exceso: excesoIngresado,
            monto_exceso: excesoIngresado, // Guardar cuánto se pagó del exceso
            total: cuotaIngresada + moraIngresada + excesoIngresado
        });
    };
    
    const handlePagoParcialPagarClick = async () => {
        // Validar que se haya ingresado un valor recibido en valorRecibidoParcial
        if (!valorRecibidoParcial || parseFloat(valorRecibidoParcial) <= 0) {
            toast.error('Debe ingresar un monto válido para realizar el pago');
            return;
        }

        const valorRecibidoNum = parseFloat(valorRecibidoParcial) || 0;

        if (valorRecibidoNum < totalToPay) {
            toast.error('El valor recibido no cubre el total a pagar.'); // Muestra un mensaje de error si no es suficiente
            return; // Detener el pago si el valor es insuficiente
        }
    
        setLoadingPayment(true); // Establece el estado de cargando en true
    
        try {
            // Iterar sobre las lecturas de abajo hacia arriba para actualizarlas
            for (let i = lecturas.length - 1; i >= 0; i--) {
                const lectura = lecturas[i];
    
                const cuotaIngresada = parseFloat(getPagoForLectura(lectura.idlectura, 'cuotaPago')) || 0;
                const moraIngresada = parseFloat(getPagoForLectura(lectura.idlectura, 'moraPago')) || 0;
                const excesoIngresado = parseFloat(getPagoForLectura(lectura.idlectura, 'excesoPago')) || 0;
    
                // Calcular el nuevo Monto Acumulado basado en lo que se muestra en la tabla
                const montoAcumuladoActual = parseFloat(lectura.montoAcumulado);
    
                await registrarPago(lectura, cuotaIngresada, moraIngresada, excesoIngresado);
    
                // Actualizar la lectura, incluyendo el nuevo valor del monto_acumulado
                await actualizarLectura(lectura, cuotaIngresada, moraIngresada, excesoIngresado, montoAcumuladoActual);
                
                // Solo actualizar las lecturas que tienen pagos (cuota, mora, exceso mayores a 0)
                // if (cuotaIngresada > 0 || moraIngresada > 0 || excesoIngresado > 0) {
                //     // Registrar el pago
                //     await registrarPago(lectura, cuotaIngresada, moraIngresada, excesoIngresado);
    
                //     // Actualizar la lectura, incluyendo el nuevo valor del monto_acumulado
                //     await actualizarLectura(lectura, cuotaIngresada, moraIngresada, excesoIngresado, montoAcumuladoActual);
                // }

            }
    
            toast.success('Pagos parciales actualizados correctamente');
            setShowModalPagoParcial(false);
            setShowPagoParcialModal(false);
            handlePagoExitoso(); // Función que actualiza la vista de lecturas
            handleReset(); // Volver a buscar las lecturas después del pago
        } catch (error) {
            console.error('Error al procesar el pago parcial:', error);
            toast.error('Error al procesar el pago parcial');
        } finally {
            setLoadingPayment(false); // Establece el estado de cargando en false cuando termine el proceso
        }
    };
    
    const handleModalClose = () => {
        setShowModal(false);
        setShowAdvancePaymentModal(false);
    };
    
    const handleValorRecibidoChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar solo números y punto decimal
        
        if (regex.test(value)) {
            const valorRecibidoNum = parseFloat(value) || 0;  // Convertir el valor recibido a número
            setValorRecibido(value);  // Actualizar el estado con el valor ingresado
    
            // Calcular el cambio restando el monto a pagar del valor recibido
            const cambioCalculado = valorRecibidoNum - montoPagar;
    
            // Si el cambio es negativo, lo establecemos en 0, de lo contrario, mostramos el cambio
            setCambio(cambioCalculado >= 0 ? cambioCalculado.toFixed(2) : '0.00');
        }
    };

    const handleValorRecibidoParcialChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar solo números y punto decimal
        
        if (regex.test(value)) {
            const valorRecibidoNum = parseFloat(value) || 0;  // Convertir el valor recibido a número
            setValorRecibidoParcial(value);  // Actualizar el estado con el valor ingresado
    
            // Calcular el cambio restando el monto a pagar del valor recibido
            const cambioCalculado = valorRecibidoNum - totalToPay;
    
            // Si el cambio es negativo, lo establecemos en 0, de lo contrario, mostramos el cambio
            setCambioParcial(cambioCalculado >= 0 ? cambioCalculado.toFixed(2) : '0.00');
        }
    };

    const handleValorRecibidoAdelantadoChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/; // Validar solo números y punto decimal
        
        if (regex.test(value)) {
            const valorRecibidoNum = parseFloat(value) || 0;  // Convertir el valor recibido a número
            setValorRecibidoAdelantado(value);  // Actualizar el estado con el valor ingresado
    
            // Calcular el cambio restando el monto a pagar del valor recibido
            const cambioCalculado = valorRecibidoNum - totalToPay;
    
            // Si el cambio es negativo, lo establecemos en 0, de lo contrario, mostramos el cambio
            setCambioAdelantado(cambioCalculado >= 0 ? cambioCalculado.toFixed(2) : '0.00');
        }
    };
    
    const handleConceptoPagoChange = () => {
        // Mapear los meses seleccionados a sus nombres
        const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
        // Convertir los meses seleccionados en un formato manejable y ordenarlos
        const sortedSelectedMonths = selectedMonths
            .map(monthStr => {
                const [year, month] = monthStr.split('-').map(Number);
                return { year, month };
            })
            .sort((a, b) => (a.year - b.year) || (a.month - b.month));
    
        // Generar el concepto de pago, uniendo los meses y años seleccionados
        const conceptoPago = sortedSelectedMonths
            .map(({ year, month }) => `${mesesNombres[month - 1]} ${year}`) // Formateamos "Mes Año"
            .join(', '); // Unimos todos los meses seleccionados con comas
    
        // Establecer el concepto del pago en el estado
        setConceptoPago(`Pagos adelantados para ${conceptoPago}`);
    };
    
    // Llama a handleConceptoPagoChange en el momento adecuado, por ejemplo, cuando se seleccionan los meses
    useEffect(() => {
        handleConceptoPagoChange();
    }, [selectedMonths]); // Ejecutar cuando los meses seleccionados cambien
  
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
        setCambio('0.00'); 
        setValorRecibido('');
    
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
    
        handleReset();
        // Volver a buscar las lecturas después del pago
        await fetchLecturas(selectedServicio.idservicio);
        handlePagoExitoso();
        
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

    useEffect(() => {
        // Sumar la columna total_mensual + monto_exceso para todas las lecturas visibles
        const totalSum = currentLecturas.reduce((acc, lectura) => {
            const totalMensual = parseFloat(lectura.cuota_mensual) || 0;
            const montoExceso = parseFloat(lectura.monto_exceso) || 0;
            return acc + totalMensual + montoExceso;
        }, 0);
        
        // Actualizar el estado montoPagar con la suma
        setMontoPagar(totalSum);
    }, [currentLecturas]);

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
        // Combinamos lecturas pagadas y pagos adelantados en un solo array
        const combinedPayments = [
            ...lecturasPagadas.map(lp => ({ año: parseInt(lp.año), mes: parseInt(lp.mes) })), // Convertimos año y mes a enteros
            ...pagosAdelantados.map(pa => ({ año: parseInt(pa.año), mes: parseInt(pa.mes) })) // Convertimos año y mes a enteros
        ];
    
        console.log('Combinación de pagos (convertido a enteros):', combinedPayments);
    
        // Verificamos si existe una lectura pagada o un pago adelantado para ese año y mes
        return combinedPayments.some(payment => payment.año === parseInt(year) && payment.mes === parseInt(month));
    };
    
    const isAdvancePaymentDone = (year, month) => {
        // Verifica si un pago adelantado ya existe para ese año y mes
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
        // Combinamos lecturas pagadas y pagos adelantados
        const combinedPayments = [
            ...lecturasPagadas.map(lp => ({ year: parseInt(lp.año), month: parseInt(lp.mes) })),
            ...pagosAdelantados.map(pa => ({ year: parseInt(pa.año), month: parseInt(pa.mes) }))
        ];
    
        if (combinedPayments.length === 0) return null;
    
        // Ordenar lecturas pagadas y pagos adelantados por año y mes de forma descendente
        const sortedPayments = combinedPayments.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    
        // Retornar el último mes pagado o adelantado
        return { year: sortedPayments[0].year, month: sortedPayments[0].month };
    };
    
    const isMonthSelectable = (year, month) => {
        const lastPaidMonth = getLastPaidMonth();
    
        // Si el mes ya ha sido pagado o tiene un pago adelantado, deshabilitar
        if (isMonthPaid(year, month) || isAdvancePaymentDone(year, month)) {
            return false;
        }
    
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
    
        // Obtener el último mes pagado (ya sea por adelantado o lecturas pagadas)
        const lastPaidMonth = getLastPaidMonth(); // Modificar esta función para considerar tanto lecturas pagadas como pagos adelantados
        
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
        // Si no hay mes previo, simplemente aceptamos el próximo mes como válido
        if (!prevMonth) {
            return true; // Si no existe un mes anterior, no hay restricción de consecutividad
        }
    
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
        const concepto = generateConceptoPago();
        setConceptoPago(concepto);
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
        setValorRecibido('');
        setCambio('0.00');
        setConceptoPago('');

    };
    
    const handlePagoModalClick = async () => {
        const totalConDescuento = totalToPay - discount;  // Total con el descuento aplicado
    
        // Validar que se haya ingresado un valor válido
        if (!valorRecibidoAdelantado || parseFloat(valorRecibidoAdelantado) <= 0) {
            toast.error('Debe ingresar un monto válido para realizar el pago');
            return;
        }
    
        // Validar que el valor recibido sea suficiente para cubrir el monto total a pagar (con el descuento)
        if (parseFloat(valorRecibidoAdelantado) < totalConDescuento) {
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
            // Iterar sobre los meses seleccionados para registrar los pagos adelantados
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
            
            // Limpiar estados
            setSelectedMonths([]);  // Limpiar los meses seleccionados
            setTotalToPay(0);       // Reiniciar el total a pagar
            setDiscount(0);         // Reiniciar el descuento
            setValorRecibido('');   // Limpiar el valor recibido
            setCambio('0.00');      // Limpiar el cambio
            setConceptoPago('');    // Limpiar el concepto
    
            setShowModalPagoAdelantado(false);  // Cerrar el modal
            await fetchLecturasYPagos(filteredServicio.idservicio); // Actualizar lecturas y pagos
            setShowAdvancePaymentModal(true);  // Volver a abrir el modal de pagos adelantados
        } catch (error) {
            console.error('Error al registrar los pagos adelantados:', error);
            toast.error('Error al registrar los pagos adelantados');
        } finally {
            setLoadingPayment(false);  // Desbloquear el botón
        }
    };

    // Luego definir la función handleCuotaInputChange
    const handleCuotaInputChange = (e, idlectura) => {
        const nuevaCuotaIngresada = parseFloat(e.target.value) || 0;

        // Actualizar solo la lectura específica sin alterar los demás valores de la fila
        const updatedLecturas = lecturas.map((lect) => {
            if (lect.idlectura === idlectura) {
                const nuevaMoraCalculada = calcularNuevaMora(lect.cuota, nuevaCuotaIngresada, lect.porcentaje_acumulado);

                // Actualizamos solo la cuota y la mora, manteniendo los demás valores como están
                return {
                    ...lect,
                    cuotaIngresada: nuevaCuotaIngresada, // Actualizamos la cuota ingresada
                    nuevaMora: nuevaMoraCalculada // Recalculamos la mora
                };
            }
            return lect; // Mantener el resto de las lecturas sin cambios
        });

        setLecturas(updatedLecturas); // Actualizamos el estado sin sobrescribir otros campos
    };

    const getMonthName = (monthNumber) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[monthNumber - 1]; // Restar 1 porque los meses en el array son 0-indexados
    };
    
    const showEfectuarPagoParcialClick = () => {
        if (totalPago === 0) {
            toast.error('No se ha ingresado ninguna cantidad para pagar.');
            return;
        }
    
        // Variables de control para verificar si las filas anteriores están completamente cubiertas
        let cuotasCompletas = true;
        let moraCompleta = true;
    
        for (let i = 0; i < lecturas.length; i++) {
            const lectura = lecturas[i];
            const cuotaPago = parseFloat(getPagoForLectura(lectura.idlectura, 'cuotaPago')) || 0;
            const moraActual = parseFloat(lectura.monto_mora) || 0;
            const moraPago = parseFloat(getPagoForLectura(lectura.idlectura, 'moraPago')) || 0;
    
            // Validar que las cuotas y moras de las filas anteriores estén completamente cubiertas
            if (!cuotasCompletas || !moraCompleta) {
                // Si una fila previa no está completamente pagada, no permitir pagos en filas más recientes
                if (cuotaPago > 0 || moraPago > 0) {
                    toast.error(`Debe completar los pagos de ${lecturas[i - 1].año} ${lecturas[i - 1].mes} antes de continuar.`);
                    return;
                }
            }
    
            // Validar si la cuota tiene un pago pero no se ha cubierto la mora de la misma fila
            if (cuotaPago > 0 && moraActual > 0) {
                if (moraPago === 0) {
                    toast.error(`Debe ingresar un monto en el campo de mora para ${lectura.año} ${lectura.mes}.`);
                    return;
                } else if (moraPago !== moraActual) {
                    toast.error(`El monto ingresado en mora para ${lectura.año} ${lectura.mes} debe ser igual a Q.${moraActual.toFixed(2)}.`);
                    return;
                }
            }
    
            // Actualizar las banderas para cuotas y moras completas
            cuotasCompletas = cuotaPago === lectura.cuota; // Se completa si la cuota está totalmente cubierta
            moraCompleta = moraPago === moraActual; // Se completa si la mora está completamente cubierta
        }
    
        // Si pasa todas las validaciones, proceder con el pago
        const conceptoGenerado = generateConceptoPagoParcial();
        setConceptoPago(conceptoGenerado);
        setTotalToPay(totalPago);
        setShowModalPagoParcial(true);
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
                            <label>Total: Q. {montoPagar.toFixed(2)}</label>
                        </div>
                        {/* Mostrar lecturas en una tabla */}
                        <div className="lecturas-table">
                            <table className="lecturas-data-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Lectura</th>
                                        <th>Cuota</th>
                                        <th>% Mora</th>
                                        <th>Monto Mora</th>
                                        <th>Total Mensual</th>
                                        <th>Monto Acumulado</th>
                                        <th>Exceso</th>
                                        <th>Monto Exceso</th>
                                        {/* <th>Total Excesos</th> */}
                                        {/* <th>Suma Total</th> */}
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
                                            const porcentajeMora = `${(lectura.porcentaje_acumulado * 1).toFixed(0)}%`;
                                            return (
                                                <tr key={lectura.idlectura}>
                                                    <td>{mesNombre} {lectura.año}</td>
                                                    <td>{lectura.lectura}</td>
                                                    <td>{lectura.cuota}</td>
                                                    <td>{porcentajeMora}</td>
                                                    <td>{lectura.monto_mora}</td>
                                                    <td>{lectura.cuota_mensual}</td>
                                                    <td>{lectura.monto_acumulado}</td>
                                                    <td>{lectura.exceso}</td>
                                                    <td>{lectura.monto_exceso}</td>
                                                    {/* <td>{lectura.total}</td> */}
                                                    {/* <td>{lectura.suma_total}</td> */}
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
                                        <th>Lectura</th>
                                        <th>Cuota</th>
                                        <th>% Mora</th>
                                        <th>Monto Mora</th>
                                        <th>Nueva Mora</th>
                                        <th>Total Mensual</th>
                                        <th>Monto Acumulado</th>
                                        <th>Monto Exceso</th>
                                        <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lecturas.map((lectura, index) => {
                                            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                            const mesNombre = meses[lectura.mes - 1];

                                            const cuotaPago = parseFloat(getPagoForLectura(lectura.idlectura, 'cuotaPago')) || 0;
                                            const moraPago = parseFloat(getPagoForLectura(lectura.idlectura, 'moraPago')) || 0;
                                            const excesoPago = parseFloat(getPagoForLectura(lectura.idlectura, 'excesoPago')) || 0;
                                            const totalFila = cuotaPago + moraPago + excesoPago;
                                            const cuotaIngresada = lectura.cuotaIngresada || 0;  // Valor por defecto para cuota ingresada
                                            
                                            //const nuevaMora = lectura.nuevaMora !== undefined ? lectura.nuevaMora : calcularNuevaMora(lectura.cuota, cuotaIngresada, lectura.porcentaje_acumulado);  // Recalcular si no existe aún
                                            const nuevaMora = calcularNuevaMora(lectura.cuota, cuotaPago, lectura.porcentaje_acumulado); 
                                            const totalMensual = parseFloat(lectura.cuota_mensual) - cuotaPago - moraPago + nuevaMora;

                                            let montoAcumulado = totalMensual + nuevaMora;
                                            if (index < lecturas.length - 1) {
                                                const filaAnterior = lecturas[index + 1];
                                                montoAcumulado += filaAnterior.montoAcumulado;
                                            }

                                            // Asignar el monto acumulado calculado a la fila actual
                                            lectura.montoAcumulado = montoAcumulado;
                                            // La función de cálculo de mora
                                            // Definir primero la función calcularNuevaMora
                                            console.log("Valor de Nueva Mora para lectura", lectura.idlectura, ":", nuevaMora);

                                            return (
                                                <tr key={lectura.idlectura}>
                                                    <td>{mesNombre} {lectura.año}</td>
                                                    <td>{lectura.lectura}</td>
                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.cuota}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                placeholder="Pago Cuota"
                                                                value={getPagoForLectura(lectura.idlectura, 'cuotaPago') || ''} 
                                                                onChange={(e) => handleInputValidation(e, lectura.cuota, lectura.idlectura, 'cuotaPago')}
                                                                //onChange={(e) => handleCuotaInputChange(e, lectura.idlectura)}
                                                                readOnly={lectura.cuota === 0}
                                                                style={{ backgroundColor: lectura.cuota === 0 ? 'lightgrey' : 'white' }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>{lectura.porcentaje_acumulado}</td>
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
                                                    <td>{nuevaMora.toFixed(2)}</td>
                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.cuota_mensual}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                value={totalMensual.toFixed(2)}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="two-cells">
                                                            <span className="cell-value">{lectura.monto_acumulado}</span>
                                                            <input
                                                                type="text"
                                                                className="cell-input"
                                                                value={montoAcumulado.toFixed(2)}
                                                                readOnly
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
                            <button onClick={showEfectuarPagoParcialClick}>Pagar</button>
                            <button onClick={handlePagoParcialModalClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showModalPagoParcial && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <h2>Pago Parcial</h2>

                            <label>Monto a Pagar:</label>
                            <p>Q.{totalToPay.toFixed(2)}</p> {/* Muestra el total parcial calculado */}
                            
                            <label>Valor Recibido:</label>
                            <input
                                type="text"
                                value={valorRecibidoParcial}
                                onChange={handleValorRecibidoParcialChange}
                                placeholder="Q.0.00"
                                className="valor"
                                inputMode="decimal"
                            />

                            <label>Cambio:</label>
                            <p className="cambio">Q.{cambioParcial}</p> {/* Muestra el cambio calculado */}

                            <label>Concepto del Pago:</label>
                            <input
                                type="text"
                                value={conceptoPago}  // Mostrar el concepto generado
                                onChange={(e) => setConceptoPago(e.target.value)} // Permitir editar el concepto si es necesario
                                placeholder="Pago parcial"
                                className="concepto"
                            />

                            <div className="modal-buttons">
                                <button onClick={handlePagoParcialPagarClick} disabled={loadingPayment}>
                                    {loadingPayment ? 'Pagando...' : 'Pagar'}
                                </button>
                                <button onClick={handleModalPagoParcialClose}>Cancelar</button>
                            </div>
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
                                value={valorRecibidoAdelantado}
                                onChange={handleValorRecibidoAdelantadoChange}
                                placeholder="Q.0.00"
                                className="valor"
                                inputMode="decimal"
                            />

                            <label>Cambio:</label>
                            <p className="cambio">Q.{cambioAdelantado}</p> {/* Muestra el cambio calculado */}

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